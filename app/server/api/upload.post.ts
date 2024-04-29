import fs from 'node:fs/promises';
import path from 'node:path';

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

  await fs.writeFile(path.join(config.dataPath, `${Date.now()}.jpg`), data);

  return {
    ok: 'true',
  };
});
