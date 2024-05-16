<template>
  <div>
    <ElButton @click="handleReadFolderSVG">选择文件夹</ElButton>
  </div>
  <div v-for="svg in svgFiles" :key="svg.path" class="item">
    <ElImage
      :src="svg.path"
      :previewSrcList="previewSrcList"
      fit="contain"
      style="width: 100px; height: 100px"
    ></ElImage>
    <div>
      <ElButton type="danger">删除</ElButton>
      <ElButton type="success" @click="handleWriteClipboard(svg.basename)">复制</ElButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, shallowRef } from 'vue';
import { readFolderSVG, onOpenSVG } from '#preload';

type A = Awaited<ReturnType<typeof readFolderSVG>>;

const svgFiles = shallowRef<NonNullable<A>>([]);
const previewSrcList = shallowRef<string[]>([]);

const handleReadFolderSVG = async () => {
  const value = await readFolderSVG();
  if (value) {
    svgFiles.value = value.map((svg) => ({ basename: svg.basename, path: `svg://${svg.path}` }));
    previewSrcList.value = value.map((svg) => `svg://${svg.path}`);
  }
};

const handleWriteClipboard = (name: string) => {
  navigator.clipboard.writeText(name);
};

const openSVG = (path: string) => {
  console.log(path);

  svgFiles.value = [{ path: path, basename: '' }];
  previewSrcList.value = [`svg://${path}`];
};

onOpenSVG(openSVG);

onMounted(() => {
  //
});
</script>
<style>
body {
  /* background-image: linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.4) 25%,
      transparent 25%,
      transparent 75%,
      rgba(0, 0, 0, 0.4) 75%
    ),
    linear-gradient(45deg, rgba(0, 0, 0, 0.4) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.4) 75%);
  background-position: 0 0, 5px 5px;
  background-size: 12px 12px; */
}

.item {
  display: inline-block;
}
</style>
