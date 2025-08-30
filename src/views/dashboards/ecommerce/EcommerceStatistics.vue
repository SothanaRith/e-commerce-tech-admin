<script setup>
import { useDashboardStore } from '@/plugins/store/dashboard'
import { computed, onMounted, ref, watch } from 'vue'

// ✅ your in-house chart card
import CardStatisticsOrderBarCharts from '@/views/pages/cards/card-statistics/CardStatisticsOrderBarCharts.vue'

const dashboardStore = useDashboardStore()
const userData = useCookie('userData') // Ref

// ======= existing UI state =======
const loading = ref(false)
const errorMsg = ref(null)
const lastUpdated = ref(null)

const refreshAll = async () => {
  try {
    loading.value = true
    errorMsg.value = null
    await Promise.all([
      dashboardStore.fetchOverview(),
      dashboardStore.fetchSalesChart('all'),
      dashboardStore.fetchTopProducts(5),
    ])
    lastUpdated.value = new Date()
  } catch (e) {
    errorMsg.value = e?.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await refreshAll()
  await loadLowStock()
})

// ---- helpers ----
const formatNumber = n => (n ?? 0).toLocaleString()
const formatMoney = n => `$${Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

const pctChange = (curr, prev) => {
  const c = Number(curr ?? 0)
  const p = Number(prev ?? 0)
  if (p === 0 && c === 0) return 0
  if (p === 0) return 100
  
  return ((c - p) / p) * 100
}

const relativeTime = computed(() => {
  if (!lastUpdated.value) return '—'
  const diff = Math.max(0, Date.now() - lastUpdated.value.getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  
  return `${days}d ago`
})

// Map store salesChart -> chart props
const rows = computed(() => dashboardStore.salesChart || [])
const orderCategories = computed(() => rows.value.map(r => r.date))

const orderSeries = computed(() => [
  { name: 'Orders', data: rows.value.map(r => Number(r.orders || 0)) },
])

// Extract latest vs previous from salesChart for Sales/Revenue trends (for the stat chips)
const salesDelta = computed(() => {
  const r = rows.value
  if (r.length < 2) return { orders: null, revenue: null }
  const last = r[r.length - 1]
  const prev = r[r.length - 2]
  
  return {
    orders: pctChange(Number(last.orders), Number(prev.orders)),
    revenue: pctChange(Number(last.revenue), Number(prev.revenue)),
  }
})

const statistics = computed(() => {
  const o = dashboardStore.overview || {}
  const revDelta = salesDelta.value.revenue
  const ordDelta = salesDelta.value.orders
  
  return [
    { title: 'Sales',    stats: formatNumber(o.orders),   icon: 'tabler-chart-pie-2',  color: 'primary', delta: ordDelta },
    { title: 'Customers', stats: formatNumber(o.users),    icon: 'tabler-users',        color: 'info',    delta: null },
    { title: 'Products', stats: formatNumber(o.products), icon: 'tabler-shopping-cart', color: 'error',   delta: null },
    { title: 'Revenue',  stats: formatMoney(o.revenue||0), icon: 'tabler-currency-dollar', color: 'success', delta: revDelta },
  ]
})

const baseUrl = import.meta.env.VITE_BASE_IMG_URL || ''

// Top products preview (first image, name, totalSold, revenue)
const topProducts = computed(() => {
  const list = dashboardStore.topProducts || []
  
  return list.map(p => {
    const img = Array.isArray(p.product?.imageUrl) && p.product.imageUrl.length
      ? p.product.imageUrl[0]
      : null

    const absolute = img && (/^https?:\/\//i.test(img) || /^data:/.test(img)) ? img : (img ? `${baseUrl}${img}` : null)
    
    return {
      id: p.id ?? p.product?.id ?? p.productId,
      name: p.name ?? p.product?.name ?? '—',
      image: absolute,
      totalSold: p.totalSold ?? p.raw?.totalSold ?? 0,
      totalRevenue: p.totalRevenue ?? p.raw?.totalRevenue ?? 0,
      price: p.price ?? p.product?.price ?? 0,
      totalStock: p.totalStock ?? p.product?.totalStock ?? 0,
    }
  })
})

/* =========================
   LOW STOCK (new section)
   ========================= */
const lowStockLoading = ref(false)
const lowStockError = ref(null)

const lowStockOpts = ref({
  per: 'variant',           // 'product' | 'variant'
  threshold: 5,
  recomputeTotal: false,    // if true -> recompute SUM(variants.stock)
  includeInactive: false,
  page: 1,
  size: 10,
  userId: undefined,        // optionally set if you want cart/wishlist flags
})

const loadLowStock = async () => {
  try {
    lowStockLoading.value = true
    lowStockError.value = null
    await dashboardStore.fetchLowStock({ ...lowStockOpts.value })
  } catch (e) {
    lowStockError.value = e?.message || 'Failed to load low-stock items'
  } finally {
    lowStockLoading.value = false
  }
}

// Re-fetch when filters/pagination change
watch(lowStockOpts, () => {
  loadLowStock()
}, { deep: true })

const lowStock = computed(() => dashboardStore.lowStock || {
  mode: 'product',
  threshold: 5,
  data: [],
  pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
})

// convenience getters
const lowMode = computed(() => lowStock.value.mode)
const lowRows = computed(() => lowStock.value.data || [])
const lowPage = computed(() => lowStock.value.pagination?.currentPage || 1)
const lowTotalPages = computed(() => lowStock.value.pagination?.totalPages || 0)

const nextLowPage = () => {
  if (lowPage.value < lowTotalPages.value) {
    lowStockOpts.value.page = lowPage.value + 1
  }
}

const prevLowPage = () => {
  if (lowPage.value > 1) {
    lowStockOpts.value.page = lowPage.value - 1
  }
}
</script>

<template>
  <VCard>
    <template #title>
      <div class="d-flex align-center justify-space-between w-100">
        <div class="d-flex align-center gap-2">
          <span>Statistics</span>
          <VTooltip text="Summary cards for your store health">
            <template #activator="{ props }">
              <VIcon
                v-bind="props"
                icon="tabler-info-circle"
                size="18"
                class="text-medium-emphasis"
              />
            </template>
          </VTooltip>
        </div>

        <div class="d-flex align-center gap-3">
          <div class="text-caption text-disabled">
            Updated {{ relativeTime }}
          </div>

          <VBtn
            size="small"
            variant="tonal"
            color="primary"
            prepend-icon="tabler-refresh"
            :loading="loading"
            @click="refreshAll"
          >
            Refresh
          </VBtn>
        </div>
      </div>
    </template>

    <div v-if="userData.role !== 'stock'">
      <VAlert
        v-if="errorMsg"
        type="error"
        variant="tonal"
        class="mx-4 mt-4"
        closable
      >
        {{ errorMsg }}
      </VAlert>

      <VCardText>
        <VRow v-if="loading">
          <VCol
            v-for="i in 4"
            :key="i"
            cols="6"
            md="3"
          >
            <VSkeletonLoader type="list-item-two-line" />
          </VCol>
        </VRow>

        <VRow v-else>
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
                <div class="d-flex align-center gap-2">
                  <h5 class="text-h5">
                    {{ item.stats }}
                  </h5>
                  <VChip
                    v-if="item.delta !== null && !Number.isNaN(item.delta)"
                    size="small"
                    :color="item.delta >= 0 ? 'success' : 'error'"
                    variant="tonal"
                  >
                    <VIcon
                      size="14"
                      :icon="item.delta >= 0 ? 'tabler-trending-up' : 'tabler-trending-down'"
                      class="me-1"
                    />
                    {{ Math.abs(item.delta).toFixed(1) }}%
                  </VChip>
                </div>
                <div class="text-sm text-medium-emphasis">
                  {{ item.title }}
                </div>
              </div>
            </div>
          </VCol>
        </VRow>
      </VCardText>

      <!-- Orders chart card (uses your in-house component) -->
      <VDivider />
      <VCardText>
        <CardStatisticsOrderBarCharts
          :categories="orderCategories"
          :series="orderSeries"
        />
      </VCardText>
    </div>
    <!-- Top products preview -->
    <VDivider />
    <VCardText>
      <div class="d-flex align-center justify-space-between mb-3">
        <h6 class="text-h6">
          Top Products
        </h6>
        <VBtn
          size="small"
          variant="text"
          prepend-icon="tabler-external-link"
          @click="$router.push({ name: 'apps-ecommerce-product-list' })"
        >
          View all
        </VBtn>
      </div>

      <VRow v-if="loading">
        <VCol cols="12">
          <VSkeletonLoader type="image, list-item-two-line" />
        </VCol>
      </VRow>

      <VRow v-else-if="topProducts.length">
        <VCol
          v-for="p in topProducts"
          :key="p.id"
          cols="12"
          md="6"
          lg="4"
        >
          <div class="d-flex align-start gap-4">
            <VImg
              :src="p.image || 'https://via.placeholder.com/80x80?text=No+Image'"
              width="64"
              height="64"
              cover
              class="rounded"
            />
            <div class="flex-grow-1">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-1">
                  {{ p.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Stock: {{ p.totalStock }}
                </div>
              </div>
              <div class="text-caption text-medium-emphasis">
                Price: {{ formatMoney(p.price) }}
              </div>
              <div class="d-flex gap-3 mt-1">
                <VChip
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  Sold: {{ formatNumber(p.totalSold) }}
                </VChip>
                <VChip
                  size="small"
                  color="success"
                  variant="tonal"
                >
                  Revenue: {{ formatMoney(p.totalRevenue) }}
                </VChip>
              </div>
            </div>
          </div>
        </VCol>
      </VRow>

      <div
        v-else
        class="text-medium-emphasis"
      >
        No top products yet.
      </div>
    </VCardText>

    <!--
      =========================
      LOW STOCK (new section)
      ========================= 
    -->
    <VDivider />
    <VCardText>
      <div class="d-flex align-center justify-space-between mb-3">
        <h6 class="text-h6">
          Low stock alerts
        </h6>

        <div class="d-flex align-center gap-3">
          <VTextField
            v-model.number="lowStockOpts.threshold"
            type="number"
            min="0"
            label="Threshold"
            density="compact"
            hide-details
            style="max-width: 120px"
          />
        </div>
      </div>

      <VAlert
        v-if="lowStockError"
        type="error"
        variant="tonal"
        class="mb-3"
        closable
      >
        {{ lowStockError }}
      </VAlert>

      <VTable
        v-if="lowRows.length"
        density="comfortable"
      >
        <thead>
          <tr v-if="lowMode === 'product'">
            <th class="text-left">
              Product
            </th>
            <th class="text-left">
              Category
            </th>
            <th class="text-right">
              Total Stock
            </th>
            <th class="text-right">
              Price
            </th>
          </tr>
          <tr v-else>
            <th class="text-left">
              Product
            </th>
            <th class="text-left">
              Variant
            </th>
            <th class="text-left">
              SKU
            </th>
            <th class="text-right">
              Stock
            </th>
            <th class="text-right">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- product mode rows -->
          <template v-if="lowMode === 'product'">
            <tr
              v-for="p in lowRows"
              :key="p.id"
            >
              <td class="text-left">
                {{ p.name }}
              </td>
              <td class="text-left">
                {{ p.category?.name || '—' }}
              </td>
              <td class="text-right">
                {{ p.totalStock }}
              </td>
              <td class="text-right">
                {{ formatMoney(p.price) }}
              </td>
            </tr>
          </template>

          <!-- variant mode rows -->
          <template v-else>
            <tr
              v-for="v in lowRows"
              :key="v.variantId"
            >
              <td class="text-left">
                {{ v.product?.name || '—' }}
              </td>
              <td class="text-left">
                {{ v.title || '—' }}
              </td>
              <td class="text-left">
                {{ v.sku || '—' }}
              </td>
              <td class="text-right">
                {{ v.stock }}
              </td>
              <td class="text-right">
                {{ formatMoney(v.price) }}
              </td>
            </tr>
          </template>
        </tbody>
      </VTable>

      <div
        v-else
        class="text-medium-emphasis"
      >
        Nothing is under the selected threshold.
      </div>

      <!-- pagination -->
      <div class="d-flex align-center justify-end gap-2 mt-3">
        <VBtn
          size="small"
          variant="text"
          :disabled="lowPage <= 1 || lowStockLoading"
          @click="prevLowPage"
        >
          Prev
        </VBtn>
        <div class="text-caption">
          Page {{ lowPage }} / {{ lowTotalPages || 1 }}
        </div>
        <VBtn
          size="small"
          variant="text"
          :disabled="lowPage >= lowTotalPages || lowStockLoading"
          @click="nextLowPage"
        >
          Next
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
