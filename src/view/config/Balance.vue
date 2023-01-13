<template>
  <el-form :model="cfg_balance_form" label-position="top" label-width="90px">
    <el-form-item label="Hash Slot">
      <el-select v-model="cfg_balance_form.hashslot" multiple style="width: 80%">
        <el-option
            v-for="item in SceneType"
            :key="item"
            :label="item"
            :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="Hash Ring">
      <el-select v-model="cfg_balance_form.hashring" multiple style="width: 80%">
        <el-option
            v-for="item in SceneType"
            :key="item"
            :label="item"
            :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="Random">
      <el-select v-model="cfg_balance_form.random" multiple style="width: 80%">
        <el-option
            v-for="item in SceneType"
            :key="item"
            :label="item"
            :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="OnBalanceSave">确定</el-button>
      <el-button @click="OnBalanceCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import {ref, Ref, watch} from "vue";
import {BalanceCfg, SceneType} from "../../module/definition";

// const props = defineProps(['balance'])
const props = defineProps<{ balance: BalanceCfg }>()
const emit = defineEmits(['submit'])

const cfg_balance_form: Ref<BalanceCfg> = ref({hashring: [], hashslot: [], random: []})

watch(props, () => {
  OnBalanceCancel()
})

function OnBalanceSave() {
  emit('submit', cfg_balance_form.value)
}

function OnBalanceCancel() {
  cfg_balance_form.value.hashslot = props.balance.hashslot
  cfg_balance_form.value.hashring = props.balance.hashring
  cfg_balance_form.value.random = props.balance.random
}
</script>

<style scoped>

</style>