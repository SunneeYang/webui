<template>
  <el-scrollbar height="720px">
    <el-row :gutter="20">
      <el-col v-for="(r, i) in mongodb" :key="r.name" :span="8">
        <el-descriptions :column="1" :title="r.name" border class="mongodb-info">
          <template #extra>
            <el-button-group size="small" type="primary">
              <el-button :icon="Edit" @click="OnEdit(i)"/>
              <el-button :icon="Delete" @click="OnDelete(i)"/>
            </el-button-group>
          </template>
          <el-descriptions-item class-name="mongodb-config" label-class-name="mongodb-label">
            <template #label>
              <div>
                <el-icon>
                  <Paperclip/>
                </el-icon>
                Url
              </div>
            </template>
            {{ r.url }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="mongodb-label">
            <template #label>
              <div>
                <el-icon>
                  <Coin/>
                </el-icon>
                DB
              </div>
            </template>
            {{ r.db }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="mongodb-label">
            <template #label>
              <div>
                <el-icon>
                  <Grid/>
                </el-icon>
                Names
              </div>
            </template>
            <el-popover :width="300" title="模块" trigger="hover">
              <template #reference>
                <div class="mongodb-module">{{ r.names.join(',') }}</div>
              </template>
              <template #default>
                <el-tag v-for="m in r.names" class="model-tag">{{ m }}</el-tag>
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
      :title="mongodb_form.name"
      width="80%"
  >
    <el-form :model="mongodb_form" label-position="left" label-width="120px">
      <el-form-item label="Url">
        <el-input v-model="mongodb_form.url" :prefix-icon="Paperclip"/>
      </el-form-item>
      <el-form-item label="Db">
        <el-input v-model="mongodb_form.db" :prefix-icon="Coin"/>
      </el-form-item>
      <el-form-item label="Names">
        <el-input v-model="mongodb_form.names" :prefix-icon="Grid"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="OnEditConfirm">确认</el-button>
        <el-button @click="OnEditCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>

import {ref, watch} from "vue";
import {Coin, Delete, Edit, Grid, Paperclip} from '@element-plus/icons-vue';
import {MongoDbCfg} from "../../module/definition";

const props = defineProps<{ mongodb: MongoDbCfg[] }>()
const emit = defineEmits(['change'])

interface MongoDbInfo {
  name: string,
  url: string,
  db: string,
  names: string[],
}

const mongodb = ref<MongoDbInfo[]>([])

const mongodb_index = ref(1);
const editor_visible = ref(false);
const mongodb_form = ref({name: '', url: '', db: '', names: ''});
const mongodb_form_index = ref(0);

watch(props, () => {
  mongodb_index.value = 1
  mongodb.value = []
  props.mongodb.forEach(r => {
    mongodb.value.push({
      name: `MongoDB-${mongodb_index.value++}`,
      url: r.url,
      db: r.db,
      names: r.names
    })
  })
})

function OnAdd() {
  mongodb_form_index.value = -1

  mongodb_form.value.name = `MongoDB-${mongodb_index.value}`;
  mongodb_form.value.url = '';
  mongodb_form.value.db = '';
  mongodb_form.value.names = '';

  editor_visible.value = true
}

function OnEdit(index: number) {
  mongodb_form_index.value = index
  const content = mongodb.value[index];

  mongodb_form.value.url = content.url;
  mongodb_form.value.db = content.db;
  mongodb_form.value.names = content.names.join(',');

  editor_visible.value = true
}

function OnDelete(index: number) {
  mongodb.value.splice(index, 1)

  OnChange();
}

function OnEditConfirm() {

  if (mongodb_form_index.value >= 0) {
    const content = mongodb.value[mongodb_form_index.value];
    content.url = mongodb_form.value.url
    content.db = mongodb_form.value.db
    content.names = mongodb_form.value.names.split(',')
  } else {
    mongodb.value.push({
      name: mongodb_form.value.name,
      url: mongodb_form.value.url,
      db: mongodb_form.value.db,
      names: mongodb_form.value.names.split(',')
    })
    mongodb_index.value++;
  }

  OnChange();

  editor_visible.value = false
}

function OnEditCancel() {
  editor_visible.value = false
}

function OnChange() {
  const all_mongodb: MongoDbCfg[] = []
  mongodb.value.forEach(r => {
    all_mongodb.push({
      url: r.url,
      db: r.db,
      names: r.names
    })
  })

  emit('change', all_mongodb)
}

</script>

<style scoped>

:deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}

.el-col {
  margin-bottom: 20px;
}

.mongodb-info :deep(.el-descriptions__title) {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.mongodb-config) {
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.mongodb-label) {
  width: 90px;
}

.mongodb-module {
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