import { createApp } from 'vue'
import routes from './router'
import App from './App.vue'
import axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

//BackEnd Port
axios.defaults.baseURL = ("http://47.116.112.229:8080")
axios.defaults.timeout = 30000;

createApp(App).use(ElementPlus).use(routes).mount('#app')