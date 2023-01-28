<template>
  <el-scrollbar height="720px">
    <el-row :gutter="20">
      <el-col v-for="(r, i) in redis" :key="r.name" :span="6">
        <el-descriptions :column="1" :title="r.name" border class="redis-info">
          <template #extra>
            <el-button-group size="small" type="primary">
              <el-button :icon="Edit" @click="OnEdit(i)"/>
              <el-button :icon="Delete" @click="OnDelete(i)"/>
            </el-button-group>
          </template>
          <el-descriptions-item class-name="redis-config" label-class-name="redis-label">
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
          <el-descriptions-item label-class-name="redis-label">
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
          <el-descriptions-item label-class-name="redis-label">
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
                <div class="redis-module">{{ r.names.join(',') }}</div>
              </template>
              <template #default>
                <el-tag v-for="m in r.names" class="model-tag">{{ m }}</el-tag>
              </template>
            </el-popover>
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
      <el-col :span="6">
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
      :title="redis_form.name"
      width="80%"
  >
    <el-form :model="redis_form" label-position="left" label-width="120px">
      <el-form-item label="Url">
        <el-input v-model="redis_form.url"/>
      </el-form-item>
      <el-form-item label="Db">
        <el-input v-model="redis_form.db"/>
      </el-form-item>
      <el-form-item label="Names">
        <el-input v-model="redis_form.names"/>
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
import {Delete, Edit} from '@element-plus/icons-vue';
import {RedisCfg} from "../../module/definition";

const props = defineProps<{ redis: RedisCfg[] }>()
const emit = defineEmits(['change'])

interface RedisInfo {
  name: string,
  url: string,
  db: number,
  names: string[],
}

const redis = ref<RedisInfo[]>([])

const redis_index = ref(1);
const editor_visible = ref(false);
const redis_form = ref({name: '', url: '', db: 0, names: ''});
const redis_form_index = ref(0);

watch(props, () => {
  redis_index.value = 1
  redis.value = []
  props.redis.forEach(r => {
    redis.value.push({
      name: `Redis-${redis_index.value++}`,
      url: r.url,
      db: r.db,
      names: r.names
    })
  })
})

function OnAdd() {
  redis_form_index.value = -1

  redis_form.value.name = `Redis-${redis_index.value}`;
  redis_form.value.url = '';
  redis_form.value.db = 0;
  redis_form.value.names = '';

  editor_visible.value = true
}

function OnEdit(index: number) {
  redis_form_index.value = index
  const content = redis.value[index];

  redis_form.value.url = content.url;
  redis_form.value.db = content.db;
  redis_form.value.names = content.names.join(',');

  editor_visible.value = true
}

function OnDelete(index: number) {
  redis.value.splice(index, 1)

  OnChange();
}

function OnEditConfirm() {

  if (redis_form_index.value >= 0) {
    const content = redis.value[redis_form_index.value];
    content.url = redis_form.value.url
    content.db = redis_form.value.db
    content.names = redis_form.value.names.split(',')
  } else {
    redis.value.push({
      name: redis_form.value.name,
      url: redis_form.value.url,
      db: redis_form.value.db,
      names: redis_form.value.names.split(',')
    })
    redis_index.value++;
  }

  OnChange();

  editor_visible.value = false
}

function OnEditCancel() {
  editor_visible.value = false
}

function OnChange() {
  const all_redis: RedisCfg[] = []
  redis.value.forEach(r => {
    all_redis.push({
      url: r.url,
      db: r.db,
      names: r.names
    })
  })

  emit('change', all_redis)
}

</script>

<style scoped>

:deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}

.el-col {
  margin-bottom: 20px;
}

.redis-info :deep(.el-descriptions__title) {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.redis-config) {
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.redis-label) {
  width: 90px;
}

.redis-module {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-tag {
  margin: 2px 2px;
}

.card-add {
  height: 160px;
  min-width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-btn {
  width: 220px;
  height: 150px;
}

</style>