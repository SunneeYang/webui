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
          <el-button bg class="add-btn" link>
            <el-icon size="50">
              <Plus/>
            </el-icon>
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </el-scrollbar>
</template>

<script lang="ts" setup>

import {ref} from "vue";
import {Delete, Edit} from '@element-plus/icons-vue';
import {RedisCfg} from "../../module/definition";

const redis = ref<RedisCfg[]>([
  {
    name: 'main-module-abcdefg-hijklmn',
    url: 'http://repo.abcdedjfsaklfhjaskl.cn:6379',
    db: 0,
    names: ['Player', 'Item', 'Money', 'Shop', 'Hero', 'CardGroup', 'AdventureStory', 'AdventureStage', 'AdventureChapter']
  },
  {name: 'r2', url: 'r2:6379', db: 1, names: ['D', 'E', 'F']},
  {name: 'r3', url: 'r3:6379', db: 2, names: ['G', 'H', 'I']},
  {name: 'r4', url: 'r4:6379', db: 3, names: ['J', 'K', 'L']},
  {name: 'r5', url: 'r5:6379', db: 4, names: ['M', 'N', 'O']},
  {name: 'r6', url: 'r6:6379', db: 5, names: ['P', 'Q', 'R']},
])

function OnEdit(index: number) {
  console.log('edit:' + index)
}

function OnDelete(index: number) {
  console.log('delete:' + index)
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