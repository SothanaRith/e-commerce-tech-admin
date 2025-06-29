<script setup>
import EcommerceStatistics from '@/views/dashboards/ecommerce/EcommerceStatistics.vue'
</script>

<template>
  <VRow class="match-height">
    
    <VCol cols="12">
      <EcommerceStatistics class="h-100" />
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
