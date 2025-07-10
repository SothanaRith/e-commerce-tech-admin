
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '@/plugins/store/order.js'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import InvoiceAddPaymentDrawer from '@/views/apps/invoice/InvoiceAddPaymentDrawer.vue'

const route = useRoute()
const useOrder = useOrderStore()

const orderData = ref(null)
const orderItems = ref([])
const isAddPaymentSidebarVisible = ref(false)
const today = new Date().toLocaleDateString('en-GB')

const fetchOrder = async () => {
  await useOrder.fetchOrderById(route.params.id)
  orderData.value = useOrder.orderSingleData

  if (!orderData.value) return

  orderItems.value = orderData.value.orderItems?.map(item => ({
    name: item.Product?.name || 'N/A',
    description: item.Product?.description || '',
    qty: item.quantity,
    hours: item.hours || 1,
    price: parseFloat(item.price || 0),
  })) || []
}

onMounted(fetchOrder)

const printInvoice = () => {
  window.print()
}
</script>

<template>
  <section v-if="orderData && orderItems.length">
    <VRow>
      <VCol
        cols="12"
        md="9"
      >
        <VCard class="invoice-preview-wrapper pa-6 pa-sm-12">
          <div class="invoice-header-preview d-flex flex-wrap justify-space-between flex-column flex-sm-row print-row bg-var-theme-background gap-6 rounded pa-6 mb-6">
            <div>
              <div class="d-flex align-center app-logo mb-6">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h6 class="app-logo-title">
                  {{ themeConfig.app.title }}
                </h6>
              </div>
              <h6 class="text-h6 font-weight-regular">
                Office 149, 450 South Borey New World Chhouk Va II
              </h6>
              <h6 class="text-h6 font-weight-regular">
                Phnom Penh, Cambodia
              </h6>
              <h6 class="text-h6 font-weight-regular">
                +855 123 651 87, +855 971 2929 192
              </h6>
            </div>

            <div>
              <h6 class="font-weight-medium text-lg mb-6">
                Invoice #{{ orderData.id }}
              </h6>
              <h6 class="text-h6 font-weight-regular">
                <span>Date Issued: </span>
                <span>{{ new Date(orderData.createdAt).toLocaleDateString('en-GB') }}</span>
              </h6>
              <h6 class="text-h6 font-weight-regular">
                <span>Due Date: </span>
                <span>{{ new Date(orderData.updatedAt).toLocaleDateString('en-GB') }}</span>
              </h6>
            </div>
          </div>

          <VRow class="print-row mb-6">
            <VCol class="text-no-wrap">
              <h6 class="text-h6 mb-4">
                Invoice To: {{ orderData.User?.name }}
              </h6>
              <p>{{ orderData.User?.email }}</p>
              <p>{{ orderData.address?.street }}, {{ orderData.address?.country }}</p>
              <p>{{ orderData.address?.phoneNumber }}</p>
            </VCol>

            <VCol class="text-no-wrap">
              <h6 class="text-h6 mb-4">
                Bill To:
              </h6>
              <table>
                <tbody>
                  <tr>
                    <td class="pe-4">
                      Total Due:
                    </td><td>{{ orderData.totalAmount }}</td>
                  </tr>
                  <tr>
                    <td class="pe-4">
                      Bank Name:
                    </td><td>{{ orderData.paymentMethod || 'ABA Bank' }}</td>
                  </tr>
                </tbody>
              </table>
            </VCol>
          </VRow>

          <VTable class="invoice-preview-table border text-high-emphasis overflow-hidden mb-6">
            <thead>
              <tr>
                <th>ITEM</th><th class="text-center">
                  HOURS
                </th><th class="text-center">
                  QTY
                </th><th class="text-center">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody class="text-base">
              <tr
                v-for="item in orderItems"
                :key="item.name"
              >
                <td>{{ item.name }}</td>
                <td class="text-center">
                  {{ item.hours }}
                </td>
                <td class="text-center">
                  {{ item.qty }}
                </td>
                <td class="text-center">
                  ${{ (item.price * item.qty).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </VTable>

          <div class="d-flex justify-space-between flex-column flex-sm-row print-row">
            <div class="mb-2">
              <div class="d-flex align-center mb-1">
                <h6 class="text-h6 me-2">
                  Salesperson:
                </h6>
                <span>Snap Buy</span>
              </div>
              <p>Thanks for your business</p>
            </div>
            <div>
              <VDivider class="my-2" />
              <table class="w-100">
                <tbody>
                  <tr>
                    <td class="pe-16">
                      Total:
                    </td>
                    <td class="text-end">
                      <h6 class="text-base font-weight-medium">
                        ${{ orderData.totalAmount }}
                      </h6>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <VDivider class="my-6 border-dashed" />
          <p class="mb-0">
            <span class="text-high-emphasis font-weight-medium me-1">Note:</span>
            <span>{{ orderData.note || 'It was a pleasure working with you.' }}</span>
          </p>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="3"
        class="d-print-none"
      >
        <VCard>
          <VCardText>
            <div class="d-flex flex-wrap gap-4">
              <VBtn
                variant="tonal"
                color="secondary"
                class="flex-grow-1"
                @click="printInvoice"
              >
                Print
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <InvoiceAddPaymentDrawer v-model:is-drawer-open="isAddPaymentSidebarVisible" />
  </section>
</template>

<style lang="scss">
.invoice-preview-table {
  --v-table-header-color: var(--v-theme-surface);

  &.v-table .v-table__wrapper table thead tr th {
    border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  }
}

@media print {
  .v-theme--dark {
    --v-theme-surface: 255, 255, 255;
    --v-theme-on-surface: 47, 43, 61;
    --v-theme-on-background: 47, 43, 61;
  }

  body {
    background: none !important;
  }

  .invoice-header-preview,
  .invoice-preview-wrapper {
    padding: 0 !important;
  }

  .product-buy-now {
    display: none;
  }

  .v-navigation-drawer,
  .layout-vertical-nav,
  .app-customizer-toggler,
  .layout-footer,
  .layout-navbar,
  .layout-navbar-and-nav-container {
    display: none;
  }

  .v-card {
    box-shadow: none !important;

    .print-row {
      flex-direction: row !important;
    }
  }

  .layout-content-wrapper {
    padding-inline-start: 0 !important;
  }

  .v-table__wrapper {
    overflow: hidden !important;
  }

  .vue-devtools__anchor {
    display: none;
  }
}
</style>
