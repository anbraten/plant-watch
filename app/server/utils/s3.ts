import { S3Client } from '@aws-sdk/client-s3';

export function useS3() {
  const config = useRuntimeConfig();

  const s3client = new S3Client({
    endpoint: config.s3.endpoint,
    credentials: {
      accessKeyId: config.s3.accessKey,
      secretAccessKey: config.s3.secretKey,
    },
    region: config.s3.region,
    forcePathStyle: true,
  });

  return s3client;
}
