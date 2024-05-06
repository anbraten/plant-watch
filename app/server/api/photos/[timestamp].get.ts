import { GetObjectCommand } from '@aws-sdk/client-s3';

export default defineEventHandler(async (event) => {
  const timestamp = getRouterParam(event, 'timestamp');
  if (!timestamp) {
    throw createError({
      status: 400,
      message: 'Timestamp is required',
    });
  }

  const config = useRuntimeConfig(event);

  const s3 = useS3();
  const { Body } = await s3.send(
    new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: `${timestamp}.jpg`,
    }),
  );

  try {
    return Body;
  } catch {
    throw createError({
      status: 404,
      message: 'Image not found',
    });
  }
});
