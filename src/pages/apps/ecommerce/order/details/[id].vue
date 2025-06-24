<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '@/plugins/store/order'

const useOrder = useOrderStore()
const route = useRoute('apps-ecommerce-order-details-id')

const orderData = ref(null)
const orderDetail = ref([])
const totalAmount = ref()
const trackingSteps = ref()

const isConfirmDialogVisible = ref(false)
const baseUrl = import.meta.env.VITE_BASE_IMG_URL
const isUserInfoEditDialogVisible = ref(false)
const isEditAddressDialogVisible = ref(false)

// Headers for product table
const headers = [
  { title: 'Product', key: 'productName' },
  { title: 'Price', key: 'price' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Total', key: 'total' },
]

// Resolve payment status
const resolvePaymentStatus = status => {
  const map = {
    'paid': { text: 'Paid', color: 'success' },
    'pending': { text: 'Pending', color: 'warning' },
    'cancelled': { text: 'Cancelled', color: 'secondary' },
    'failed': { text: 'Failed', color: 'error' },
  }

  
  return map[status?.toLowerCase()] || { text: status, color: 'default' }
}

// Resolve delivery status
const resolveStatus = status => {
  const map = {
    'Delivered': { text: 'Delivered', color: 'success' },
    'Out for Delivery': { text: 'Out for Delivery', color: 'primary' },
    'Ready to Pickup': { text: 'Ready to Pickup', color: 'info' },
    'Dispatched': { text: 'Dispatched', color: 'warning' },
  }

  
  return map[status] || { text: status, color: 'default' }
}

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  await useOrder.fetchOrderById(route.params.id)
  orderData.value = useOrder.orderSingleData
  totalAmount.value = orderData.value?.totalAmount
  trackingSteps.value = orderData.value?.trackingSteps

  // Process product list
  orderDetail.value = orderData.value?.orderItems?.map(item => ({
    productName: item.Product?.name || 'N/A',
    productImage: `${baseUrl}${item.Product?.imageUrl?.[0] || ''}`,
    subtitle: item.Product?.description || '',
    price: parseFloat(item.Product?.price || 0).toFixed(2),
    quantity: item.quantity,
    total: parseFloat(item.price || 0).toFixed(2),
  })) || []
}

// User & billing data (update dynamically if needed)
const userData = ref({
  id: null,
  fullName: orderData.value?.User?.name || '',
  email: orderData.value?.User?.email || '',
  contact: orderData.value?.User?.phone || '',
  avatar: orderData.value?.User?.coverImage ? `${baseUrl}${orderData.value?.User?.coverImage}` : '',
  status: 'Active',
  taxId: 'Tax-8894',
  language: 'English',
  currentPlan: '',
})

const currentBillingAddress = ref({
  fullName: orderData.value?.address?.fullName || '',
  firstName: orderData.value?.address?.fullName?.split(' ')[0] || '',
  lastName: orderData.value?.address?.fullName?.split(' ')[1] || '',
  selectedCountry: 'Cambodia',
  addressLine1: orderData.value?.address?.street || '',
  landmark: orderData.value?.address?.fullName || '',
  contact: orderData.value?.address?.phoneNumber || '',
})

const changeStatus = status => {
  if (status === "pending")
    return { status: 'delivery', text: 'Approve Order' }
  if (status === "delivery")
    return { status: 'delivered', text: 'delivered Order' }
  if (status === "delivered")
    return { status: 'completed', text: 'Done Order' }
  if (status === 'cancelled')
    return { status: 'cancelled', text: 'Reject Order' }
}

const changeCancelStatus = status => {
  if (status === "pending")
    return { status: 'cancelled', text: 'Reject Order' }
  if (status === "delivery")
    return { status: 'pending', text: 'Reject delivery' }
  if (status === "delivered")
    return { status: 'delivery', text: 'Reject delivery' }

}

