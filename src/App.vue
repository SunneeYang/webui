<script setup lang="ts">
import ExcelConverter from './components/ExcelConverter.vue'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)

console.log("[App.vue]", `Hello world from Electron ${process.versions.electron}!`)
</script>

<template>
  <ExcelConverter />
</template>

<style>
</style>
