import { createRouter, createWebHistory } from 'vue-router'

const routes = createRouter({
  history: createWebHistory(),
  routes: [{
      path: '/',
      redirect: '/home',
  },
  {
    path: '/home',
    redirect: '/login',
    component: () => import('../views/Home.vue'),
    children: [
      {
        path: '/dashboard',
        component: () => import('../views/user/Dashboard.vue'),
        meta: { title : 'Dashboard' }
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