<script setup>
import { ref, watch, onMounted } from 'vue'
import { useProductStore } from '@/plugins/store/product'
import ECommerceAddCategoryDrawer from '@/views/apps/ecommerce/ECommerceAddCategoryDrawer.vue'
import ECommerceEditCategoryDrawer from '@/views/apps/ecommerce/ECommerceEditCategoryDrawer.vue'

const categoryData = ref([])
const baseUrl = import.meta.env.VITE_BASE_IMG_URL

const headers = [
  {
    title: 'id',
    key: 'id',
  },
  {
    title: 'Categories',
    key: 'name',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
  },
]

const itemsPerPage = ref(10)
const page = ref(1)
const searchQuery = ref('')
const isAddProductDrawerOpen = ref(false)
const isEditProductDrawerOpen = ref(false)
const selectedCategory = ref(null) // For storing selected category data
const useProduct = useProductStore()

// Fetch categories on mount
onMounted(async () => {
  await useProduct.fetchCategory()
  categoryData.value = useProduct.category
})

// Open the edit drawer and set selected category data
const openEditCategoryDrawer = category => {
  selectedCategory.value = category
  isEditProductDrawerOpen.value = true
}

await useProduct.fetchCategory()
categoryData.value = useProduct.category
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-sm-space-between flex-wrap gap-y-4 gap-x-6 justify-start">
          <AppTextField
            v-model="searchQuery"
            placeholder="Search Category"
            style="max-inline-size: 280px; min-inline-size: 280px;"
          />

          <div class="d-flex align-center flex-wrap gap-4">
            <AppSelect
              v-model="itemsPerPage"
              :items="[5, 10, 15]"
              style="max-inline-size: 100px; min-inline-size: 100px;"
            />
            <VBtn
              prepend-icon="tabler-plus"
              @click="isAddProductDrawerOpen = !isAddProductDrawerOpen"
            >
              Add Category
            </VBtn>
          </div>
        </div>
      </VCardText>
      <VDivider />
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="categoryData"
        :items-length="categoryData.length"
        class="text-no-wrap"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-x-3">
            <VAvatar
              size="34"
              :color="!item.imageUrl ? 'primary' : ''"
              :variant="!item.imageUrl ? 'tonal' : undefined"
            >
              <VImg
                v-if="item.imageUrl"
                :src="`${baseUrl}${item.imageUrl}`"
              />
              <span
                v-else
                class="font-weight-medium"
              >{{ avatarText(item.name) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <div class="text-body-1 font-weight-medium">
                {{ item.name }}
              </div>
            </div>
          </div>
        </template>
        <template #item.actions="{ item }">
          <!-- Open the edit drawer with the selected category -->
          <IconBtn @click="openEditCategoryDrawer(item.id)">
            <VIcon
              icon="tabler-pencil"
              size="22"
            />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="0"
            :total-items="0"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <!-- Pass the selected category data to the edit drawer -->
    <ECommerceAddCategoryDrawer v-model:is-drawer-open="isAddProductDrawerOpen" />
    <ECommerceEditCategoryDrawer
      v-model:is-drawer-open="isEditProductDrawerOpen"
      :category-id="selectedCategory"
    />
  </div>
</template>

<style lang="scss">
.category-table {
  .v-table {
    th:nth-child(3),
    th:nth-child(4) {
      .v-data-table-header__content {
        justify-content: end;
      }
    }
  }
}
</style>
