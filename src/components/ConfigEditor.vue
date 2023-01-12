<template>
  <el-container class="container">
    <el-main>
      <el-card shadow="always" class="card">
        <template #header>
          <div class="card-header">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-tag id="head-tag" effect="dark" size="large">ConfigEditor</el-tag>
              </el-col>
              <el-col :span="8" class="head-opt">
                <el-switch
                    v-model="edition"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #66b1ff"
                    active-text="开发版"
                    inactive-text="发布版"
                    active-value="dev"
                    inactive-value="release"
                    size="large"
                />
              </el-col>
              <el-col :span="8" id="head-btn">
                <el-button-group type="primary">
                  <el-tooltip
                      effect="light"
                      content="刷新"
                  >
                    <el-button :icon="Refresh" @click="OnRefreshClick" />
                  </el-tooltip>

                  <el-tooltip
                      effect="light"
                      content="设置"
                  >
                    <el-button :icon="Setting" @click="OnSettingClick"/>
                  </el-tooltip>
                </el-button-group>
              </el-col>
            </el-row>
          </div>
        </template>
        <el-tabs>
          <el-tab-pane label="Balance">
            <el-form :model="cfg_balance_form" label-width="90px" label-position="top">
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
          </el-tab-pane>

          <el-tab-pane label="Redis">Redis</el-tab-pane>
          <el-tab-pane label="Mongodb">Mongodb</el-tab-pane>

          <el-tab-pane label="Middleware">
            <el-tabs v-model="cfg_middleware_current" tab-position="left" editable @edit="OnMiddlewareTabsEdit" @tab-change="OnMiddlewareTabsChange">
              <el-tab-pane
                  v-for="cfg in cfg_middleware"
                  :key="cfg.name"
                  :label="cfg.name"
                  :name="cfg.name"
              >
                <el-form ref="formRef" :model="cfg_middleware_form" label-width="90px">
                  <el-form-item label="Type" required>
                    <el-select v-model="cfg_middleware_form.type" >
                      <el-option
                          v-for="item in MiddlewareTypes"
                          :key="item.label"
                          :label="item.label"
                          :value="item.label"
                          :disabled="item.disabled"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="Name" required>
                    <el-input v-model="cfg_middleware_form.name" />
                  </el-form-item>
                  <el-form-item label="Config">
                    <el-input v-model="cfg_middleware_form.config" type="textarea" autosize />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="OnMiddlewareSave">确定</el-button>
                    <el-button @click="OnMiddlewareCancel">取消</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </el-main>
    <el-footer id="footer">
      <el-button type="primary" size="large" @click="OnSave">保存</el-button>
    </el-footer>


    <el-dialog v-model="setting_visible" title="设置">
      <el-form :model="setting_form">
        <el-form-item label="服务器地址" :label-width="formLabelWidth">
          <el-input v-model="setting_form.server_path">
            <template #append>
              <el-button :icon="Folder" @click="OpenDirectorySelecter('server')"/>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="OnSettingCancel">取消</el-button>
          <el-button type="primary" @click="OnSettingConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </el-container>
</template>

<script setup lang="ts">

import {reactive, Ref, ref} from "vue";
import {Setting, Refresh, Folder} from "@element-plus/icons-vue";
import { tryOnMounted, useStorage } from '@vueuse/core';
import {useIpcRendererInvoke, useIpcRendererOn} from "@vueuse/electron";
import {ElMessage } from "element-plus";
import * as path from "path";
const fs = require('fs');
const yaml = require('js-yaml');

const edition = ref('dev')

// setting
const setting_visible = ref(false)
const formLabelWidth = '90px'
const setting_form = reactive({
  server_path: '',
})
const setting_content = useStorage('tool-setting', {
  server_path: '',
})

interface ConfigAll {
  node : object[],
  balance: BalanceCfg,
  redis: RedisCfg[],
  mongodb: MongoDbCfg[],
  middleware : MiddlewareCfg[],
}

tryOnMounted(() => {
  setting_form.server_path = setting_content.value.server_path

  if (setting_form.server_path == '') {
    OnSettingClick()
  }
  else {
    OnRefreshClick()
  }
})

function OnRefreshClick() {
  const config_path = path.join(setting_content.value.server_path, 'Config/service_brick', edition.value === 'dev' ? 'brick_dev.yaml' : 'brick.yaml')
  const contents = fs.readFileSync(config_path, 'utf8')

  cfg_middleware.value = []

  try {
    const doc = yaml.load(contents, {});

    // node

    // balance
    cfg_balance.value =  doc.balance
    OnBalanceCancel()

    // redis
    const r : RedisCfg[] = doc.redis

    // mongodb
    const m : MongoDbCfg[] = doc.mongodb

    // middleware
    cfg_middleware.value = doc.middleware
    cfg_middleware_current.value = cfg_middleware.value[0]?.name ?? ""
    cfg_middleware_index = cfg_middleware.value.length

  } catch (e) {
    console.log(e);
  }
}

function OnSettingClick()
{
  setting_visible.value = true
  setting_form.server_path = setting_content.value.server_path
}

