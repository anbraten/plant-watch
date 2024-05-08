<template>
  <div class="w-full h-screen flex items-center justify-center">
    <div class="flex flex-col gap-4 items-center w-full max-w-4xl">
      <h1 class="text-2xl mb-4 text-gray-600">{{ title }}</h1>

      <div class="ml-auto flex gap-2 items-center">
        <span v-if="hud">{{ cursorPosition }}</span>
        <button
          class="border-2 bg-gray-300 rounded-md px-2 py-1 hover:border-gray-500"
          :class="{ 'border-green-400': hud, 'border-gray-400': !hud }"
          @click="hud = !hud"
        >
          Toggle HUD
        </button>
      </div>

      <div v-if="selectedPhoto" ref="imageBox" class="relative w-full rounded-lg overflow-hidden image shadow-md">
        <img :src="selectedPhoto.url" alt="timelapse photo of my plants" class="w-full h-auto object-cover" />
        <canvas ref="canvas" class="absolute top-0 left-0 w-full h-full" />
      </div>

      <input
        v-model="selectedPhotoIndex"
        type="range"
        :min="0"
        :max="photos.length - 1"
        class="w-full h-1 bg-gray-100 rounded-lg appearance-none accent-green-400 cursor-pointer"
      />

      <span class="ml-auto">{{ selectedPhotoDate }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';

const { data: photos, refresh } = await useFetch('/api/photos', {
  default: () => [],
});

const title = computed(() => document?.title);

const selectedPhotoIndex = ref(photos.value.length - 1);
const selectedPhoto = computed(() => photos.value[selectedPhotoIndex.value] ?? undefined);
const selectedPhotoDate = computed(() =>
  selectedPhoto.value ? new Date(selectedPhoto.value?.timestamp).toLocaleString() : undefined,
);

const imageBox = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();

const percentToPixel = (x: number, max: number) => (x / 100) * max;

const cursorPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 });

window?.addEventListener('mousemove', (e) => {
  const canvasBounds = canvas.value?.getBoundingClientRect();
  if (!canvasBounds) return;
  const { width: w, height: h, left: l, top: t } = canvasBounds;
  cursorPosition.value = {
    x: Math.round(((e.clientX - l) / w) * 100),
    y: Math.round(((e.clientY - t) / h) * 100),
  };
});

const hud = useLocalStorage('hud', false);

const plants = ref<
  { name: string; color: string; center: { x: number; y: number }; box: { x: number; y: number }[] }[]
>([
  {
    name: 'Kohlrabi',
    center: { x: 34, y: 25 },
    color: 'rgba(0, 255, 0, 0.15)',
    box: [
      { x: 18, y: 17 }, // top left
      { x: 18, y: 45 }, // bottom left
      { x: 46, y: 35 }, // bottom right
      { x: 45, y: 17 }, // top right
    ],
  },
  {
    name: 'Salat',
    center: { x: 42, y: 58 },
    color: 'rgba(0, 0, 255, 0.15)',
    box: [
      { x: 15, y: 50 }, // top left
      { x: 15, y: 60 }, // bottom left
      { x: 65, y: 80 }, // bottom right
      { x: 52, y: 35 }, // top right
    ],
  },
  {
    name: 'Erdbeere',
    center: { x: 32, y: 78 },
    color: 'rgba(255, 0, 0, 0.15)',
    box: [
      { x: 15, y: 60 }, // top left
      { x: 15, y: 90 }, // bottom left
      { x: 40, y: 90 }, // bottom right
      { x: 60, y: 80 }, // top right
    ],
  },
  {
    name: 'Radieschen',
    center: { x: 43, y: 96 },
    color: 'rgba(255, 0, 100, 0.15)',
    box: [
      { x: 10, y: 95 }, // top left
      { x: 10, y: 100 }, // bottom left
      { x: 70, y: 100 }, // bottom right
      { x: 75, y: 80 }, // top right
    ],
  },
  {
    name: 'Rabarber',
    center: { x: 89, y: 92 },
    color: 'rgba(255, 255, 0, 0.2)',
    box: [
      { x: 71, y: 100 }, // top left
      { x: 76, y: 86 }, // bottom left
      { x: 93, y: 82 }, // bottom right
      { x: 100, y: 83 }, // bottom right
      { x: 100, y: 100 }, // top right
      { x: 0, y: 100 },
      { x: 0, y: 95 },
      { x: 5, y: 94 },
      { x: 12, y: 100 },
    ],
  },
]);

const privacyArea = ref([
  [57, 56],
  [70, 55],
  [69, 30],
  [86, 27],
  [100, 26],
  [100, 83],
  [93, 82],
  [88, 84],
  [80, 85],
  [72, 86],
  [64, 79],
]);

function draw() {
  if (!canvas.value || !imageBox.value) {
    return;
  }
  const { width: w, height: h } = imageBox.value.getBoundingClientRect();
  canvas.value.width = w;
  canvas.value.height = h;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.beginPath();
  ctx.moveTo(percentToPixel(privacyArea.value[0][0], w), percentToPixel(privacyArea.value[0][1], h));
  for (const point of privacyArea.value.slice(1)) {
    ctx.lineTo(percentToPixel(point[0], w), percentToPixel(point[1], h));
  }
  ctx.fill();
  ctx.stroke();

  if (hud.value) {
    for (const plant of plants.value) {
      ctx.fillStyle = plant.color;
      ctx.beginPath();
      const firstPoint = plant.box[0];
      ctx.moveTo(percentToPixel(firstPoint.x, w), percentToPixel(firstPoint.y, h));
      for (const point of plant.box.slice(1)) {
        ctx.lineTo(percentToPixel(point.x, w), percentToPixel(point.y, h));
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.fillText(plant.name, percentToPixel(plant.center.x, w), percentToPixel(plant.center.y, h));
    }
  }
}

onMounted(async () => {
  draw();

  setInterval(async () => {
    await refresh();
    selectedPhotoIndex.value = photos.value.length - 1;
  }, 1000 * 60); // refresh every minute
});

watch([plants, hud], draw);
</script>

<style>
body {
  @apply bg-gray-200;
}

.image {
  aspect-ratio: 4/3;
}

.image img {
  rotate: 180deg;
}
</style>
