<template>
  <el-scrollbar height="700px">
    <el-divider content-position="left">Node</el-divider>

    <el-table :data="[node]" border stripe table-layout="auto">
      <el-table-column label="OuterPort" prop="outerPort"/>
      <el-table-column label="InnerPort" prop="innerPort"/>
      <el-table-column label="WatcherPort" prop="watcherPort"/>
      <el-table-column label="GrpcPort" prop="grpcPort"/>
      <el-table-column label="Operations">
        <template #default="scope">
          <el-button size="small" type="primary" @click="OnNodeEdit">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-divider content-position="left">Scene</el-divider>

    <el-table :data="scenes" border stripe table-layout="auto">
      <el-table-column label="Type" prop="type"/>
      <el-table-column label="Replicas" prop="replicas"/>
      <el-table-column label="Outer">
        <template #default="scope">
          <el-popover
              v-if="scope.row.outer != null && scope.row.outer.length > 0"
              :width="500"
              title="Outer"
              trigger="hover"
          >
            <template #reference>
              <el-tag>{{ scope.row.outer.length }}</el-tag>
            </template>
            <template #default>
              <el-table :data="scope.row.outer" border max-height="300px" stripe>
                <el-table-column label="IP" prop="ip"/>
                <el-table-column label="Port" prop="port" width="100"/>
              </el-table>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="Operations">
        <template #header>
          <el-button size="small" type="primary" @click="OnSceneAdd">Add</el-button>
        </template>
        <template #default="scope">
          <el-button size="small" @click="OnSceneEdit(scope.$index)"
          >Edit
          </el-button
          >
          <el-button
              size="small"
              type="danger"
              @click="OnSceneDelete(scope.$index)"
          >Delete
          </el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </el-scrollbar>

  <el-dialog v-model="node_form_visible" title="Node" width="30%">
    <el-form :model="node_form" label-position="left" label-width="120px">
      <el-form-item label="InnerPort">
        <el-input v-model="node_form.innerPort" :prefix-icon="Edit"/>
      </el-form-item>
      <el-form-item label="OuterPort">
        <el-input v-model="node_form.outerPort" :prefix-icon="Edit"/>
      </el-form-item>
      <el-form-item label="WatcherPort">
        <el-input v-model="node_form.watcherPort" :prefix-icon="Edit"/>
      </el-form-item>
      <el-form-item label="GrpcPort">
        <el-input v-model="node_form.grpcPort" :prefix-icon="Edit"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="OnNodeEditConfirm">确认</el-button>
        <el-button @click="OnNodeEditCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-dialog v-model="scene_form_visible" :title="scene_form.type" width="50%">
    <el-form :model="scene_form" label-position="left" label-width="120px">
      <el-form-item label="Type">
        <el-input v-model="scene_form.type" :prefix-icon="Edit"/>
      </el-form-item>
      <el-form-item label="Replicas">
        <el-input-number v-model="scene_form.replicas" :min="1" :prefix-icon="Edit"/>
      </el-form-item>
      <el-form-item label="Outer">
        <el-table :data="scene_form.outer" border max-height="400px" stripe>
          <el-table-column label="IP" prop="ip"/>
          <el-table-column label="Port" prop="port" width="100"/>
          <el-table-column label="Operations">
            <template #header>
              <el-button size="small" type="primary" @click="OnSceneOuterAdd">Add</el-button>
            </template>
            <template #default="scope">
              <el-button-group>
                <el-button :icon="Edit" size="small" type="primary" @click="OnSceneOuterEdit(scope.$index)"
                />
                <el-button
                    :icon="Delete"
                    size="small"
                    type="primary"
                    @click="OnSceneOuterDelete(scope.$index)"
                />
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="OnSceneEditConfirm">确认</el-button>
        <el-button @click="OnSceneEditCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-dialog v-model="scene_outer_form_visible" title="Outer" width="50%">
    <el-form :model="scene_outer_form" label-position="left" label-width="120px">
      <el-form-item label="IP">
        <el-input v-model="scene_outer_form.ip"/>
      </el-form-item>
      <el-form-item label="Port">
        <el-input-number v-model="scene_outer_form.port"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="OnSceneOuterEditConfirm">确认</el-button>
        <el-button @click="OnSceneOuterEditCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>

import {RelNode, RelOuter, RelScene} from "../../module/definition";
import {Ref, ref, watch} from "vue";
import {tryOnMounted} from '@vueuse/core';
import {Delete, Edit} from '@element-plus/icons-vue';
import {ElMessage} from "element-plus";

const props = defineProps<{ node: RelNode, scene: RelScene[] }>()
const emit = defineEmits(['change'])

const node: Ref<RelNode> = ref<RelNode>({innerPort: 0, outerPort: 0, watcherPort: 0, grpcPort: 0});
const scenes: Ref<RelScene[]> = ref<RelScene[]>([]);

const node_form_visible = ref(false)
const node_form: Ref<RelNode> = ref<RelNode>({innerPort: 0, outerPort: 0, watcherPort: 0, grpcPort: 0})

