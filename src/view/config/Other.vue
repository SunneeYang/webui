<template>

  <el-form :model="other_form" label-position="top">
    <el-form-item label="Pipeline">
      <el-input v-model="other_form.pipeline" @change="OnPipelineChange"/>
    </el-form-item>

    <el-form-item label="Realm Strategy">
      <el-select v-model="other_form.realm.strategy" @change="OnRealmStrategyChange">
        <el-option v-for="i in realm_strategy" :value="i"/>
      </el-select>
    </el-form-item>
  </el-form>

</template>

<script lang="ts" setup>

import {OtherCfg} from "../../module/definition";
import {Ref, ref, watch} from "vue";

const props = defineProps<{ other: OtherCfg }>()
const emit = defineEmits(['change'])

const other_form: Ref<OtherCfg> = ref<OtherCfg>({realm: {strategy: ''}, pipeline: ''});
const realm_strategy = ['Debug', 'Local', 'Platform']

watch(props, () => {
  other_form.value.pipeline = props.other.pipeline
  other_form.value.realm.strategy = props.other.realm.strategy
})

function OnPipelineChange() {
  OnChange()
}

function OnRealmStrategyChange() {
  OnChange()
}

function OnChange() {
  emit('change', other_form.value)
}

</script>

<style scoped>

</style>