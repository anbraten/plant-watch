<template>
  <div class="w-full h-screen flex items-center justify-center">
    <div class="flex flex-col gap-4 items-center w-full max-w-4xl">
      <h1 class="text-2xl mb-4 text-gray-600">{{ title }}</h1>

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

onMounted(async () => {
  if (canvas.value && imageBox.value) {
    const { width: w, height: h } = imageBox.value.getBoundingClientRect();
    canvas.value.width = w;
    canvas.value.height = h;
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = 'rgb(0 255 0)';
    // ctx.lineWidth = 5;
    const y = 200; // height of plants
    ctx.beginPath();
    ctx.moveTo(0, h - y);
    ctx.lineTo(w, h - y);
    ctx.stroke();
  }

  setInterval(async () => {
    await refresh();
    selectedPhotoIndex.value = photos.value.length - 1;
  }, 1000 * 5);
});
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
