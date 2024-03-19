<template>
  <ElButton @click="handleReadFolderSVG">选择文件夹</ElButton>
  <ElImage v-for="svg in svgFiles" :key="svg" :src="`svg://${svg}`"></ElImage>
</template>
<script setup lang="ts">
import { shallowRef } from 'vue';
import { readFolderSVG } from '#preload';

const svgFiles = shallowRef<string[]>([]);

const handleReadFolderSVG = async () => {
  const value = await readFolderSVG();
  console.log(value);

  svgFiles.value = value || [];
};
</script>

