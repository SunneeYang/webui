<template>
  <el-scrollbar height="700px">
    <el-divider content-position="left">Node</el-divider>
    <el-table :data="nodes" border default-expand-all row-key="name" stripe table-layout="auto">
      <el-table-column type="expand">
        <template #default="scope_node">
          <div class="scene-card">
            <el-divider content-position="left">Scene</el-divider>
            <el-table :data="scope_node.row.node.scene" border row-key="id" stripe table-layout="auto">
              <el-table-column label="Id" prop="id"/>
              <el-table-column label="Type" prop="type"/>
              <el-table-column label="Name" prop="name"/>
              <el-table-column label="OuterPort" prop="outerPort"/>
              <el-table-column label="Action">
                <template #header>
                  <el-button :icon="Plus" size="small" type="primary" @click="OnSceneAdd(scope_node.$index)"/>
                </template>
                <template #default="scope_scene">
                  <el-button-group size="small" type="primary">
                    <el-button :icon="Edit" @click="OnSceneEdit(scope_node.$index, scope_scene.$index)"/>
                    <el-button :icon="Delete" @click="OnSceneDelete(scope_node.$index, scope_scene.$index)"/>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Node" prop="name"/>
      <el-table-column label="Id" prop="node.id"/>
      <el-table-column label="Name" prop="node.name"/>
      <el-table-column label="IP" prop="node.ip"/>
      <el-table-column label="InnerPort" prop="node.innerPort"/>
      <el-table-column label="GrpcPort" prop="node.grpcPort"/>
      <el-table-column label="WatcherPort" prop="node.watcherPort"/>
      <el-table-column label="Action">
        <template #header>
          <el-button :icon="Plus" size="small" type="primary" @click="OnNodeAdd"/>
        </template>
        <template #default="scope">
          <el-button-group size="small" type="primary">
            <el-button :icon="Edit" @click="OnNodeEdit(scope.$index)"/>
            <el-button :icon="Delete" @click="OnNodeDelete(scope.$index)"/>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </el-scrollbar>

  <el-dialog v-model="node_form_visible" title="Node" width="80%">
    <el-form :model="node_form" label-position="left" label-width="120px">
      <el-form-item label="NodeName">
        <el-input v-model="node_form.name"/>
      </el-form-item>
      <el-form-item label="Id">
        <el-input-number v-model="node_form.node.id"/>
      </el-form-item>
      <el-form-item label="Name">
        <el-input v-model="node_form.node.name"/>
      </el-form-item>
      <el-form-item label="IP">
        <el-input v-model="node_form.node.ip"/>
      </el-form-item>
      <el-form-item label="InnerPort">
        <el-input-number v-model="node_form.node.innerPort"/>
      </el-form-item>
      <el-form-item label="GrpcPort">
        <el-input-number v-model="node_form.node.grpcPort"/>
      </el-form-item>
      <el-form-item label="WatcherPort">
        <el-input-number v-model="node_form.node.watcherPort"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="OnNodeEditConfirm">确认</el-button>
        <el-button @click="OnNodeEditCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-dialog v-model="scene_form_visible" title="Scene" width="50%">
    <el-form :model="scene_form" label-position="left" label-width="120px">
      <el-form-item label="Id">
        <el-input-number v-model="scene_form.id"/>
      </el-form-item>
      <el-form-item label="Type">
        <el-input v-model="scene_form.type"/>
      </el-form-item>
      <el-form-item label="Name">
        <el-input v-model="scene_form.name"/>
      </el-form-item>
      <el-form-item label="OuterPort">
        <el-input-number v-model="scene_form.outerPort"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="OnSceneEditConfirm">确认</el-button>
        <el-button @click="OnSceneEditCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>

import {DevNode, DevScene} from "../../module/definition";
import {Ref, ref, watch} from "vue";
import {tryOnMounted} from "@vueuse/core";
import {Delete, Edit, Plus} from '@element-plus/icons-vue';

const props = defineProps<{ node: Map<string, DevNode> }>()
const emit = defineEmits(['change'])

interface NodeInfo {
  name: string,
  node: DevNode,
}

const nodes: Ref<NodeInfo[]> = ref<NodeInfo[]>([])

const node_index = ref(0)
const node_form_visible = ref(false)
const node_form: Ref<NodeInfo> = ref<NodeInfo>({
  name: '',
  node: {
    id: 0,
    name: '',
    ip: '',
    innerPort: 0,
    grpcPort: 0,
    watcherPort: 0,
    scene: [],
  },
})

const scene_index = ref(0)
const scene_form_visible = ref(false)
const scene_form: Ref<DevScene> = ref<DevScene>({
  id: 0,
  type: '',
  name: '',
  outerPort: 0,
})

