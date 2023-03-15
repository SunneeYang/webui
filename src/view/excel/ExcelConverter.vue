<template>
  <el-container class="container">
    <el-main>
      <el-card shadow="always" class="card">
        <template #header>
          <div class="card-header">
            <el-row :gutter="20">
              <el-col :span="4">
                <el-tag id="head-tag" effect="dark" size="large">ExcelExporter</el-tag>
              </el-col>
              <el-col :span="2" class="head-opt">
                <el-switch
                    v-model="platform"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #66b1ff"
                    active-text="服务器"
                    inactive-text="客户端"
                    active-value="server"
                    inactive-value="client"
                    size="large"
                />
              </el-col>
              <el-col :span="14" class="head-opt">
                <el-checkbox v-model="gen_cs" label="CS" size="large" @change="OnGenToChange('cs')"/>
                <el-checkbox v-model="gen_csv" label="CSV" size="large" @change="OnGenToChange('csv')"/>
                <el-checkbox v-model="gen_json" label="JSON" size="large" @change="OnGenToChange('json')"/>
              </el-col>
              <el-col :span="4" id="head-btn">
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
        <el-input v-model="filter_text" />
        <el-scrollbar max-height="740px">
          <div>
            <el-tree
                ref="excel_tree_ref"
                :data="excel_tree"
                :props="defaultTreeProps"
                show-checkbox
                node-key="label"
                :default-expanded-keys="['All']"
                :filter-node-method="filterTreeNode"
            />
          </div>
        </el-scrollbar>
      </el-card>
    </el-main>
    <el-footer id="footer">
      <el-button type="primary" size="large" @click="OnTransformStart">开始转换</el-button>
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
          <el-button @click="OnSettingCancel">取消</el-button>
          <el-button type="primary" @click="OnSettingConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-drawer v-model="shell_visible"
               :direction="'btt'"
               size="80%"
               :with-header="false"
    >
      <p v-for="info in shell_result">{{info}}</p>
    </el-drawer>

  </el-container>
</template>

<script setup lang="ts">
import {reactive, ref, watch} from "vue";
import {Folder, Refresh, Setting} from "@element-plus/icons-vue";
import {tryOnMounted, useStorage} from '@vueuse/core';
import {useIpcRendererInvoke, useIpcRendererOn} from "@vueuse/electron";
import * as path from "path";
import {ElMessage, ElTree} from "element-plus";
import {TreeNodeData} from "element-plus/es/components/tree/src/tree.type";

const fs = require('fs');
const xlsx = require('xlsx')

// options
const platform = ref('client')

const gen_cs = ref(false)
const gen_csv = ref(true)
const gen_json = ref(true)

// setting
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

// excel tree
const filter_text = ref('')
const excel_tree_ref = ref<InstanceType<typeof ElTree>>()

watch(filter_text, (val) => {
  excel_tree_ref.value!.filter(val)
})
const filterTreeNode = (value: string, data: TreeNodeData) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

interface ExcelTree {
  label: string
  children?: ExcelTree[]
  excel_name?: string
}

const defaultTreeProps = {
  children: 'children',
  label: 'label',
}

const excel_root = ref<ExcelTree>({ label: 'All', children: [] })
const excel_tree = ref<ExcelTree[]>([])

// shell log
const shell_visible = ref(false)
const shell_result = ref([])


tryOnMounted(() => {
  setting_form.excel_path = setting_content.value.excel_path
  setting_form.server_path = setting_content.value.server_path
  setting_form.client_path = setting_content.value.client_path

  if (setting_form.excel_path == '') {
    OnSettingClick()
  }
  else {
    OnRefreshClick()
  }
})

function OnGenToChange(type:string)
{
  if (type == 'json' && gen_json.value) {
    gen_csv.value = true
  }

  if (type == 'csv' && gen_csv.value === false) {
    gen_json.value = false
  }
}

