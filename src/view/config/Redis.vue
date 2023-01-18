<template>
  <el-scrollbar height="720px">
    <el-row :gutter="20">
      <el-col v-for="(r, i) in redis" :key="r.name" :span="6">
        <el-card class="card-redis" shadow="always">
          <template #header>
            <div class="card-header">
              <el-row :gutter="20" style="height: 50px; line-height: 50px">
                <el-col :span="14">
                  <el-tag>{{ r.name }}</el-tag>
                </el-col>
                <el-col :span="10" class="card-op">
                  <el-button-group size="small" type="primary">
                    <el-button :icon="Edit" @click="OnEdit(i)"/>
                    <el-button :icon="Delete" @click="OnDelete(i)"/>
                  </el-button-group>
                </el-col>
              </el-row>
            </div>
          </template>
          <el-scrollbar height="150px">
            <p>{{ r.name }}</p>
            <p>{{ r.url }}</p>
            <ul>
              <li v-for="m in r.names">{{ m }}</li>
            </ul>
          </el-scrollbar>
        </el-card>
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
  {name: 'r1', url: 'r1:6379', db: 0, names: ['A', 'B', 'C']},
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

.card-redis {
  min-width: 100px;
  min-height: 100px;
}

.card-add {
  height: 241px;
  min-width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-btn {
  width: 220px;
  height: 150px;
}

.card-op {
  text-align: right;
}

.card-redis :deep(.el-card__header) {
  padding: 0 10px;
}

</style>