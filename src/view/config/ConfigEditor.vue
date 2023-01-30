<template>
  <el-container class="container">
    <el-main>
      <el-card class="card" shadow="always">
        <template #header>
          <div class="card-header">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-tag id="head-tag" effect="dark" size="large">ConfigEditor</el-tag>
              </el-col>
              <el-col :span="8" class="head-opt">
                <el-switch
                    v-model="edition"
                    active-text="开发版"
                    active-value="dev"
                    inactive-text="发布版"
                    inactive-value="rel"
                    inline-prompt
                    size="large"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #66b1ff"
                    @change="OnRefreshClick"
                />
              </el-col>
              <el-col id="head-btn" :span="8">
                <el-button-group type="primary">
                  <el-tooltip
                      content="刷新"
                      effect="light"
                  >
                    <el-button :icon="Refresh" @click="OnRefreshClick"/>
                  </el-tooltip>

                  <el-tooltip
                      content="设置"
                      effect="light"
                  >
                    <el-button :icon="Setting" @click="OnSettingClick"/>
                  </el-tooltip>
                </el-button-group>
              </el-col>
            </el-row>
          </div>
        </template>
        <el-tabs>

          <el-tab-pane v-if="edition === 'dev'" label="Node">
            Dev Node
          </el-tab-pane>

          <el-tab-pane v-else label="Node">
            <ReleaseNode :node="cfg_rel_node" :scene="cfg_rel_scene" @change="OnRelNodeChange"/>
          </el-tab-pane>

          <el-tab-pane label="Balance">
            <Balance :balance="cfg_balance" @submit="OnBalanceSubmit"/>
          </el-tab-pane>

          <el-tab-pane label="Redis">
            <Redis :redis="cfg_redis" @change="OnRedisChange"/>
          </el-tab-pane>

          <el-tab-pane label="Mongodb">
            <MongoDb :mongodb="cfg_mongodb" @change="OnMongoDbChange"/>
          </el-tab-pane>

          <el-tab-pane label="Middleware">
            <Middleware :middleware="cfg_middleware" @change="OnMiddlewareChange"/>
          </el-tab-pane>

          <el-tab-pane label="Other">
            <Other :other="cfg_other" @change="OnOtherChange"/>
          </el-tab-pane>

        </el-tabs>
      </el-card>
    </el-main>
    <el-footer id="footer">
      <el-button size="large" type="primary" @click="OnSave">保存</el-button>
    </el-footer>


    <el-dialog v-model="setting_visible" title="设置">
      <el-form :model="setting_form">
        <el-form-item :label-width="formLabelWidth" label="服务器地址">
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

<script lang="ts" setup>

import {reactive, Ref, ref} from "vue";
import {Folder, Refresh, Setting} from "@element-plus/icons-vue";
import {tryOnMounted, useStorage} from '@vueuse/core';
import {useIpcRendererInvoke, useIpcRendererOn} from "@vueuse/electron";
import {ElMessage} from "element-plus";
import * as path from "path";
import {
  BalanceCfg,
  DevNode,
  MiddlewareCfg,
  MongoDbCfg,
  OtherCfg,
  RealmCfg,
  RedisCfg,
  RelNode,
  RelScene
} from "../../module/definition";
import Balance from "./Balance.vue";
import Middleware from "./Middleware.vue";
import Redis from "./Redis.vue";
import MongoDb from "./MongoDb.vue";
import Other from "./Other.vue";
import ReleaseNode from "./ReleaseNode.vue";

const fs = require('fs');
const yaml = require('js-yaml');

const edition = ref('rel')

// setting
const setting_visible = ref(false)
const formLabelWidth = '90px'
const setting_form = reactive({
  server_path: '',
})
const setting_content = useStorage('tool-setting', {
  server_path: '',
})

const cfg_balance: Ref<BalanceCfg> = ref({hashring: [], hashslot: [], random: []})
const cfg_redis: Ref<RedisCfg[]> = ref([]);
const cfg_mongodb: Ref<MongoDbCfg[]> = ref([]);
const cfg_middleware: Ref<MiddlewareCfg[]> = ref([])
const cfg_other: Ref<OtherCfg> = ref({pipeline: '', realm: {strategy: ''}});

