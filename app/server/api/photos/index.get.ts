import { _Object, paginateListObjectsV2 } from '@aws-sdk/client-s3';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const s3 = useS3();

  let images: { timestamp: number; url: string }[] = [];
  for await (const data of paginateListObjectsV2(
    { client: s3 },
    {
      Bucket: config.s3.bucket,
    },
  )) {
    data.Contents?.forEach((object: _Object) => {
      const timestamp = parseInt(path.parse(object.Key!).name, 10);
      images.push({
        timestamp,
        url: `/api/photos/${timestamp}`,
      });
    });
  }

  if (images.length === 0) {
    images.push({
      timestamp: -1,
      url: 'https://images.unsplash.com/photo-1626541517080-3329b485bf0b?q=80&w=1587',
    });
  }

  return images;
});