function OnRefreshClick()
{
  excel_tree.value = []
  excel_root.value.children = []

  fs.readdir(setting_form.excel_path, (err: NodeJS.ErrnoException | null, files: string[]) => {
    if (err) {
      return console.error(err)
    }

    files.forEach( function (file) {

      if (path.extname(file) !== '.xlsx')
        return

      if (file.startsWith('~$'))
        return

      const one_excel: ExcelTree = {label: path.basename(file, '.xlsx'), children: []}

      const filePath = path.join(setting_form.excel_path, file)
      const workbook = xlsx.readFile(filePath)

      workbook.SheetNames.forEach(function (sheet: string) {
        if (sheet.startsWith('#') || sheet.startsWith('~'))
          return
        
        const one_sheet: ExcelTree = {label: sheet, excel_name: file}
        one_excel.children!.push(one_sheet)
      })

      excel_root.value.children!.push(one_excel)
    })
  });

  excel_tree.value.push(excel_root.value)
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
  if (setting_form.excel_path == '') {
    ElMessage({
      message: '请配置Excel存放地址',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  setting_content.value.excel_path = setting_form.excel_path
  setting_content.value.server_path = setting_form.server_path
  setting_content.value.client_path = setting_form.client_path

  setting_visible.value = false

  OnRefreshClick();
}

function OnSettingCancel()
{
  if (setting_form.excel_path == '') {
    ElMessage({
      message: '请配置Excel存放地址',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  if (setting_content.value.excel_path == '') {
    setting_content.value.excel_path = setting_form.excel_path
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
    case 'excel':
      setting_form.excel_path = args[1][0]
      break

    case 'server':
      setting_form.server_path = args[1][0]
      break

    case 'client':
      setting_form.client_path = args[1][0]
      break
  }
})

function OnTransformStart() {

  if (!gen_cs.value && !gen_csv.value && !gen_json.value) {
    ElMessage({
      message: '需要至少选择一个生成目的',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  switch (platform.value) {
    case 'client':
      if (setting_form.client_path == '') {
        ElMessage({
          message: '请配置客户端地址',
          type: 'error',
          center: true,
          grouping: true,
          duration: 1000
        })
        return;
      }
      break

    case 'server':
      if (setting_form.server_path == '') {
        ElMessage({
          message: '请配置服务器地址',
          type: 'error',
          center: true,
          grouping: true,
          duration: 1000
        })
        return;
      }
      break

    default:
      console.error('invalid platform:' + platform.value)
      return;
  }

  const transform_list = new Map<string, string[]>()

  const selected = excel_tree_ref.value!.getCheckedNodes(false, false)
  selected.forEach(function (node) {
    if (node.excel_name) {
      if (transform_list.has(node.excel_name)) {
        const sheets = transform_list.get(node.excel_name)
        sheets!.push(node.label)
      }
      else {
        transform_list.set(node.excel_name, [node.label])
      }
    }
  })

  if (transform_list.size <= 0) {
    ElMessage({
      message: '需要至少选择一个表',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  const obj = Object.fromEntries(transform_list)

  const finalConfig = {
    path: { excel: '', server: '', client: ''},
    platform: '',
    generator: {},
    sheets: {},
  }
  finalConfig.path.excel = setting_content.value.excel_path
  finalConfig.path.server = setting_content.value.server_path
  finalConfig.path.client = setting_content.value.client_path

  finalConfig.platform = platform.value
  finalConfig.generator = {
    cs: gen_cs.value,
    csv: gen_csv.value,
    json: gen_json.value,
  }
  finalConfig.sheets = obj

  let workspace = ''
  switch (platform.value) {
    case 'client':
      workspace = path.join(finalConfig.path.client, 'Tools/ExcelExporter/export', process.platform === 'darwin' ? 'osx-x64' : 'win-x64');
      break;
    case 'server':
      workspace = path.join(finalConfig.path.server, 'Tools/ExcelExporter/export', process.platform === 'darwin' ? 'osx-x64' : 'win-x64');
      break;
  }

  if (workspace == '') {
    ElMessage({
      message: '目标目录不存在',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  fs.writeFile('config.json', JSON.stringify(finalConfig, null, 2), {flag: 'w+'}, function () {
    console.log('write done!')

    useIpcRendererInvoke('shell:exec', path.join(workspace, process.platform === 'darwin' ? 'ExcelExporter' : 'ExcelExporter'))
  })
}

useIpcRendererOn('shell:stdout', (event, ...args) => {

  if (args[0].error) {
    console.log(args[0].error)
    return
  }

  shell_visible.value = true
  shell_result.value = args[0].stdout.split('\r\n')
})

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
