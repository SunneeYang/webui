<script setup lang="ts">
import ExcelConverter from './components/ExcelConverter.vue'
import { useDark, useToggle } from '@vueuse/core'
import { useIpcRendererOn } from "@vueuse/electron";
import {useRouter} from "vue-router";
import {ref} from "vue";
import HelloWorld from "./components/HelloWorld.vue";

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()
router.push('/excel')

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