const scene_form_visible = ref(false)
const scene_form_index = ref(0)
const scene_form: Ref<RelScene> = ref<RelScene>({type: '', replicas: 0, outer: []});

const scene_outer_form_visible = ref(false)
const scene_outer_form_index = ref(0)
const scene_outer_form: Ref<RelOuter> = ref<RelOuter>({ip: '', port: 0});

tryOnMounted(OnLoad)

watch(props, OnLoad)

function OnLoad() {
  node.value = props.node
  scenes.value = props.scene
}

function OnNodeEdit() {
  node_form.value.innerPort = node.value.innerPort
  node_form.value.outerPort = node.value.outerPort
  node_form.value.watcherPort = node.value.watcherPort
  node_form.value.grpcPort = node.value.grpcPort
  node_form_visible.value = true
}

function OnNodeEditConfirm() {
  node.value.innerPort = node_form.value.innerPort
  node.value.outerPort = node_form.value.outerPort
  node.value.watcherPort = node_form.value.watcherPort
  node.value.grpcPort = node_form.value.grpcPort
  node_form_visible.value = false
  OnChange()
}

function OnNodeEditCancel() {
  node_form_visible.value = false
}

function OnSceneAdd() {
  scene_form_index.value = -1
  scene_form.value.type = ''
  scene_form.value.replicas = 0
  scene_form.value.outer = []
  scene_form_visible.value = true
}

function OnSceneEdit(index: number) {
  scene_form_index.value = index
  const scene = scenes.value[scene_form_index.value]
  scene_form.value.type = scene.type
  scene_form.value.replicas = scene.replicas
  scene_form.value.outer = []
  scene.outer?.forEach(o => scene_form.value.outer!.push(o))
  scene_form_visible.value = true
}

function OnSceneEditConfirm() {
  // check

  // 1. unique type
  for (let i = 0; i < scenes.value.length; i++) {
    const scene = scenes.value[i];
    if (scene.type == scene_form.value.type && scene_form_index.value != i) {
      ElMessage({
        message: '类型不唯一',
        type: 'error',
        center: true,
        grouping: true,
        duration: 1000
      })
      return
    }
  }

  // 2. valid replicas
  if (scene_form.value.replicas <= 0) {
    ElMessage({
      message: '副本数量不合法',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  // 3. enough outer
  if (scene_form.value.outer!.length > 0 && scene_form.value.outer!.length < scene_form.value.replicas) {
    ElMessage({
      message: '对外地址数量不足',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  // add
  if (scene_form_index.value < 0) {
    const newScene: RelScene = {
      type: scene_form.value.type,
      replicas: scene_form.value.replicas,
      outer: [],
    }

    scene_form.value.outer!.forEach(o => newScene.outer!.push(o))
    if (scene_form.value.outer!.length == 0) {
      newScene.outer = undefined
    }
    scenes.value.push(newScene)
  }
  // change
  else {
    const scene = scenes.value[scene_form_index.value]
    scene.type = scene_form.value.type
    scene.replicas = scene_form.value.replicas
    if (scene_form.value.outer!.length == 0) {
      scene.outer = undefined
    } else {
      scene.outer = []
      scene_form.value.outer!.forEach(o => scene.outer!.push(o))
    }
  }

  OnChange()

  scene_form_visible.value = false
}

function OnSceneEditCancel() {
  scene_form_visible.value = false
}

function OnSceneDelete(index: number) {
  scenes.value.splice(index, 1)
  OnChange()
}

function OnSceneOuterAdd() {
  scene_outer_form_index.value = -1
  scene_outer_form.value.ip = ''
  scene_outer_form.value.port = 0
  scene_outer_form_visible.value = true
}

function OnSceneOuterEdit(index: number) {
  scene_outer_form_index.value = index
  const outer = scene_form.value.outer![index]
  scene_outer_form.value.ip = outer.ip
  scene_outer_form.value.port = outer.port
  scene_outer_form_visible.value = true
}

function OnSceneOuterEditConfirm() {
  // check
  if (scene_outer_form.value.ip === '' || scene_outer_form.value.port <= 0) {
    ElMessage({
      message: '地址非法',
      type: 'error',
      center: true,
      grouping: true,
      duration: 1000
    })
    return
  }

  // add
  if (scene_outer_form_index.value < 0) {
    scene_form.value.outer!.push({
      ip: scene_outer_form.value.ip,
      port: scene_outer_form.value.port,
    })
  }
  // change
  else {
    const outer = scene_form.value.outer![scene_outer_form_index.value]
    outer.ip = scene_outer_form.value.ip
    outer.port = scene_outer_form.value.port
  }
  scene_outer_form_visible.value = false
}

function OnSceneOuterEditCancel() {
  scene_outer_form_visible.value = false
}

function OnSceneOuterDelete(index: number) {
  scene_form.value.outer!.splice(index, 1)
}

function OnChange() {
  emit('change', node.value, scenes.value)
}

</script>

<style scoped>
:deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}

:deep(.node-label) {
  width: 90px;
}

.scene-info {
  margin-bottom: 20px;
}

</style>