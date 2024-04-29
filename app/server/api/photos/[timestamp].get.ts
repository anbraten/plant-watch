import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  const timestamp = getRouterParam(event, 'timestamp');
  if (!timestamp) {
    throw createError({
      status: 400,
      message: 'Timestamp is required',
    });
  }

  const config = useRuntimeConfig(event);
  const image = path.join(config.dataPath, `${timestamp}.jpg`);

  try {
    return await fs.readFile(image);
  } catch {
    throw createError({
      status: 404,
      message: 'Image not found',
    });
  }
});
