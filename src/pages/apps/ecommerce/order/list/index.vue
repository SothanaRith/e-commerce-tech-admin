<script setup>
import { useOrderStore } from "@/plugins/store/order"
import { computed, watch } from "vue"
import { useProductStore } from "@/plugins/store/product.js"

// Data table Headers
const headers = [
  {
    title: 'Order',
    key: 'order',
  },
  {
    title: 'Date',
    key: 'date',
  },
  {
    title: 'Customers',
    key: 'customers',
  },
  {
    title: 'Payment',
    key: 'payment',
    sortable: false,
  },
  {
    title: 'Payment Status',
    key: 'status',
  },
  {
    title: 'Method',
    key: 'method',
    sortable: false,
  },
  {
    title: 'Action',
    key: 'actions',
    sortable: false,
  },
]

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const resolveStatus = status => {
  if (status === "completed")
    return {
      text: 'Paid',
      color: 'success',
    }
  if (status === "pending")
    return {
      text: 'Pending',
      color: 'warning',
    }
  if (status === "cancelled")
    return {
      text: 'Cancelled',
      color: 'secondary',
    }
  if (status === 'Delivered')
    return {
      text: 'Delivered',
      color: 'success',
    }
  if (status === 'delivery')
    return {
      text: 'delivery',
      color: 'primary',
    }
  if (status === 'Ready to Pickup')
    return {
      text: 'Ready to Pickup',
      color: 'info',
    }
  if (status === 'cancelled')
    return {
      text: 'cancelled',
      color: 'warning',
    }
}

const changeStatus = status => {
  if (status === "pending")
    return 'delivery'
  if (status === "delivery")
    return 'delivered'
  if (status === "delivered")
    return 'completed'
}

const changeCancelStatus = status => {
  if (status === "pending")
    return 'cancelled'
  if (status === "delivery")
    return 'pending'
  if (status === "delivered")
    return 'delivery'
}


const paymentImage = type => {
  if (type.toUpperCase() === "aba".toUpperCase())
    return 'https://cdn6.aptoide.com/imgs/2/a/6/2a6b391e2053870eac06539bd99d51a6_icon.png'
  if (type.toUpperCase() === "wing".toUpperCase())
    return 'https://cdn6.aptoide.com/imgs/c/f/f/cffec3f2fc237b5e9baefcff21783b7c_icon.png'
  if (type.toUpperCase() === "acleda".toUpperCase())
    return 'https://www.acledasecurities.com.kh/as/assets/listed_company/ABC/logo.png'
  if (type.toUpperCase() === "bakong app".toUpperCase())
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAksY2TS0gKo7ahWTiy73LEAvW6Hezllu7eQ&s'
  if (type.toUpperCase() === "khqr".toUpperCase())
    return 'https://devithuotkeo.com/static/image/portfolio/khqr/khqr-5.png'
  if (type.toUpperCase() === "ABA Offline Payment".toUpperCase())
    return 'https://cdn6.aptoide.com/imgs/2/a/6/2a6b391e2053870eac06539bd99d51a6_icon.png'
}

const widgetData = ref()
const useOrder = useOrderStore()
const useProduct = useProductStore()


useOrder.fetchOrder()

const { totalOrders, itemsPerPage, searchQuery, page, sortBy, orderBy, selectedRows, totalDelivered, totalPending, totalCompleted, status, currentOrderData } = storeToRefs(useOrder)

onMounted(async () => {
  // Fetch data when component is mounted
  await useOrder.fetchOrder()
  widgetData.value = [
    {
      title: 'All Process Payment',
      value: (totalPending.value + totalDelivered.value + totalCompleted.value),
      icon: 'tabler-calendar-stats',
    },
    {
      title: 'Pending',
      value: totalPending.value,
      icon: 'tabler-checks',
    },
    {
      title: 'Delivered',
      value: totalDelivered.value,
      icon: 'tabler-wallet',
    },
    {
      title: 'Completed',
      value: totalCompleted.value,
      icon: 'tabler-alert-octagon',
    },
  ]
})

watch([searchQuery, sortBy, orderBy], async () => {
  await useOrder.fetchOrder()
  widgetData.value = [
    {
      title: 'All Process Payment',
      value: (totalPending.value + totalDelivered.value + totalCompleted.value),
      icon: 'tabler-calendar-stats',
    },
    {
      title: 'Pending',
      value: totalPending.value,
      icon: 'tabler-checks',
    },
    {
      title: 'Delivered',
      value: totalDelivered.value,
      icon: 'tabler-wallet',
    },
    {
      title: 'Completed',
      value: totalCompleted.value,
      icon: 'tabler-alert-octagon',
    },
  ]
}, { immediate: true })

watch([status], async () => {
  await useOrder.fetchOrder()
}, { immediate: true })

const updateOrderStatus = async (id, orderStatus) => {
  await useOrder.editOrder(id, orderStatus)
  status.value = orderStatus
}
</script>

