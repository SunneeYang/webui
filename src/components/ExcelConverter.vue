<template>
  <el-container>
    <el-main>
      <el-card shadow="always">
        <template #header>
          <div class="card-header">
            <el-row :gutter="20">
              <el-col :span="4">
                <el-tag id="head-tag" effect="dark" size="large">Excel</el-tag>
              </el-col>
              <el-col :span="2" class="head-opt">
                <el-switch
                    v-model="platform"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    active-text="服务器"
                    inactive-text="客户端"
                    size="large"
                />
              </el-col>
              <el-col :span="14" class="head-opt">
                <el-checkbox v-model="gen_cs" label="CS" size="large"/>
                <el-checkbox v-model="gen_csv" label="CSV" size="large"/>
                <el-checkbox v-model="gen_json" label="JSON" size="large"/>
              </el-col>
              <el-col :span="4" id="head-btn">
                <el-button-group type="primary">
                  <el-button :icon="Refresh" @click="OnRefreshClick" />
                  <el-button :icon="Setting" @click="OnSettingClick"/>
                </el-button-group>
              </el-col>
            </el-row>
          </div>
        </template>
        <el-scrollbar height="430px">
          <p v-for="item in 20" :key="item" class="scrollbar-demo-item">{{ item }}</p>
        </el-scrollbar>
      </el-card>
    </el-main>
    <el-footer id="footer">
      <el-button type="primary" size="large">开始转换</el-button>
    </el-footer>

    <el-dialog v-model="setting_visible" title="设置">
      <el-form :model="setting_form">
        <el-form-item label="表格地址" :label-width="formLabelWidth">
          <el-input v-model="setting_form.excel_path">
            <template #append>
              <el-button :icon="Folder" @click="OpenDirectorySelecter('excel')" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="服务器地址" :label-width="formLabelWidth">
          <el-input v-model="setting_form.server_path">
            <template #append>
              <el-button :icon="Folder" @click="OpenDirectorySelecter('server')"/>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="客户端地址" :label-width="formLabelWidth">
          <el-input v-model="setting_form.client_path">
            <template #append>
              <el-button :icon="Folder" @click="OpenDirectorySelecter('client')"/>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setting_visible = false">取消</el-button>
          <el-button type="primary" @click="OnSettingConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </el-container>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {Setting, Refresh, Folder} from "@element-plus/icons-vue";
import { useStorage } from '@vueuse/core';
import { useIpcRendererInvoke } from "@vueuse/electron";

const platform = ref(true)

const gen_cs = ref(true)
const gen_csv = ref(false)
const gen_json = ref(false)

const setting_visible = ref(false)

const formLabelWidth = '90px'
const setting_form = reactive({
  excel_path: '',
  server_path: '',
  client_path: '',
})
const setting_content = useStorage('tool-setting', {
  excel_path: '',
  server_path: '',
  client_path: '',
})

function OnRefreshClick()
{
  console.log("refresh clicked")
}

function OnSettingClick()
{
  setting_visible.value = true

  setting_form.excel_path = setting_content.value.excel_path
  setting_form.server_path = setting_content.value.server_path
  setting_form.client_path = setting_content.value.client_path
}

function OnSettingConfirm()
{
  setting_visible.value = false

  setting_content.value.excel_path = setting_form.excel_path
  setting_content.value.server_path = setting_form.server_path
  setting_content.value.client_path = setting_form.client_path
}

async function OpenDirectorySelecter( type:string )
{
  const result = useIpcRendererInvoke<string>('dialog:openDirectory')

  switch (type) {
    case 'excel':
      setting_form.excel_path = result
      break

    case 'server':
      setting_form.server_path = result
      break

    case 'client':
      setting_form.client_path = result
      break
  }
}

</script>

<style scoped>

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

.card-header {
  justify-content: space-between;
}
</style>
