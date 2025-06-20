<script setup>
import { ref, computed } from 'vue'
import { useProductStore } from "@/plugins/store/product"

const headers = [
  { title: 'Product', key: 'product' },
  { title: 'Category', key: 'category' },
  { title: 'Stock', key: 'stock', sortable: false },
  { title: 'SKU', key: 'sku' },
  { title: 'Price', key: 'price' },
  { title: 'QTY', key: 'qty' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const selectedStatus = ref()
const selectedCategory = ref()
const selectedStock = ref()
const selectedRows = ref([])

const status = ref([
  { title: 'Scheduled', value: 'Scheduled' },
  { title: 'Publish', value: 'Published' },
  { title: 'Inactive', value: 'Inactive' },
])

const categories = ref([
  { title: 'Accessories', value: 'Accessories' },
  { title: 'Home Decor', value: 'Home Decor' },
  { title: 'Electronics', value: 'Electronics' },
  { title: 'Shoes', value: 'Shoes' },
  { title: 'Office', value: 'Office' },
  { title: 'Games', value: 'Games' },
])

const stockStatus = ref([
  { title: 'In Stock', value: true },
  { title: 'Out of Stock', value: false },
])

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const resolveCategory = category => {
  if (category === 'Accessories') return { color: 'error', icon: 'tabler-device-watch' }
  if (category === 'Home Decor') return { color: 'info', icon: 'tabler-home' }
  if (category === 'Electronics') return { color: 'primary', icon: 'tabler-device-imac' }
  if (category === 'Shoes') return { color: 'success', icon: 'tabler-shoe' }
  if (category === 'Office') return { color: 'warning', icon: 'tabler-briefcase' }
  if (category === 'Games') return { color: 'primary', icon: 'tabler-device-gamepad-2' }
}

const resolveStatus = statusMsg => {
  if (statusMsg === 'Scheduled') return { text: 'Scheduled', color: 'warning' }
  if (statusMsg === 'Published') return { text: 'Publish', color: 'success' }
  if (statusMsg === 'Inactive') return { text: 'Inactive', color: 'error' }
}

const useProduct = useProductStore()

await useProduct.fetchProduct()

// optional map of categoryId to label
const categoryMap = {
  1: 'Electronics',
  2: 'Shoes',
  3: 'Accessories',

  // extend as needed
}

const { itemsPerPage, searchQuery, page, sortBy, orderBy } = storeToRefs(useProduct)

const products = computed(() =>
  useProduct.product.map(product => ({
    id: product.id,
    productName: product.name,
    productBrand: 'Smartwatch', // static or dynamic if available
    category: categoryMap[product.categoryId] || 'Uncategorized',
    stock: product.totalStock > 0,
    sku: `SKU-${product.id}`, // example SKU
    price: `$${parseFloat(product.price).toFixed(2)}`,
    qty: product.totalStock,
    status: product.totalStock > 0 ? 'Published' : 'Inactive',
    images: product.imageUrl,
  })),
)

watch(
  [selectedStatus, selectedCategory, selectedStock, searchQuery, itemsPerPage, page],
  async () => {

    await useProduct.fetchProduct()

    console.log(useProduct.product)

  }, { immediate: true },
)

// Transform product data to match table structure


const totalProduct = computed(() => useProduct.totalProduct)

const deleteProduct = async id => {
  await useProduct.deleteProduct(id)
}
</script>

<template>
  <div>

    <!-- 👉 products -->
    <VCard class="mb-6">
      <VDivider />
      <div class="d-flex flex-wrap gap-4 ma-6">
        <div class="d-flex align-center">
          <AppTextField
            v-model="searchQuery"
            placeholder="Search Product"
            style="inline-size: 200px;"
            class="me-3"
          />
        </div>

        <VSpacer />

        <div class="d-flex gap-4 flex-wrap align-center">
          <AppSelect
            v-model="itemsPerPage"
            :items="[5, 10, 20, 25, 50]"
          />
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
          >
            Export
          </VBtn>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="$router.push('/apps/ecommerce/product/add')"
          >
            Add Product
          </VBtn>
        </div>
      </div>

      <VDivider class="mt-4" />

      <!-- 👉 Datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        show-select
        :items="products"
        :items-length="totalProduct"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- product -->
        <template #item.product="{ item }">
          <div class="d-flex align-center gap-x-4">
            <VAvatar
              v-if="item.image"
              size="38"
              variant="tonal"
              rounded
              :image="item.image"
            />
            <div class="d-flex flex-column">
              <span class="text-body-1 font-weight-medium text-high-emphasis">{{ item.productName }}</span>
              <span class="text-body-2">{{ item.productBrand }}</span>
            </div>
          </div>
        </template>

        <!-- category -->
        <template #item.category="{ item }">
          <VAvatar
            size="30"
            variant="tonal"
            :color="resolveCategory(item.category)?.color"
            class="me-4"
          >
            <VIcon
              :icon="resolveCategory(item.category)?.icon"
              size="18"
            />
          </VAvatar>
          <span class="text-body-1 text-high-emphasis">{{ item.category }}</span>
        </template>

        <!-- stock -->
        <template #item.stock="{ item }">
          <VSwitch
            :model-value="item.stock"
            disabled
          />
        </template>

        <!-- status -->
        <template #item.status="{ item }">
          <VChip
            v-bind="resolveStatus(item.status)"
            density="default"
            label
            size="small"
          />
        </template>

        <!-- actions -->
        <template #item.actions="{ item }">
          <IconBtn>
            <VIcon icon="tabler-edit" />
          </IconBtn>

          <IconBtn>
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem
                  value="download"
                  prepend-icon="tabler-download"
                >
                  Download
                </VListItem>
                <VListItem
                  value="delete"
                  prepend-icon="tabler-trash"
                  @click="deleteProduct(item.id)"
                >
                  Delete
                </VListItem>
                <VListItem
                  value="duplicate"
                  prepend-icon="tabler-copy"
                >
                  Duplicate
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
            :total-items="totalProduct"
          />
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
