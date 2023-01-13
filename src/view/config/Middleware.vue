<template>
  <el-tabs v-model="cfg_middleware_current" editable tab-position="left" @edit="OnMiddlewareTabsEdit"
           @tab-change="OnMiddlewareTabsChange">
    <el-tab-pane
        v-for="cfg in cfg_middleware"
        :key="cfg.name"
        :label="cfg.name"
        :name="cfg.name"
    >
      <el-form ref="formRef" :model="cfg_middleware_form" label-width="90px">
        <el-form-item label="Type" required>
          <el-select v-model="cfg_middleware_form.type">
            <el-option
                v-for="item in MiddlewareTypes"
                :key="item.label"
                :disabled="item.disabled"
                :label="item.label"
                :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Name" required>
          <el-input v-model="cfg_middleware_form.name"/>
        </el-form-item>
        <el-form-item label="Config">
          <el-input v-model="cfg_middleware_form.config" autosize type="textarea"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="OnMiddlewareSave">确定</el-button>
          <el-button @click="OnMiddlewareCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import {ref, Ref, watch} from "vue";
import {MiddlewareCfg} from "../../module/definition";
import {ElMessage} from "element-plus";

const props = defineProps<{ middleware: MiddlewareCfg[] }>()
const emit = defineEmits(['submit', 'remove'])

const MiddlewareTypes = [
  {label: 'U8Server'},
  {label: 'Etcd'},
  {label: 'Prometheus'},
  {label: 'Kafka', disabled: true},
  {label: 'Apm', disabled: true},
]

const cfg_middleware: Ref<MiddlewareCfg[]> = ref([])
const cfg_middleware_current = ref("")
let cfg_middleware_index = 0
const cfg_middleware_form: Ref<MiddlewareCfg> = ref({type: '', name: '', config: ''});

watch(props, () => {
  cfg_middleware.value = props.middleware

  const exist = cfg_middleware.value.filter(m => m.name == cfg_middleware_current.value)
  if (exist.length == 0) {
    cfg_middleware_current.value = cfg_middleware.value[0]?.name ?? ""
  }

  OnMiddlewareCancel()
})

function OnMiddlewareTabsEdit(targetName: string, action: 'remove' | 'add') {
  switch (action) {
    case "remove":
      // remove current tab
      let activeName = cfg_middleware_current.value
      if (targetName == activeName) {
        // find next tab
        const tabs = cfg_middleware.value
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }

      emit('remove', targetName)

      cfg_middleware_current.value = activeName

      break;

    case "add":
      const newTabName = `Config${++cfg_middleware_index}`
      cfg_middleware.value.push({
        type: '',
        name: newTabName,
        config: '',
      })
      cfg_middleware_current.value = newTabName
      break;
  }
}

function OnMiddlewareTabsChange(name: string) {
  cfg_middleware.value.forEach((tab, index) => {
    if (tab.name == name) {
      cfg_middleware_form.value.type = tab.type
      cfg_middleware_form.value.name = tab.name
      cfg_middleware_form.value.config = tab.config
      return
    }
  })
}

function OnMiddlewareSave() {
  let cur_index = -1
  let unique_name = true
  cfg_middleware.value.forEach((tab, index) => {
    if (!unique_name) {
      return
    }
    if (tab.name == cfg_middleware_form.value.name && tab.name != cfg_middleware_current.value) {
      unique_name = false
    }
    if (tab.name == cfg_middleware_current.value) {
      cur_index = index
    }
  })

  if (!unique_name) {
    ElMessage({
      message: '中间件名称重复',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
  }

  if (cur_index >= 0) {
    const newConfig = cfg_middleware.value[cur_index]
    newConfig.type = cfg_middleware_form.value.type
    newConfig.name = cfg_middleware_form.value.name
    newConfig.config = cfg_middleware_form.value.config
    cfg_middleware_current.value = newConfig.name

    emit('submit', cur_index, newConfig)
  }
}

function OnMiddlewareCancel() {
  cfg_middleware.value.forEach((tab, index) => {
    if (tab.name == cfg_middleware_current.value) {
      cfg_middleware_form.value.type = tab.type
      cfg_middleware_form.value.name = tab.name
      cfg_middleware_form.value.config = tab.config
      return
    }
  })
}
</script>

<style scoped>
.el-tabs--left :deep(.el-tabs__header.is-left) {
  height: 720px;
  overflow-y: auto;
}
</style>