<script setup>
import { ref, onMounted, watch } from 'vue'
import { useProductStore } from "@/plugins/store/product"
import { useRoute, useRouter } from 'vue-router'

const useProduct = useProductStore()
const route = useRoute()
const baseUrl = import.meta.env.VITE_BASE_IMG_URL

const productId = ref(route.params.id || null)
const uploadedFiles = ref([])  // For new image uploads
const existingImages = ref([])  // For images already associated with the product
const relatedProducts = ref([])
const productCategory = ref([])
const productPrice = ref()
const productSKU = ref()
const productStock = ref()
const variantsProduct = ref([])
const productDescription = ref('')
const productName = ref('')
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
    variantsProduct.value = product.Variants || []
    variantAttributes.value = product.Variants?.[0]?.VariantAttributes || []
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

const removeVariant = index => {
  variantsProduct.value.splice(index, 1)
}

const removeAttribute = (variantIndex, attributeIndex) => {
  variantsProduct.value[variantIndex].VariantAttributes.splice(attributeIndex, 1)
}

// Generate SKU based on product name
const generateSKU = (variantName = 'SKU', prefix = 'SKU') => {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase()
  const timestampPart = Date.now().toString().slice(-4)

  return `${prefix}-${variantName.slice(0, 3).toUpperCase()}-${randomPart}-${timestampPart}`
}

// Watch product name and update SKUs for all variants
watch(productName, newVal => {
  if (newVal && newVal.length > 3) {
    variantsProduct.value.forEach((variant, index) => {
      // ✅ Only generate SKU if it's missing or empty
      if (!variant.sku) {
        variant.sku = generateSKU(newVal)
      }
    })
  }
})

const addVariant = () => {
  // Add a new variant with default values
  const newVariant = {
    sku: generateSKU(productName.value),
    title: '',
    price: '',
    stock: '',
    imageUrl: '',
    VariantAttributes: [{ name: '', value: '' }],  // Start with one empty attribute
  }

  variantsProduct.value.push(newVariant)
}

const handleVariantDrop = (event, index) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    variantsProduct.value[index].imageUrl = file
    variantsProduct.value[index].previewUrl = URL.createObjectURL(file)
  }
}

const handleImageUpload = (event, index) => {
  const file = event.target.files[0]
  if (file) {
    variantsProduct.value[index].imageUrl = file
    variantsProduct.value[index].previewUrl = URL.createObjectURL(file)
  }
}


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

  for (let i = 0; i < variantsProduct.value.length; i++) {
    const variant = variantsProduct.value[i]

    const variantFormData = new FormData()

    const plainAttrs = variant.VariantAttributes?.map(attr => ({
      name: attr.name,
      value: attr.value,
    })) || []

    variantFormData.append('sku', variant.sku)
    variantFormData.append('title', variant.title)
    variantFormData.append('price', variant.price)
    variantFormData.append('stock', variant.stock)
    variantFormData.append('attributes', JSON.stringify(plainAttrs))

    if (variant.imageUrl instanceof File) {
      variantFormData.append('image', variant.imageUrl)
    }

    try {
      if (variant.id) {
        await useProduct.updateVariant(variant.id, variantFormData)
      } else {
        await useProduct.createVariant(productId.value, variantFormData)
      }
    } catch (error) {
      console.error('Error handling variant:', error)
      isLoading.value = false
      
      return
    }

  }

  formData.append('relatedProductIds', JSON.stringify(relatedProducts.value))

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
                      class="mt-2"
                      small
                      @click="removeImage(index)"
                    >
                      Remove
                    </VBtn>
                  </div>
                </VCol>
              </VRow>
            </div>
            <br>

            <!-- DropZone for new image uploads -->
            <DropZone @update:files="val => uploadedFiles.value = val" />
          </VCardText>
        </VCard>

        <!-- ✅ Variant Attributes as Cards -->
        <VCard
          class="mb-6"
          title="Variants"
        >
          <VCardText>
            <VRow>
              <VCol
                v-for="(variant, index) in variantsProduct"
                :key="index"
                cols="12"
                sm="6"
              >
                <VCard class="mb-4">
                  <VCardTitle class="text-h6">
                    Variant {{ index + 1 }}
                  </VCardTitle>
                  <VCardText>
                    <div class="d-flex flex-column gap-2">
                      <AppTextField
                        v-model="variant.sku"
                        label="SKU"
                        readonly="true"
                        placeholder="SKU"
                        style="width: 100%"
                      />
                      <AppTextField
                        v-model="variant.title"
                        label="Title"
                        placeholder="Variant Title (e.g. Black 128GB)"
                        style="width: 100%"
                      />
                      <AppTextField
                        v-model="variant.price"
                        label="Price"
                        placeholder="Price"
                        style="width: 100%"
                      />
                      <AppTextField
                        v-model="variant.stock"
                        label="Stock"
                        placeholder="Stock"
                        style="width: 100%"
                      />
                      <div
                        class="drop-zone mt-4"
                        @dragover.prevent
                        @drop.prevent="e => handleVariantDrop(e, index)"
                      >
                        <p class="text-center text-caption">Drag & drop or click to upload</p>
                        <input
                          type="file"
                          class="hidden-input"
                          accept="image/*"
                          @change="e => handleImageUpload(e, index)"
                        />
                      </div>

                      <!-- ✅ Preview -->
                      <div v-if="variant.previewUrl || (typeof variant.imageUrl === 'string')">
                        <VImg
                          :src="variant.previewUrl || `${baseUrl}${variant.imageUrl}`"
                          alt="Variant Image"
                          class="my-4"
                          max-width="120"
                          max-height="120"
                        />
                      </div>
                      <!-- Display the uploaded image preview -->
                    </div>
                    <!-- Variant Attributes -->
                    <div
                      v-for="(attr, i) in variant.VariantAttributes"
                      :key="i"
                      class="d-flex gap-4 align-center justify-center mt-4"
                    >
                      <AppTextField
                        v-model="attr.name"
                        label="Attribute Name"
                        placeholder="e.g. Color"
                        style="width: 100%"
                      />
                      <AppTextField
                        v-model="attr.value"
                        label="Attribute Value"
                        placeholder="e.g. Red"
                        style="width: 100%"
                      />
                      <VBtn
                        icon
                        size="small"
                        color="error"
                        class="mt-4"
                        @click="removeAttribute(index, i)"
                      >
                        <VIcon icon="tabler-x" />
                      </VBtn>
                    </div>
                    <br>
                    <VBtn
                      color="primary"
                      size="small"
                      @click="variant.VariantAttributes.push({ name: '', value: '' })"
                    >
                      Add Attribute
                    </VBtn>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
            <div class="d-flex">
              <VBtn
                variant="tonal"
                color="primary"
                class="me-2"
                size="small"
                @click="addVariant"
              >
                + Add Variant
              </VBtn>
              <div v-if="variantsProduct.length > 0">
                <VBtn
                  color="error"
                  size="small"
                  @click="removeVariant(index)"
                >
                  Remove Variant
                </VBtn>
              </div>
            </div>
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
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed #ccc;
  padding: 16px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  background-color: #f9f9f9;
}

.drop-zone:hover {
  background-color: #f0f0f0;
}

.hidden-input {
  display: block;
  margin: 10px auto;
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
