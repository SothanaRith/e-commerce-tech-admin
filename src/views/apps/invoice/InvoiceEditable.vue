<script setup>
import { ref, toRef } from 'vue'
import InvoiceProductEdit from './InvoiceProductEdit.vue'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

// Props & emits
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['push', 'remove'])

// Invoice values from props
const invoice = toRef(props.data, 'invoice')
const salesperson = toRef(props.data, 'salesperson')
const thanksNote = toRef(props.data, 'thanksNote')
const note = toRef(props.data, 'note')

// Dummy clients list (you can replace with real API if needed)
const clients = ref([
  { name: props.data?.userData?.fullName || 'Client' },
])
</script>


<template>
  <VCard class="pa-6 pa-sm-12">
    <!-- SECTION Header -->
    <div class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
      <!-- 👉 Left -->
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

      <!-- 👉 Right -->
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-start align-sm-center gap-x-4 font-weight-medium text-lg flex-column flex-sm-row">
          <span
            class="text-high-emphasis text-sm-end"
            style="inline-size: 5.625rem;"
          >Invoice:</span>
          <span>
            <AppTextField
              id="invoice-id"
              v-model="invoice.id"
              disabled
              prefix="#"
              style="inline-size: 9.5rem;"
            />
          </span>
        </div>

        <div class="d-flex gap-x-4 align-start align-sm-center flex-column flex-sm-row">
          <span
            class="text-high-emphasis text-sm-end"
            style="inline-size: 5.625rem;"
          >Date Issued:</span>
          <span style="inline-size: 9.5rem;">
            <AppDateTimePicker
              id="issued-date"
              v-model="invoice.issuedDate"
              placeholder="YYYY-MM-DD"
              :config="{ position: 'auto right' }"
            />
          </span>
        </div>

        <div class="d-flex gap-x-4 align-start align-sm-center flex-column flex-sm-row">
          <span
            class="text-high-emphasis text-sm-end"
            style="inline-size: 5.625rem;"
          >Due Date:</span>
          <span style="min-inline-size: 9.5rem;">
            <AppDateTimePicker
              id="due-date"
              v-model="invoice.dueDate"
              placeholder="YYYY-MM-DD"
              :config="{ position: 'auto right' }"
            />
          </span>
        </div>
      </div>
    </div>

    <!-- Invoice To + Bill To -->
    <VRow>
      <VCol class="text-no-wrap">
        <h6 class="text-h6 mb-4">
          Invoice To:
        </h6>
        <VSelect
          id="client-name"
          v-model="invoice.client"
          :items="clients"
          item-title="name"
          item-value="name"
          placeholder="Select Client"
          return-object
          class="mb-4"
          style="inline-size: 11.875rem;"
        />
        <p class="mb-0">
          {{ props.data.userData?.fullName }}
        </p>
        <p class="mb-0">
          {{ props.data.userData?.email }}
        </p>
        <p class="mb-0">
          {{ props.data.currentBillingAddress?.addressLine1 }}
        </p>
        <p class="mb-0">
          {{ props.data.currentBillingAddress?.selectedCountry }}
        </p>
        <p class="mb-0">
          {{ props.data.currentBillingAddress?.contact }}
        </p>
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
              </td>
              <td>${{ props.data.invoice?.totalAmount }}</td>
            </tr>
            <tr>
              <td class="pe-4">
                Bank Name:
              </td>
              <td>ABA Bank</td>
            </tr>
            <tr>
              <td class="pe-4">
                Country:
              </td>
              <td>{{ props.data.currentBillingAddress?.selectedCountry }}</td>
            </tr>
          </tbody>
        </table>
      </VCol>
    </VRow>

    <VDivider class="my-6 border-dashed" />

    <!-- Products -->
    <div class="add-products-form">
      <div
        v-for="(product, index) in props.data.purchasedProducts"
        :key="product.title"
        class="mb-4"
      >
        <InvoiceProductEdit
          :id="index"
          :data="product"
          @remove-product="$emit('remove', index)"
        />
      </div>
    </div>

    <VDivider class="my-6 border-dashed" />

    <!-- Total & Notes -->
    <div class="d-flex justify-space-between flex-wrap flex-column flex-sm-row">
      <div class="mb-6 mb-sm-0">
        <div class="d-flex align-center mb-4">
          <h6 class="text-h6 me-2">
            Salesperson:
          </h6>
          <AppTextField
            id="salesperson"
            v-model="salesperson"
            style="inline-size: 8rem;"
            placeholder="John Doe"
          />
        </div>
        <AppTextField
          id="thanks-note"
          v-model="thanksNote"
          placeholder="Thanks for your business"
        />
      </div>

      <div>
        <table class="w-100">
          <tbody>
            <tr>
              <td class="pe-16">
                Total:
              </td>
              <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                <h6 class="text-h6">
                  ${{ props.data.invoice?.totalAmount }}
                </h6>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <VDivider class="my-6 border-dashed" />

    <div>
      <h6 class="text-h6 mb-2">
        Note:
      </h6>
      <VTextarea
        id="note"
        v-model="note"
        placeholder="Write note here..."
        :rows="2"
      />
    </div>
  </VCard>
</template>

