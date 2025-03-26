import { createRouter, createWebHistory } from 'vue-router'

const routes = createRouter({
  history: createWebHistory(),
  routes: [{
      path: '/',
      redirect: '/login',
  },
  {
    path: '/login',
    component: () => import('../views/user/Login.vue'),
    meta: { title : 'Login' }
  },
  {
    path: '/register',
    component: () => import('../views/user/Register.vue'),
    meta: { title : 'Register' }
  }
  ],
})

export { routes }