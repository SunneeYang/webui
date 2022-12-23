<template>
  <el-row :gutter="12">
    <el-col :span="8">
      <el-card shadow="always">
        <template #header>
          <div class="card-header">
            <span>Excel</span>
            <el-button class="button" text>刷新</el-button>
          </div>
        </template>
        <el-scrollbar height="530px">
          <p v-for="item in 20" :key="item" class="scrollbar-demo-item">{{ item }}</p>
        </el-scrollbar>
      </el-card>
    </el-col>
    <el-col :span="16">
      <el-card shadow="always">
        <el-row justify="space-around">
          <el-col>
            <el-card shadow="always">
              <template #header>
                <div class="card-header">
                  <span>Platform</span>
                </div>
              </template>
              <el-switch
                  v-model="value1"
                  class="mb-2"
                  active-text="Pay by month"
                  inactive-text="Pay by year"
              />
              <br />
              <el-switch
                  v-model="value5"
                  class="ml-2"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                  active-text="Server"
                  inactive-text="Client"
              />
            </el-card>
          </el-col>
        </el-row>
        <el-row justify="space-around">
          <el-col>
            <el-card shadow="always">
              <div>
                <el-checkbox v-model="gen_cs" label="CS" size="large" />
                <el-checkbox v-model="gen_csv" label="CSV" size="large" />
                <el-checkbox v-model="gen_json" label="JSON" size="large" />
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row justify="space-around">
          <el-col>
            <el-card shadow="always">
              <el-button type="primary">配置</el-button>
              <el-button type="primary">开始导表</el-button>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {ref} from "vue";

const value1 = ref(true)
const value5 = ref(true)

const gen_cs = ref(false)
const gen_csv = ref(false)
const gen_json = ref(false)
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>