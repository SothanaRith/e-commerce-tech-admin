<script setup>
import { ref, computed } from 'vue'
import { useProductStore } from "@/plugins/store/product"
import AppSelect from "@core/components/app-form-elements/AppSelect.vue";

const headers = [
  { title: 'Product', key: 'product' },
  { title: 'Category', key: 'category' },
  { title: 'Price', key: 'price' },
  { title: 'QTY', key: 'qty' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const baseUrl = import.meta.env.VITE_BASE_IMG_URL
const selectedStatus = ref()
const selectedStock = ref()
const selectedRows = ref([])

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
await useProduct.fetchCategory()

const { itemsPerPage, searchQuery, page, sortBy, orderBy } = storeToRefs(useProduct)

const products = computed(() =>
  useProduct.product.map(product => ({
    id: product.id,
    productName: product.name,
    productBrand: '--', // static or dynamic if available
    category: useProduct.category[product.categoryId - 1],
    price: `$${parseFloat(product.price).toFixed(2)}`,
    qty: product.totalStock,
    status: product.totalStock > 0 ? 'Published' : 'Inactive',
    image: `${baseUrl}${product.imageUrl[0]}`,
  })),
)

const { selectedCategory } = storeToRefs(useProduct)

watch(
  [selectedStatus, selectedCategory, selectedStock, searchQuery, itemsPerPage, page],
  async () => {
    await useProduct.fetchProduct()

  }, { immediate: true },
)

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
          <AppSelect
            v-model="selectedCategory"
            item-title="title"
            style="inline-size: 200px;"
            item-value="value"
            placeholder="Select Category"
            :items="useProduct.category.map(c => ({ title: c.name, value: c.id }))"
          />
        </div>

        <VSpacer />

        <div class="d-flex gap-4 flex-wrap align-center">
          <AppSelect
            v-model="itemsPerPage"
            :items="[5, 10, 20, 25, 50]"
          />
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
        :items="products"
        :items-length="totalProduct"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- product -->
        <template #item.product="{ item }">
          <div class="d-flex align-center gap-x-4">
            <VAvatar
              size="34"
              :color="!item.image ? 'primary' : ''"
              :variant="!item.image ? 'tonal' : undefined"
            >
              <VImg
                v-if="item.image"
                :src="`${item.image}`"
              />

              <span
                v-else
                class="font-weight-medium"
              >{{ avatarText(item.image) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-body-1 font-weight-medium text-high-emphasis">{{ item.productName }}</span>
              <span class="text-body-2">{{ item.productBrand }}</span>
            </div>
          </div>
        </template>

        <!-- category -->
        <template #item.category="{ item }">
          <VAvatar
            size="24"
            variant="tonal"
            :color="resolveCategory(item.category)?.color"
            class="me-2"
          >
            <VImg
              v-if="item.category?.imageUrl ?? ''"
              :src="`${baseUrl}${item.category.imageUrl ?? ''}`"
            />
          </VAvatar>
          <span class="text-body-1 text-high-emphasis">{{ item.category?.name ?? "" }}</span>
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
          <IconBtn @click="$router.push(`/apps/ecommerce/product/edit/${item.id}`)">
            <VIcon icon="tabler-edit" />
          </IconBtn>

          <IconBtn>
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem
                  value="delete"
                  prepend-icon="tabler-trash"
                  @click="deleteProduct(item.id)"
                >
                  Delete
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
