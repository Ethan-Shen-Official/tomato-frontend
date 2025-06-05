import { createRouter, createWebHistory } from 'vue-router'

const routes = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
      }, {
        path: '/products/update/:id',
        name: 'UpdateProduct',
        component: () => import('../views/product/UpdateProduct.vue'),
        meta: { title : 'Update Product' }
      }, {
        path: '/order',
        component: () => import('../views/order/MyOrders.vue'),
        meta: { title : 'My Orders' }
      }, {
        path: '/lottery',
        component: () => import('../views/lottery/Lottery.vue'),
        meta: { title : 'Lottery' }
      }, {
        path: '/pool',
        component: () => import('../views/lottery/Pool.vue'),
        meta: { title : 'Pool' }
      }, {
        path: '/all_coupons',
        component: () => import('../views/discount/AllCoupons.vue'),
        meta: { title : 'All Coupons' }
      }, {
        path: '/blindbox',
        component: () => import('../views/lottery/BlindBox.vue'),
        meta: { title : 'Blindbox' }
      }, {
          path: '/my_prizes',
          component: () => import('../views/lottery/MyPrizes.vue'),
          meta: { title : 'My Prizes' }
      }, {
            path: '/cart',
            component: () => import('../views/order/Cart.vue'),
            meta: { title : 'Cart' }
        }
      ]
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
      path: '/payment',
      component: () => import('../views/order/Payment.vue'),
      meta: { title : 'Payment' }
  }, {
      path: '/create_ad',
      component: () => import('../views/advertisement/CreateAdvertisement.vue'),
      meta: { title : 'Create Advertisement' }
  }, {
      path: '/payment-detail/:orderId',
      component: () => import('../views/order/PaymentDetail.vue'),
      meta: { requiresAuth: true }
  }, {
      path: '/advertisements/update/:id',
      name: 'UpdateAdvertisement',
      component: () => import('../views/advertisement/UpdateAdvertisement.vue'),
      meta: { requiresAuth: true }
  }, {
      path: '/discount/:id',
      name: 'CreateDiscount',
      component: () => import('../views/discount/CreateDiscount.vue'),
      meta: { requiresAuth: true }
  }, {
      path: '/create_coupon',
      name: 'CreateCoupon',
      component: () => import('../views/discount/CreateCoupon.vue'),
      meta: { title : 'Create Coupon' }
  }
  ],
})

export { routes }