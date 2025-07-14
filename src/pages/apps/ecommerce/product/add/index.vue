<script setup>
import { ref, onMounted, watch } from 'vue'
import { useProductStore } from "@/plugins/store/product"
import AppSelect from "@core/components/app-form-elements/AppSelect.vue"

const useProduct = useProductStore()

onMounted(async () => {
  await useProduct.fetchProduct()
  await useProduct.fetchCategory()
})

const uploadedFiles = ref([])
const relatedProducts = ref([])
const productCategory = ref()
const productDescription = ref('')
const productName = ref('')
const isLoading = ref(false)

const addProduct = async () => {
  isLoading.value = true

  const formData = new FormData()

  if (uploadedFiles.value.value) {
    for (const item of uploadedFiles.value.value) {
      formData.append('images', item.file)
    }
  }

  formData.append('categoryId', productCategory.value ?? '1')
  formData.append('name', productName.value)
  formData.append('description', productDescription.value)

  formData.append('relatedProductIds', JSON.stringify(relatedProducts.value))

  await useProduct.addProduct(formData)
  window.location.reload()
  isLoading.value = false
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 font-weight-medium">
          Add a new product
        </h4>
        <div class="text-body-1">
          Orders placed across your store
        </div>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">
        <VBtn @click="addProduct">
          Publish Product
        </VBtn>
      </div>
    </div>

    <VRow>
      <VCol md="8">
        <!-- 👉 Product Information -->
        <VCard
          class="mb-6"
          title="Product Information"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="productName"
                  label="Name"
                  placeholder="iPhone 14"
                />
              </VCol>
              <VCol>
                <span class="mb-1">Description (optional)</span>
                <ProductDescriptionEditor
                  v-model="productDescription"
                  placeholder="Product Description"
                  class="border rounded"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <!-- 👉 Media -->
        <VCard class="mb-6">
          <VCardItem>
            <template #title>
              Product Image
            </template>
          </VCardItem>
          <VCardText>
            <DropZone @update:files="val => uploadedFiles.value = val" />
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        md="4"
        cols="12"
      >
        <!-- 👉 Organize -->
        <VCard title="Organize">
          <VCardText>
            <div class="d-flex flex-column gap-y-4">
              <div>
                <VLabel class="d-flex">
                  <div class="d-flex text-sm justify-space-between w-100">
                    <div class="text-high-emphasis">
                      Category
                    </div>
                  </div>
                </VLabel>
                <div class="d-flex gap-x-4">
                  <AppSelect
                    v-model="productCategory"
                    item-title="title"
                    item-value="value"
                    chips
                    placeholder="Select Category"
                    :items="useProduct.category.map(p => ({ title: p.name, value: p.id }))"
                  />
                </div>
              </div>

              <!-- ✅ Related Products -->
              <AppSelect
                v-model="relatedProducts"
                label="Related Products"
                item-title="title"
                item-value="value"
                placeholder="Select Related Products"
                :items="useProduct.product.map(p => ({ title: p.name, value: p.id }))"
                multiple
                chips
              />
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
  .drop-zone {
    border: 2px dashed rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 6px;
  }
</style>

<style lang="scss">
.inventory-card {
  .v-tabs.v-tabs-pill {
    .v-slide-group-item--active.v-tab--selected.text-primary {
      h6 {
        color: #fff !important;
      }
    }
  }

  .v-radio-group,
  .v-checkbox {
    .v-selection-control {
      align-items: start !important;
    }

    .v-label.custom-input {
      border: none !important;
    }
  }
}

.ProseMirror {
  p {
    margin-block-end: 0;
  }

  padding: 0.5rem;
  outline: none;

  p.is-editor-empty:first-child::before {
    block-size: 0;
    color: #adb5bd;
    content: attr(data-placeholder);
    float: inline-start;
    pointer-events: none;
  }
}
</style>
