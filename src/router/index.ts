import { createRouter, createWebHistory } from 'vue-router'

const routes = createRouter({
  history: createWebHistory(),
  routes: [{
      path: '/',
      redirect: '/home',
  },
  {
    path: '/home',
    redirect: '/all',
    component: () => import('../views/Home.vue'),
    children: [
      {
        path: '/dashboard',
        component: () => import('../views/user/Dashboard.vue'),
        meta: { title : 'Dashboard' }
      }, {
        path: '/all',
        component: () => import('../views/product/AllProducts.vue'),
        meta: { title : 'All Product' }
      }, {
        path: '/products/:id',
        name: 'ProductDetail',
        component: () => import('../views/product/ProductDetail.vue'),
        meta: { title : 'Product Detail' }
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
  }, {
      path: '/create',
      component: () => import('../views/product/CreateProducts.vue'),
      meta: { title : 'Create Product' }
  }, {
      path: '/products/update/:id',
      name: 'UpdateProduct',
      component: () => import('../views/product/UpdateProduct.vue'),
      meta: { title : 'Update Product' }
    }
  ],
})

export { routes }