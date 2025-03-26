import { createApp } from 'vue'
import {routes} from './router'
import App from './App.vue'
import axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

//TODO: BackEnd Port
axios.defaults.baseURL = ("http://localhost:8080")
axios.defaults.timeout = 30000;

createApp(App).use(ElementPlus).use(routes).mount('#app')