tryOnMounted(OnLoad)
watch(props, OnLoad)

function OnLoad() {
  nodes.value = []
  props.node.forEach((v, k) => {
    nodes.value.push({
      name: k,
      node: v,
    })
  })
}

function OnNodeAdd() {
  node_index.value = -1

  node_form.value.name = ''
  node_form.value.node.id = 0
  node_form.value.node.name = ''
  node_form.value.node.ip = ''
  node_form.value.node.innerPort = 0
  node_form.value.node.grpcPort = 0
  node_form.value.node.watcherPort = 0
  node_form.value.node.scene = []

  node_form_visible.value = true
}

function OnNodeEdit(index: number) {
  node_index.value = index

  const node = nodes.value[index]
  node_form.value.name = node.name
  node_form.value.node.id = node.node.id
  node_form.value.node.name = node.node.name
  node_form.value.node.ip = node.node.ip
  node_form.value.node.innerPort = node.node.innerPort
  node_form.value.node.grpcPort = node.node.grpcPort
  node_form.value.node.watcherPort = node.node.watcherPort
  node.node.scene.forEach(s => {
    node_form.value.node.scene.push(s)
  })

  node_form_visible.value = true
}

function OnNodeEditConfirm() {
  // check

  // add
  if (node_index.value === -1) {
    const newNode: NodeInfo = {
      name: node_form.value.name,
      node: {
        id: node_form.value.node.id,
        name: node_form.value.node.name,
        ip: node_form.value.node.ip,
        innerPort: node_form.value.node.innerPort,
        grpcPort: node_form.value.node.grpcPort,
        watcherPort: node_form.value.node.watcherPort,
        scene: [],
      },
    }
    node_form.value.node.scene.forEach(s => newNode.node.scene.push(s))
    nodes.value.push(newNode)
  } else {
    // edit
    const node = nodes.value[node_index.value]
    node.name = node_form.value.name
    node.node.id = node_form.value.node.id
    node.node.name = node_form.value.node.name
    node.node.ip = node_form.value.node.ip
    node.node.innerPort = node_form.value.node.innerPort
    node.node.grpcPort = node_form.value.node.grpcPort
    node.node.watcherPort = node_form.value.node.watcherPort
    node.node.scene = []
    node_form.value.node.scene.forEach(s => node.node.scene.push(s))
  }

  OnChange()

  node_form_visible.value = false
}

function OnNodeEditCancel() {
  node_form_visible.value = false
}

function OnNodeDelete(index: number) {
  nodes.value.splice(index, 1)
  OnChange()
}

function OnSceneAdd(nodeIndex: number) {
  node_index.value = nodeIndex
  scene_index.value = -1

  scene_form.value.id = 0
  scene_form.value.type = ''
  scene_form.value.name = ''

  scene_form_visible.value = true
}

function OnSceneEdit(nodeIndex: number, sceneIndex: number) {
  node_index.value = nodeIndex
  scene_index.value = sceneIndex

  const scene = nodes.value[nodeIndex].node.scene[sceneIndex]
  scene_form.value.id = scene.id
  scene_form.value.type = scene.type
  scene_form.value.name = scene.name
  scene_form.value.outerPort = scene.outerPort

  scene_form_visible.value = true
}

function OnSceneEditConfirm() {
  // check
  

  // add
  if (scene_index.value === -1) {
    const newScene: DevScene = {
      id: scene_form.value.id,
      type: scene_form.value.type,
      name: scene_form.value.name,
      outerPort: scene_form.value.outerPort
    }
    if (newScene.outerPort == null || newScene.outerPort == 0) {
      newScene.outerPort = undefined
    }
    nodes.value[node_index.value].node.scene.push(newScene)
  } else {
    // edit
    const scene = nodes.value[node_index.value].node.scene[scene_index.value]
    scene.id = scene_form.value.id
    scene.type = scene_form.value.type
    scene.name = scene_form.value.name
    scene.outerPort = scene_form.value.outerPort
    if (scene.outerPort == null || scene.outerPort == 0) {
      scene.outerPort = undefined
    }
  }

  OnChange()

  scene_form_visible.value = false
}

function OnSceneEditCancel() {
  scene_form_visible.value = false
}

function OnSceneDelete(node_index: number, scene_index: number) {
  nodes.value[node_index].node.scene.splice(scene_index, 1)
  OnChange()
}

function OnChange() {
  const map = new Map<string, DevNode>()
  nodes.value.forEach(n => {
    map.set(n.name, n.node)
  })
  emit('change', map)
}

</script>

<style scoped>

.scene-card {
  padding: 0 20px 20px 20px;
}

</style>