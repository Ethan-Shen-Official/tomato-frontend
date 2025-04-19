<template>
  <div ref="paymentContainer"></div>
</template>

<script setup lang="ts">
import { routes } from '../../router';
import { callPayment } from '../../api/order';
import { onMounted,ref } from 'vue';

const router = routes;
const orderId = router.currentRoute.value.params.orderId as string;
const formhtml = ref('');
const paymentContainer = ref<HTMLElement | null>(null);
onMounted (() => {
  callPayment(orderId).then((res) => {
    if (res.data.code === '200') {
      formhtml.value = res.data.data.form;
    } else if (res.data.code === '400') {
      ElMessage.error(res.data.msg);
    }
    if (paymentContainer.value) {
      paymentContainer.value.innerHTML = formhtml.value;
      const form = document.querySelector('form');
      if (form) {
        form.submit();
      } else {
        ElMessage.error('支付表单加载失败');
      }
    }
  }).catch((error) => {
    console.error('支付请求失败:', error);
    ElMessage.error('支付请求失败，请稍后再试。');
  });
})

</script>

<style scoped>
    
</style>