<script setup>
import {useDashboardStore} from "@/plugins/store/dashboard.js";
import { computed, onMounted } from 'vue'

const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.fetchOverview()
})

const statistics = computed(() => {
  const overview = dashboardStore.overview || {}

  return [
    {
      title: 'Sales',
      stats: overview.orders ?? '-',
      icon: 'tabler-chart-pie-2',
      color: 'primary',
    },
    {
      title: 'Customers',
      stats: overview.users ?? '-',
      icon: 'tabler-users',
      color: 'info',
    },
    {
      title: 'Products',
      stats: overview.products ?? '-',
      icon: 'tabler-shopping-cart',
      color: 'error',
    },
    {
      title: 'Revenue',
      stats: `$${parseFloat(overview.revenue || 0).toLocaleString()}`,
      icon: 'tabler-currency-dollar',
      color: 'success',
    },
  ]
})
</script>

<template>
  <VCard title="Statistics">
    <template #append>
      <span class="text-sm text-disabled">Updated just now</span>
    </template>

    <VCardText>
      <VRow>
        <VCol
          v-for="item in statistics"
          :key="item.title"
          cols="6"
          md="3"
        >
          <div class="d-flex align-center gap-4 mt-md-9 mt-0">
            <VAvatar
              :color="item.color"
              variant="tonal"
              rounded
              size="40"
            >
              <VIcon :icon="item.icon" />
            </VAvatar>

            <div class="d-flex flex-column">
              <h5 class="text-h5">
                {{ item.stats }}
              </h5>
              <div class="text-sm">
                {{ item.title }}
              </div>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

