<script setup>
import masterCardDark from '@images/icons/payments/img/master-dark.png'
import masterCardLight from '@images/icons/payments/img/mastercard.png'
import paypalDark from '@images/icons/payments/img/paypal-dark.png'
import paypalLight from '@images/icons/payments/img/paypal-light.png'
import {useOrderStore} from "@/plugins/store/order.js";
import {computed, watch} from "vue";

const mastercard = useGenerateImageVariant(masterCardLight, masterCardDark)
const paypal = useGenerateImageVariant(paypalLight, paypalDark)

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
    title: 'Status',
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
  if (status === 'Out for Delivery')
    return {
      text: 'Out for Delivery',
      color: 'primary',
    }
  if (status === 'Ready to Pickup')
    return {
      text: 'Ready to Pickup',
      color: 'info',
    }
  if (status === 'Dispatched')
    return {
      text: 'Dispatched',
      color: 'warning',
    }
}

const widgetData = ref()
const useOrder = useOrderStore()

useOrder.fetchOrder()

const { pending, delivered, completed, totalOrders, itemsPerPage, searchQuery, page, sortBy, orderBy, selectedRows, totalDelivered, totalPending, totalCompleted } = storeToRefs(useOrder)

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

const pendingData = computed(() => toRaw(pending.value) || [])

const rejectOrder = async id => {

}

const approveOrder = async id => {

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
        :items="pendingData"
        :items-length="totalOrders"
        show-select
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
              :color="!item.avatar ? 'primary' : ''"
              :variant="!item.avatar ? 'tonal' : undefined"
            >
              <VImg
                v-if="item.User.name"
                :src="item.User.name"
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
              :color="!item.avatar ? 'primary' : ''"
              :variant="!item.avatar ? 'tonal' : undefined"
            >
              <VImg
                v-if="item.paymentType"
                :src="item.paymentType"
              />

              <span
                v-else
                class="font-weight-medium"
              >{{ avatarText(item.paymentType) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <div class="text-body-1 font-weight-medium">
                <RouterLink
                  :to="{ name: 'pages-user-profile-tab', params: { tab: 'profile' } }"
                  class="text-link"
                >
                  {{ item.paymentType }}
                </RouterLink>
              </div>
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            v-bind="resolveStatus(item.status)"
            label
            size="small"
          />
        </template>

        <!-- Method -->
        <template #item.method="{ item }">
          <div class="d-flex align-center">
            <img
              :src="item.paymentType === 'mastercard' ? mastercard : paypal"
              height="18"
            >
            <div class="text-body-1">
              ...{{ item.paymentType === 'mastercard' ? item.paymentType : '@gmail.com' }}
            </div>
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn>
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem value="view">
                  Approve
                </VListItem>
                <VListItem
                  value="delete"
                  @click="rejectOrder(item.id)"
                >
                  Reject
                </VListItem>
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