<template>
  <div>
    <VCard class="mb-6">
      <!-- 👉 Widgets  -->
      <VCardText>
        <VRow>
          <template
            v-for="(data, id) in widgetData"
            :key="id"
          >
            <VCol
              cols="12"
              sm="6"
              md="3"
              class="px-6"
            >
              <div
                class="d-flex justify-space-between"
                :class="$vuetify.display.xs
                  ? id !== widgetData.length - 1 ? 'border-b pb-4' : ''
                  : $vuetify.display.sm
                    ? id < (widgetData.length / 2) ? 'border-b pb-4' : ''
                    : ''"
              >
                <div class="d-flex flex-column">
                  <h4 class="text-h4">
                    {{ data.value }}
                  </h4>

                  <div class="text-body-1">
                    {{ data.title }}
                  </div>
                </div>

                <VAvatar
                  variant="tonal"
                  rounded
                  size="42"
                >
                  <VIcon
                    :icon="data.icon"
                    size="26"
                    class="text-high-emphasis"
                  />
                </VAvatar>
              </div>
            </VCol>
            <VDivider
              v-if="$vuetify.display.mdAndUp ? id !== widgetData.length - 1
                : $vuetify.display.smAndUp ? id % 2 === 0
                  : false"
              vertical
              inset
              length="60"
            />
          </template>
        </VRow>
      </VCardText>
    </VCard>

    <VCard>
      <!-- 👉 Filters -->
      <VCardText>
        <div class="d-flex justify-sm-space-between justify-start flex-wrap gap-4">
          <AppTextField
            v-model="searchQuery"
            placeholder="Search Order"
            style=" max-inline-size: 200px; min-inline-size: 200px;"
          />

          <div class="d-flex gap-x-4 align-center">
            <AppSelect
              v-model="status"
              style="min-inline-size: 6.25rem;"
              :items="[
                'pending', 'delivery', 'delivered', 'completed', 'cancelled']"
            />
            <AppSelect
              v-model="itemsPerPage"
              style="min-inline-size: 6.25rem;"
              :items="[5, 10, 20, 50, 100]"
            />
            <VBtn
              variant="tonal"
              color="secondary"
              prepend-icon="tabler-upload"
              text="Export"
            />
          </div>
        </div>
      </VCardText>

      <VDivider />

      <!-- 👉 Order Table -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="currentOrderData"
        :items-length="totalOrders"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.order="{ item }">
          <RouterLink :to="{ name: 'apps-ecommerce-order-details-id', params: { id: item.id } }">
            #{{ item.id }}
          </RouterLink>
        </template>

        <!-- Date -->
        <template #item.date="{ item }">
          {{ new Date(item.updatedAt).toDateString() }}
        </template>

        <!-- Customers  -->
        <template #item.customers="{ item }">
          <div class="d-flex align-center gap-x-3">
            <VAvatar
              size="34"
              :color="!item.User.coverImage ? 'primary' : ''"
              :variant="!item.User.coverImage ? 'tonal' : undefined"
            >
              <VImg
                v-if="item.User.coverImage"
                :src="`${item.User.coverImage}`"
              />

              <span
                v-else
                class="font-weight-medium"
              >{{ avatarText(item.User.name) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <div class="text-body-1 font-weight-medium">
                <RouterLink
                  :to="{ name: 'pages-user-profile-tab', params: { tab: 'profile' } }"
                  class="text-link"
                >
                  {{ item.User.name }}
                </RouterLink>
              </div>
              <div class="text-body-2">
                {{ item.User.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Payments -->
        <template #item.payment="{ item }">
          <div class="d-flex align-center gap-x-1">
            <VAvatar
              size="34"
              :color="!item.paymentType ? 'primary' : ''"
              :variant="!item.paymentType ? 'tonal' : undefined"
            >
              <VImg
                v-if="item.paymentType"
                :src="paymentImage(item.paymentType)"
              />
              <span
                v-else
                class="font-weight-medium"
              ></span>
            </VAvatar>
            <div class="d-flex flex-column">
              <div class="text-body-1 font-weight-medium">
                {{ item.paymentType }}
              </div>
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            v-bind="resolveStatus(item.Transaction?.status)"
            label
            size="small"
          />
        </template>

        <!-- Method -->
        <template #item.method="{ item }">
          <div class="d-flex align-center">

            <div class="text-body-1">
              {{ item.billingNumber }}
            </div>
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn>
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <div v-if="item.status.toUpperCase() !== 'cancelled'.toUpperCase() && item.status.toUpperCase() !== 'completed'.toUpperCase()">
                  <VListItem
                    value="view"
                    :disabled="item.status.toUpperCase() === 'cancelled'.toUpperCase()"
                    @click="updateOrderStatus(item.id, changeStatus(item.status))"
                  >
                    Approve
                  </VListItem>
                </div>
                <div v-if="item.status.toUpperCase() !== 'cancelled'.toUpperCase()">
                  <VListItem
                    value="delete"
                    :disabled="item.status.toUpperCase() === 'cancelled'.toUpperCase()"
                    @click="updateOrderStatus(item.id, changeCancelStatus(item.status))"
                  >
                    Reject
                  </VListItem>
                </div>
                <div v-if="item.status.toUpperCase() !== 'pending'.toUpperCase()">
                  <VListItem :to="{ name: 'apps-invoice-edit-id', params: { id: item.id } }">
                    Invoice
                  </VListItem>
                </div>
              </VList>
            </VMenu>
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalOrders"
          />
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
.customer-title:hover {
  color: rgba(var(--v-theme-primary)) !important;
}

.product-widget {
  border-block-end: 1px solid rgba(var(--v-theme-on-surface), var(--v-border-opacity));
  padding-block-end: 1rem;
}
</style>
