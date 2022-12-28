<script setup lang="ts">
import ExcelConverter from './components/ExcelConverter.vue'
import { useDark, useToggle } from '@vueuse/core'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const isDark = useDark()
const toggleDark = useToggle(isDark)

console.log("[App.vue]", `Hello world from Electron ${process.versions.electron}!`)
</script>

<template>
  <el-config-provider :locale="zhCn">
    <ExcelConverter />
  </el-config-provider>
</template>

<style>
</style>
