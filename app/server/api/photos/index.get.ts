import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const files = await fs.readdir(config.dataPath);

  const images = files
    .filter((file) => file.endsWith('.jpg'))
    .map((file) => {
      const timestamp = parseInt(path.parse(file).name, 10);
      return {
        timestamp,
        url: `/api/photos/${timestamp}`,
      };
    });

  if (images.length === 0) {
    images.push({
      timestamp: -1,
      url: 'https://images.unsplash.com/photo-1626541517080-3329b485bf0b?q=80&w=1587',
    });
  }

  return images;
});
