import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './samples/node-api'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import {createRouter, createWebHashHistory} from 'vue-router'
import HelloWorld from "./view/hello/HelloWorld.vue";
import ExcelConverter from "./view/excel/ExcelConverter.vue";
import ConfigEditor from "./view/config/ConfigEditor.vue";

// router
const routes = [
    {path: '/', redirect: '/config'},
    {path: '/hello', component: HelloWorld},
    {path: '/excel', component: ExcelConverter},
    {path: '/config', component: ConfigEditor},
]

const router = createRouter({
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
})

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(ElementPlus, {
    locale: zhCn,
})
app.use(router)
app.mount('#app')
    .$nextTick(() => {
        postMessage({ payload: 'removeLoading' }, '*')
    })