const updateOrderStatus = async (id, orderStatus) => {
  await useOrder.editOrder(id, orderStatus)
  await fetchData()
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center flex-wrap gap-y-4 mb-6">
      <div>
        <div class="d-flex gap-2 align-center mb-2 flex-wrap">
          <h5 class="text-h5">
            Order #{{ route.params.id }}
          </h5>

          <div class="d-flex gap-x-2">
            <VChip
              v-if="orderData?.status"
              v-bind="resolveStatus(orderData?.status)"
              label
              size="small"
            />
          </div>
        </div>

        <div class="text-body-1">
          {{ new Date(orderData?.createdAt).toLocaleString() }}
        </div>
      </div>

      <div class="d-flex ga-2">
        <div v-if="orderData?.status !== 'cancelled' && orderData?.status !== 'completed'">
          <VChip
            v-bind="changeStatus(orderData?.status)"
            color="success"
            label
            size="large"
            @click="updateOrderStatus(orderData?.id, changeStatus(orderData?.status).status)"
          />
        </div>
        <div v-if="orderData?.status !== 'cancelled' && orderData?.status !== 'completed'">
          <VChip
            v-bind="changeCancelStatus(orderData?.status)"
            color="warning"
            label
            size="large"
            @click="updateOrderStatus(orderData?.id, changeCancelStatus(orderData?.status).status)"
          />
        </div>
      </div>
    </div>

    <VRow>
      <!-- LEFT: Order Detail -->
      <VCol
        cols="12"
        md="8"
      >
        <VCard class="mb-6">
          <VCardItem>
            <template #title>
              <h5 class="text-h5">
                Order Details
              </h5>
            </template>
            <template #append />
          </VCardItem>

          <VDivider />

          <VDataTable
            :headers="headers"
            :items="orderDetail"
            item-value="productName"
            class="text-no-wrap"
          >
            <template #item.productName="{ item }">
              <div class="d-flex gap-x-3 align-center">
                <VAvatar
                  size="34"
                  :image="item.productImage"
                  :rounded="0"
                />
                <div class="d-flex flex-column align-start">
                  <h6 class="text-h6">
                    {{ item.productName }}
                  </h6>
                  <span class="text-body-2">{{ item.subtitle }}</span>
                </div>
              </div>
            </template>
            <template #item.price="{ item }">
              <div>${{ item.price }}</div>
            </template>
            <template #item.total="{ item }">
              <div>${{ item.total }}</div>
            </template>
            <template #item.quantity="{ item }">
              <div>{{ item.quantity }}</div>
            </template>
            <template #bottom />
          </VDataTable>

          <VDivider />

          <VCardText>
            <div class="d-flex align-end flex-column">
              <table class="text-high-emphasis">
                <tbody>
                  <tr>
                    <td width="200px">
                      Subtotal:
                    </td>
                    <td class="font-weight-medium">
                      ${{ totalAmount }}
                    </td>
                  </tr>
                  <tr>
                    <td>Shipping Total:</td>
                    <td class="font-weight-medium">
                      $0
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-medium">
                      Total:
                    </td>
                    <td class="font-weight-medium">
                      ${{ totalAmount }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </VCardText>
        </VCard>

        <!-- Shipping Activity -->
        <VCard title="Shipping Activity">
          <VCardText>
            <VTimeline
              truncate-line="both"
              line-inset="9"
              align="start"
              side="end"
              line-color="primary"
              density="compact"
            >
              <VTimelineItem
                v-for="(step, i) in trackingSteps"
                :key="i"
                dot-color="primary"
                size="x-small"
              >
                <div class="d-flex justify-space-between align-center">
                  <div class="app-timeline-title">
                    {{ step.status }}
                  </div>
                  <div class="app-timeline-meta">
                    {{ new Date(step.timestamp).toLocaleString() }}
                  </div>
                </div>
                <p class="app-timeline-text mt-3 mb-0">
                  Status update: {{ step.status }}
                </p>
              </VTimelineItem>
            </VTimeline>
          </VCardText>
        </VCard>
      </VCol>

      <!-- RIGHT: Customer + Address -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="mb-6">
          <VCardText class="d-flex flex-column gap-y-6">
            <h5 class="text-h5">
              Customer details
            </h5>

            <div class="d-flex align-center">
              <VAvatar
                :image="baseUrl + orderData?.User?.coverImage"
                :rounded="1"
                class="me-3"
              />
              <div>
                <h6 class="text-h6">
                  {{ orderData?.User?.name }}
                </h6>
                <div class="text-body-1">
                  Customer ID: #{{ orderData?.User?.id }}
                </div>
              </div>
            </div>

            <div class="d-flex justify-space-between align-center">
              <h6 class="text-h6">
                Contact Info
              </h6>
            </div>

            <span>Email: {{ orderData?.User?.email }}</span>
            <span>Mobile: {{ orderData?.User?.phone }}</span>
          </VCardText>
        </VCard>

        <!-- Address -->
        <VCard class="mb-6">
          <VCardItem>
            <VCardTitle>Shipping Address</VCardTitle>
            <template #append />
          </VCardItem>
          <VCardText>
            <div class="text-body-1">
              {{ orderData?.address?.street }}
              <br>
              Phone: {{ orderData?.address?.phoneNumber }}
              <br>
              Name: {{ orderData?.address?.fullName }}
            </div>
          </VCardText>
        </VCard>

        <!-- Billing Info -->
        <VCard>
          <VCardText>
            <div class="d-flex align-center justify-space-between mb-2">
              <h5 class="text-h5">
                Billing Address
              </h5>
            </div>
            <div>
              {{ orderData?.address?.street }}
              <br>
              Name: {{ orderData?.address?.fullName }}
              <br>
              Phone: {{ orderData?.address?.phoneNumber }}
            </div>

            <div class="mt-6">
              <div class="d-flex gap-x-2 gap-y-3 align-center">
                <h5 class="text-h5 mb-1">
                  Payment
                </h5>
                <VChip
                  v-if="orderData?.Transaction?.status"
                  variant="tonal"
                  :color="resolvePaymentStatus(orderData.Transaction.status)?.color"
                  label
                  size="small"
                >
                  {{ resolvePaymentStatus(orderData.Transaction.status)?.text }}
                </VChip>
              </div>
              <div class="text-body-1">
                Method: {{ orderData?.Transaction?.paymentType }}
              </div>
              <div class="text-body-1">
                Billing Number: {{ orderData?.billingNumber }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Dialogs -->
    <ConfirmDialog
      v-model:is-dialog-visible="isConfirmDialogVisible"
      confirmation-question="Are you sure to cancel your Order?"
      cancel-msg="Order cancelled!!"
      cancel-title="Cancelled"
      confirm-msg="Your order cancelled successfully."
      confirm-title="Cancelled!"
    />
    <UserInfoEditDialog
      v-model:is-dialog-visible="isUserInfoEditDialogVisible"
      :user-data="userData"
    />

    <AddEditAddressDialog
      v-model:is-dialog-visible="isEditAddressDialogVisible"
      :billing-address="currentBillingAddress"
    />
  </div>
</template>

