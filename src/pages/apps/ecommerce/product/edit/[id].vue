<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from "@/plugins/store/product"
import { useRoute, useRouter } from 'vue-router'

const useProduct = useProductStore()
const route = useRoute()
const router = useRouter()
const baseUrl = import.meta.env.VITE_BASE_IMG_URL

const productId = ref(route.params.id || null)
const uploadedFiles = ref([])  // For new image uploads
const existingImages = ref([])  // For images already associated with the product
const relatedProducts = ref([])
const productCategory = ref([])
const productPrice = ref()
const productSKU = ref()
const productStock = ref()
const variantsProduct = ref()
const productDescription = ref()
const productName = ref()
const isLoading = ref(false)
const variantAttributes = ref([
  { name: 'Color', value: 'Black' },
  { name: 'Size', value: 'M' },
])

onMounted(async () => {
  await useProduct.fetchProduct()
  await useProduct.fetchCategory()

  if (productId.value) {
    const product = await useProduct.fetchProductById(productId.value)

    productName.value = product.name
    productDescription.value = product.description
    productPrice.value = product.price
    productStock.value = product.Variants?.[0]?.stock || 0
    productSKU.value = product.Variants?.[0]?.sku || ''
    variantsProduct.value = product.Variants?.[0]?.id || ''
    productCategory.value = product.categoryId
    for (const item of product.RelatedProducts) {
      relatedProducts.value.push(item.id)
    }

    // Populate existing images
    existingImages.value = product.imageUrl || []
  }
})

// Method to remove image
const removeImage = index => {
  existingImages.value.splice(index, 1)  // Removes the image from the array at the specified index
}

const generateSKU = (prefix = 'SKU') => {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase()
  const timestampPart = Date.now().toString().slice(-4)

  productSKU.value = `${prefix}-${randomPart}-${timestampPart}`
}

watch(productName, newVal => {
  if (newVal && newVal.length > 3 && !productId.value) {
    generateSKU(newVal.slice(0, 5).toUpperCase())
  }
})

const submitProduct = async () => {
  isLoading.value = true

  const formData = new FormData()

  // Add newly uploaded images
  if (uploadedFiles.value?.value) {
    for (const item of uploadedFiles.value.value) {
      formData.append('images', item.file)
    }
  }
  formData.append('categoryId', productCategory.value ?? '1')
  formData.append('imageUrl', existingImages.value)
  formData.append('name', productName.value)
  formData.append('description', productDescription.value)
  formData.append('price', productPrice.value)
  formData.append('variants[0][id]', variantsProduct.value)
  formData.append('variants[0][stock]', productStock.value)
  formData.append('stock', productStock.value)
  formData.append('variants[0][sku]', productSKU.value)
  formData.append('variants[0][price]', productPrice.value)
  formData.append('relatedProductIds', JSON.stringify(relatedProducts.value))

  // 🔁 Dynamically append variant attributes
  variantAttributes.value.forEach((attr, index) => {
    formData.append(`variants[0][attributes][${index}][name]`, attr.name)
    formData.append(`variants[0][attributes][${index}][value]`, attr.value)
  })

  if (productId.value) {
    // Update product if productId exists
    await useProduct.updateProduct(productId.value, formData)
  }

  isLoading.value = false
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 font-weight-medium">
          {{ productId ? 'Update' : 'Add' }} Product
        </h4>
        <div class="text-body-1">
          Orders placed across your store
        </div>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">
        <VBtn @click="submitProduct">
          {{ productId ? 'Update Product' : 'Publish Product' }}
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
              <VCol cols="12">
                <AppTextField
                  v-model="productSKU"
                  label="Product SKU"
                  readonly="true"
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
            <template #append>
              <span class="text-primary font-weight-medium text-sm cursor-pointer">Add Media from URL</span>
            </template>
          </VCardItem>
          <VCardText>
            <!-- Display existing images -->
            <div v-if="existingImages.length > 0">
              <VRow>
                <VCol
                  v-for="(image, index) in existingImages"
                  :key="index"
                  cols="6"
                >
                  <div class="d-flex flex-column align-center">
                    <!-- Image display -->
                    <VImg
                      :src="`${baseUrl}${image}`"
                      alt="Existing product image"
                      class="product-image"
                      style="width: 100%; height: auto; max-width: 150px;"
                    />

                    <!-- Remove button -->
                    <VBtn
                      variant="outlined"
                      color="error"
                      small
                      @click="removeImage(index)"
                    >
                      Remove
                    </VBtn>
                  </div>
                </VCol>
              </VRow>
            </div>

            <!-- DropZone for new image uploads -->
            <DropZone @update:files="val => uploadedFiles.value = val" />
          </VCardText>
        </VCard>

        <VCard
          title="Variant Attributes"
          class="mb-6"
        >
          <VCardText>
            <VRow
              v-for="(attr, index) in variantAttributes"
              :key="index"
              class="mb-2"
            >
              <VCol cols="6">
                <AppTextField
                  v-model="attr.name"
                  label="Attribute Name"
                  placeholder="e.g. Color"
                />
              </VCol>
              <VCol cols="6">
                <AppTextField
                  v-model="attr.value"
                  label="Attribute Value"
                  placeholder="e.g. Red"
                />
              </VCol>
            </VRow>

            <VBtn
              color="primary"
              size="small"
              @click="variantAttributes.push({ name: '', value: '' })"
            >
              Add Attribute
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        md="4"
        cols="12"
      >
        <!-- 👉 Pricing -->
        <VCard
          title="Pricing"
          class="mb-6"
        >
          <VCardText>
            <AppTextField
              v-model="productPrice"
              label="Best Price"
              placeholder="Price"
              class="mb-6"
            />
          </VCardText>
        </VCard>

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
                    multiple
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
              <AppTextField
                v-model="productStock"
                label="Add to Stock"
                placeholder="Quantity"
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
