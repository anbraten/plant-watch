import { DeleteObjectsCommand, _Object, paginateListObjectsV2 } from '@aws-sdk/client-s3';
import path from 'node:path';
import { type H3Event } from 'h3';

const msToMin = 1000 * 60;
const keepOneImagePerXms = 15 * msToMin; // keep 1 image per x minutes
const keepAllImagesOfLastXms = 15 * msToMin; // keep all images of the last x minutes

export async function cleanupImages(event: H3Event) {
  const config = useRuntimeConfig(event);

  const s3 = useS3();

  const dropObjects: _Object[] = [];
  const keepObjects: _Object[] = [];
  const timestampOfHour = new Map<number, boolean>();
  const now = Date.now();
  for await (const data of paginateListObjectsV2(
    { client: s3 },
    {
      Bucket: config.s3.bucket,
    },
  )) {
    for (const object of data.Contents || []) {
      const timestamp = parseInt(path.parse(object.Key!).name, 10);
      if (now - timestamp < keepAllImagesOfLastXms) {
        keepObjects.push(object);
        continue;
      }

      const timestampIndex = Math.floor(timestamp / keepOneImagePerXms);
      if (timestampOfHour.has(timestampIndex)) {
        dropObjects.push(object); // just keep the first image
      } else {
        keepObjects.push(object);
        timestampOfHour.set(timestampIndex, true);
      }
    }
  }

  if (dropObjects.length > 0) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: config.s3.bucket,
        Delete: {
          Objects: dropObjects.map((object) => ({ Key: object.Key })).slice(0, 500), // limit to 500 objects
        },
      }),
    );
  }

  return {
    keepObjects,
    dropObjects,
  };
}
