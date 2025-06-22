<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import InvoiceAddPaymentDrawer from '@/views/apps/invoice/InvoiceAddPaymentDrawer.vue'
import InvoiceEditable from '@/views/apps/invoice/InvoiceEditable.vue'
import { useOrderStore } from '@/plugins/store/order.js'

// Router
const route = useRoute()

// Store & refs
const useOrder = useOrderStore()
const orderData = ref(null)
const orderDetail = ref([])
const totalAmount = ref()
const trackingSteps = ref()
const invoiceData = ref(null)

// Drawer states
const isAddPaymentSidebarActive = ref(false)

const userData = ref({})
const currentBillingAddress = ref({})

const fetchData = async () => {
  await useOrder.fetchOrderById(route.params.id)
  orderData.value = useOrder.orderSingleData

  if (!orderData.value) return

  totalAmount.value = orderData.value.totalAmount
  trackingSteps.value = orderData.value.trackingSteps

  // Product list
  orderDetail.value = orderData.value.orderItems?.map(item => ({
    productName: item.Product?.name || 'N/A',
    productImage: `${item.Product?.imageUrl?.[0] || ''}`,
    subtitle: item.Product?.description || '',
    price: parseFloat(item.Product?.price || 0).toFixed(2),
    quantity: item.quantity,
    total: parseFloat(item.price || 0).toFixed(2),
  })) || []

  // User billing data
  userData.value = {
    id: orderData.value.User?.id || null,
    fullName: orderData.value.User?.name || '',
    email: orderData.value.User?.email || '',
    contact: orderData.value.User?.phone || '',
    avatar: orderData.value.User?.coverImage ? `${orderData.value.User?.coverImage}` : '',
    status: 'Active',
    taxId: 'Tax-8894',
    language: 'English',
    currentPlan: '',
  }

  currentBillingAddress.value = {
    fullName: orderData.value.address?.fullName || '',
    firstName: orderData.value.address?.fullName?.split(' ')[0] || '',
    lastName: orderData.value.address?.fullName?.split(' ')[1] || '',
    selectedCountry: 'Cambodia',
    addressLine1: orderData.value.address?.street || '',
    landmark: orderData.value.address?.fullName || '',
    contact: orderData.value.address?.phoneNumber || '',
  }

  // Optional: Prepare full invoiceData to pass to InvoiceEditable
  invoiceData.value = {
    invoice: orderData.value,
    orderDetail: orderDetail.value,
    userData: userData.value,
    currentBillingAddress: currentBillingAddress.value,
  }
}

onMounted(fetchData)
</script>

<template>
  <VRow v-if="invoiceData && invoiceData.invoice">
    <!-- 👉 InvoiceEditable -->
    <VCol cols="12" md="9">
      <InvoiceEditable
        :data="invoiceData"
        @push="addProduct"
        @remove="removeProduct"
      />
    </VCol>

    <!-- 👉 Right Column: Invoice Action -->
    <VCol cols="12" md="3">
      <VCard class="mb-8">
        <VCardText>
          <div class="d-flex flex-wrap gap-4">
            <!-- 👉 Preview button -->
            <VBtn
              color="secondary"
              variant="tonal"
              class="flex-grow-1"
              :to="{ name: 'apps-invoice-preview-id', params: { id: route.params.id } }"
            >
              Preview
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Drawers -->
    <InvoiceAddPaymentDrawer v-model:is-drawer-open="isAddPaymentSidebarActive" />
  </VRow>
</template>