// dev
const cfg_dev_node: Ref<Map<string, DevNode>> = ref<Map<string, DevNode>>(new Map<string, DevNode>());

// release
const cfg_rel_node: Ref<RelNode> = ref<RelNode>({outerPort: 0, innerPort: 0, grpcPort: 0, watcherPort: 0})
const cfg_rel_scene: Ref<RelScene[]> = ref<RelScene[]>([]);

interface ConfigAll {
  node: object,
  scene?: RelScene[],
  balance: BalanceCfg,
  realm: RealmCfg,
  pipeline: string,
  redis: RedisCfg[],
  mongodb: MongoDbCfg[],
  middleware: MiddlewareCfg[],
}

tryOnMounted(() => {
  setting_form.server_path = setting_content.value.server_path

  if (setting_form.server_path == '') {
    OnSettingClick()
  } else {
    OnRefreshClick()
  }
})

function OnRefreshClick() {
  const dev = edition.value === 'dev';
  const config_path = path.join(setting_content.value.server_path, 'Config/service_brick', dev ? 'brick_dev.yaml' : 'brick.yaml')
  const contents = fs.readFileSync(config_path, 'utf8')

  cfg_middleware.value = []

  try {
    const doc = yaml.load(contents, {});

    // node
    if (dev) {
      cfg_dev_node.value.clear()
      for (let nodeName in doc.node) {
        cfg_dev_node.value.set(nodeName, doc.node[nodeName])
      }
    } else {
      cfg_rel_node.value = doc.node
      cfg_rel_scene.value = doc.scene
    }

    // balance
    cfg_balance.value = doc.balance

    // redis
    cfg_redis.value = doc.redis

    // mongodb
    cfg_mongodb.value = doc.mongodb

    // middleware
    cfg_middleware.value = doc.middleware

    // other
    cfg_other.value.pipeline = doc.pipeline
    cfg_other.value.realm = doc.realm

  } catch (e) {
    console.log(e);
  }
}

function OnSettingClick() {
  setting_visible.value = true
  setting_form.server_path = setting_content.value.server_path
}

function OnSettingConfirm() {
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

function OnSettingCancel() {
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

async function OpenDirectorySelecter(type: string) {
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
  const cfg_all: ConfigAll = {
    node: {},
    balance: {hashring: [], hashslot: [], random: []},
    realm: {strategy: ''},
    pipeline: '',
    middleware: [],
    mongodb: [],
    redis: []
  }

  if (edition.value === 'dev') {
    cfg_all.node = {}
    // for (let [key, value] of cfg_dev_node.value) {
    //   cfg_all.node[key] = value
    // }
    cfg_all.scene = undefined
  } else {
    cfg_all.node = cfg_rel_node.value
    cfg_all.scene = cfg_rel_scene.value
  }

  cfg_all.balance = cfg_balance.value
  cfg_all.realm = cfg_other.value.realm
  cfg_all.pipeline = cfg_other.value.pipeline
  cfg_all.redis = cfg_redis.value
  cfg_all.mongodb = cfg_mongodb.value
  cfg_all.middleware = cfg_middleware.value

  const content = yaml.dump(cfg_all, {lineWidth: -1})
  console.log(content)

  // const config_path = path.join(setting_content.value.server_path, 'Config/service_brick', edition.value === 'dev' ? 'brick_dev_new.yaml' : 'brick_new.yaml')
  // const contents = fs.writeFileSync(config_path, )
}

function OnBalanceSubmit(balance: BalanceCfg) {
  cfg_balance.value = balance
}

function OnRedisChange(redis: RedisCfg[]) {
  cfg_redis.value = redis
}

function OnMongoDbChange(mongodb: MongoDbCfg[]) {
  cfg_mongodb.value = mongodb
}

function OnMiddlewareChange(middleware: MiddlewareCfg[]) {
  cfg_middleware.value = middleware
}

function OnOtherChange(other: OtherCfg) {
  cfg_other.value = other
}

function OnRelNodeChange(node: RelNode, scene: RelScene[]) {
  cfg_rel_node.value = node
  cfg_rel_scene.value = scene
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

</style>