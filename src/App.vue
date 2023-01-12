<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { useIpcRendererOn } from "@vueuse/electron";
import {useRouter} from "vue-router";

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()
router.push('/config')

console.log("[App.vue]", `Hello world from Electron ${process.versions.electron}!`)

useIpcRendererOn('router:path', (event, ...args) => {
  router.push(args[0])
})
</script>

<template>
  <router-view></router-view>
</template>

<style>
</style>