function OnSettingConfirm()
{
  if (setting_form.server_path == '') {
    ElMessage({
      message: '请配置服务器代码库路径',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  setting_content.value.server_path = setting_form.server_path
  setting_visible.value = false

  OnRefreshClick();
}

function OnSettingCancel()
{
  if (setting_form.server_path == '') {
    ElMessage({
      message: '请配置服务器代码库路径',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  if (setting_content.value.server_path == '') {
    setting_content.value.server_path = setting_form.server_path
    OnRefreshClick()
  }

  setting_visible.value = false
}

async function OpenDirectorySelecter( type:string )
{
  useIpcRendererInvoke<string>('dialog:openDirectory', type)
}

useIpcRendererOn('dialog:path', (event, ...args) => {
  switch (args[0]) {
    case 'server':
      setting_form.server_path = args[1][0]
      break
  }
})

function OnSave() {
  const cfg_all : ConfigAll = {
    balance: { hashring: [], hashslot: [], random: []}, middleware: [], mongodb: [], node: [], redis: []
  }

  cfg_all.balance = cfg_balance.value
  cfg_all.middleware = cfg_middleware.value

  const content = yaml.dump(cfg_all, { lineWidth: -1})
  console.log(content)

  // const config_path = path.join(setting_content.value.server_path, 'Config/service_brick', edition.value === 'dev' ? 'brick_dev_new.yaml' : 'brick_new.yaml')
  // const contents = fs.writeFileSync(config_path, )
}

const SceneType = ['Realm', 'Gate', 'Monitor', 'Player', 'Mail', 'Chat', 'Gm', 'Guild', 'Ranklist', 'Friend', 'Manager', 'Battle', 'Pay', 'Homeland', 'Activity', 'Bot']

// 负载均衡
interface BalanceCfg
{
  hashring: string[],
  hashslot: string[],
  random: string[],
}

const cfg_balance : Ref<BalanceCfg> = ref({hashring:[], hashslot:[], random:[]})
const cfg_balance_form : Ref<BalanceCfg> = ref({hashring:[], hashslot:[], random:[]})

function OnBalanceSave() {
  cfg_balance.value.hashslot = []
  cfg_balance.value.hashring = []
  cfg_balance.value.random = []

  cfg_balance_form.value.hashslot.forEach(s => cfg_balance.value.hashslot.push(s))
  cfg_balance_form.value.hashring.forEach(s => cfg_balance.value.hashring.push(s))
  cfg_balance_form.value.random.forEach(s => cfg_balance.value.random.push(s))
}

function OnBalanceCancel() {
  cfg_balance_form.value.hashslot = []
  cfg_balance_form.value.hashring = []
  cfg_balance_form.value.random = []

  cfg_balance.value.hashslot.forEach(s => cfg_balance_form.value.hashslot.push(s))
  cfg_balance.value.hashring.forEach(s => cfg_balance_form.value.hashring.push(s))
  cfg_balance.value.random.forEach(s => cfg_balance_form.value.random.push(s))
}

interface RedisCfg
{
  url: string,
  db: number,
  names: string[],
}

interface MongoDbCfg
{
  db: string,
  url: string,
  names: string[],
}

// 中间件
interface MiddlewareCfg
{
  type: string,
  name: string,
  config: string,
}

const MiddlewareTypes = [
  { label: 'U8Server' },
  { label: 'Etcd' },
  { label: 'Prometheus' },
  { label: 'Kafka', disabled: true },
  { label: 'Apm', disabled: true },
]

const cfg_middleware : Ref<MiddlewareCfg[]> = ref([])
const cfg_middleware_current = ref("")
let cfg_middleware_index = 0
const cfg_middleware_form : Ref<MiddlewareCfg>  = ref({ type:'', name: '', config: ''});

function OnMiddlewareTabsEdit(targetName : string, action: 'remove' | 'add') {
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

      console.log('remove ' + targetName)

      cfg_middleware_current.value = activeName
      cfg_middleware.value = cfg_middleware.value.filter((tab) => tab.name !== targetName)
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

function OnMiddlewareTabsChange(name : string) {
  cfg_middleware.value.forEach( (tab, index) => {
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
  cfg_middleware.value.forEach( (tab, index) => {
    if (tab.name == cfg_middleware_form.value.name) {
      if (cur_index == -2) {
        return
      }
      if (tab.name != cfg_middleware_current.value) {
        cur_index = -2
      }
      else {
        cur_index = index
      }
    }
  })

  if (cur_index == -2) {
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
  }
}

function OnMiddlewareCancel() {
 cfg_middleware.value.forEach( (tab, index) => {
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
.container {
  height: 100%;
}

#footer {
  text-align: center;
}

.head-opt {
  text-align: center;
}

#head-btn {
  margin-top: 5px;
  text-align: right;
}

#head-tag {
  margin-top: 5px;
  text-align: left;
}

.card {
  height: 100%;
  border: 0;
}

.card-header {
  justify-content: space-between;
}

.el-tabs--left :deep(.el-tabs__header.is-left) {
  height: 720px;
  overflow-y: auto;
}

</style>