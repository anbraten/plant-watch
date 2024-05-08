import { PutObjectCommand } from '@aws-sdk/client-s3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  if (!config.apiToken || token !== config.apiToken) {
    throw createError({
      status: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const data = await readRawBody(event, false);
  if (!data) {
    throw createError({
      status: 400,
      statusMessage: 'No file uploaded',
    });
  }

  const s3 = useS3();
  await s3.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: `${Date.now()}.jpg`,
      Body: data,
    }),
  );

  await cleanupImages(event);

  return {
    ok: 'true',
  };
});
