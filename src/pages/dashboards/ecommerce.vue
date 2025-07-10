<script setup>
import EcommerceStatistics from '@/views/dashboards/ecommerce/EcommerceStatistics.vue'
import InvoiceList from "@/pages/apps/ecommerce/order/InvoiceList.vue"
</script>

<template>
  <VRow class="match-height">
    <VCol cols="12">
      <EcommerceStatistics class="h-100" />
    </VCol>
  </VRow>
  <br>
  <InvoiceList 
    status-type="completed"
    :status-change-disabled="false" 
  />
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
