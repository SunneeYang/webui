<template>
  <el-scrollbar height="720px">
    <el-row :gutter="20">
      <el-col v-for="(r, i) in middleware" :key="r.name" :span="8">
        <el-descriptions :column="1" :title="r.name" border class="middleware-info">
          <template #extra>
            <el-button-group size="small" type="primary">
              <el-button :icon="Edit" @click="OnEdit(i)"/>
              <el-button :icon="Delete" @click="OnDelete(i)"/>
            </el-button-group>
          </template>
          <el-descriptions-item class-name="middleware-config" label-class-name="middleware-label">
            <template #label>
              <div>
                <el-icon>
                  <List/>
                </el-icon>
                Type
              </div>
            </template>
            {{ r.type }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="middleware-label">
            <template #label>
              <div>
                <el-icon>
                  <Postcard/>
                </el-icon>
                Name
              </div>
            </template>
            {{ r.name }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="middleware-label">
            <template #label>
              <div>
                <el-icon>
                  <Histogram/>
                </el-icon>
                Config
              </div>
            </template>
            <el-popover :width="450" title="配置" trigger="hover">
              <template #reference>
                <div class="middleware-module">{{ r.config }}</div>
              </template>
              <template #default>
                <p class="model-tag">{{ r.config }}</p>
              </template>
            </el-popover>
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
      <el-col :span="8">
        <el-card class="card-add" shadow="always">
          <el-button bg class="add-btn" link @click="OnAdd">
            <el-icon size="50">
              <Plus/>
            </el-icon>
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </el-scrollbar>

  <el-dialog
      v-model="editor_visible"
      :title="middleware_form.name"
      width="80%"
  >
    <el-form :model="middleware_form" label-position="left" label-width="120px">
      <el-form-item label="Type">
        <el-input v-model="middleware_form.type" :prefix-icon="List"/>
      </el-form-item>
      <el-form-item label="Name">
        <el-input v-model="middleware_form.name" :prefix-icon="Postcard"/>
      </el-form-item>
      <el-form-item label="Config">
        <el-input v-model="middleware_form.config" :autosize="{ minRows: 1, maxRows: 18 }"
                  :prefix-icon="Histogram"
                  placeholder="Please input JSON"
                  type="textarea"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="OnEditConfirm">确认</el-button>
        <el-button @click="OnEditCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>

import {Ref, ref, watch} from "vue";
import {Delete, Edit, Histogram, List, Postcard} from '@element-plus/icons-vue';
import {MiddlewareCfg} from "../../module/definition";
import {ElMessage} from "element-plus";

const props = defineProps<{ middleware: MiddlewareCfg[] }>()
const emit = defineEmits(['change'])

const middleware = ref<MiddlewareCfg[]>([])

const middleware_index = ref(1);
const editor_visible = ref(false);
const middleware_form: Ref<MiddlewareCfg> = ref<MiddlewareCfg>({name: '', type: '', config: ''});
const middleware_form_index = ref(0);

watch(props, () => {
  middleware.value = []
  props.middleware.forEach(m => {
    middleware.value.push({
      type: m.type,
      name: m.name,
      config: m.config,
    })
  })
  middleware_index.value = middleware.value.length + 1
})

function OnAdd() {
  middleware_form_index.value = -1

  middleware_form.value.name = `Middleware-${middleware_index.value}`;
  middleware_form.value.type = '';
  middleware_form.value.config = '';

  editor_visible.value = true
}

function OnEdit(index: number) {
  middleware_form_index.value = index
  const content = middleware.value[middleware_form_index.value];

  middleware_form.value.type = content.type;
  middleware_form.value.name = content.name;
  middleware_form.value.config = content.config;

  editor_visible.value = true
}

function OnDelete(index: number) {
  middleware.value.splice(index, 1)

  OnChange();
}

function OnEditConfirm() {

  // denied default name
  if (/^Middleware-\d+/i.test(middleware_form.value.name)) {
    ElMessage({
      message: '请修改默认名称',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  // check repeat name
  for (const m of middleware.value) {
    if (m.name == middleware_form.value.name) {
      ElMessage({
        message: '名称不唯一',
        type: 'error',
        center: true,
        grouping: true,
        duration: 1000
      })
      return;
    }
  }

  if (middleware_form_index.value >= 0) {
    const content = middleware.value[middleware_form_index.value];
    content.type = middleware_form.value.type;
    content.name = middleware_form.value.name;
    content.config = middleware_form.value.config;
  } else {
    middleware.value.push({
      type: middleware_form.value.type,
      name: middleware_form.value.name,
      config: middleware_form.value.config
    })
    middleware_index.value++;
  }

  OnChange();

  editor_visible.value = false
}

function OnEditCancel() {
  editor_visible.value = false
}

function OnChange() {
  emit('change', middleware.value)
}

</script>

<style scoped>

:deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}

.el-col {
  margin-bottom: 20px;
}

.middleware-info :deep(.el-descriptions__title) {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.middleware-config) {
  max-width: 500px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.middleware-label) {
  width: 90px;
}

.middleware-module {
  max-width: 270px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-tag {
  margin: 2px 2px;
}

.card-add {
  height: 160px;
  min-width: 382px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-btn {
  width: 350px;
  height: 150px;
}

</style>