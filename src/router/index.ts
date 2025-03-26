import { createRouter, createWebHistory } from 'vue-router'

const routes = createRouter({
  history: createWebHistory(),
  routes: [{
      path: '/',
      redirect: '/login',
  },
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    meta: { title : 'Login' }
  },
  {
    path: '/register',
    component: () => import('../views/Register.vue'),
    meta: { title : 'Register' }
  }
  ],
})