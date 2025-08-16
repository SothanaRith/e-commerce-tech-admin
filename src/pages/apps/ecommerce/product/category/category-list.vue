<!--<script setup>-->
<!--import { onMounted, computed, ref } from 'vue'-->
<!--import { useCategoryStore } from '@/stores/useCategoryStore'-->
<!--import { storeToRefs } from 'pinia'-->

<!--import ECommerceAddCategoryDrawer from '@/views/apps/ecommerce/ECommerceAddCategoryDrawer.vue'-->

<!--// 🍍 Pinia Store-->
<!--const categoryStore = useCategoryStore()-->
<!--const { categories, loading, error } = storeToRefs(categoryStore)-->

<!--// Fetch categories on mount-->
<!--onMounted(() => {-->
<!--  categoryStore.fetchCategories()-->
<!--})-->

<!--// 🧠 UI States-->
<!--const itemsPerPage = ref(10)-->
<!--const page = ref(1)-->
<!--const searchQuery = ref('')-->
<!--const isAddProductDrawerOpen = ref(false)-->

<!--// ✅ Table headers-->
<!--const headers = [-->
<!--  { title: 'Categories', key: 'categoryTitle' },-->
<!--  { title: 'Total Products', key: 'totalProduct' },-->
<!--  { title: 'Total Earning', key: 'totalEarning' },-->
<!--  { title: 'Actions', key: 'actions', sortable: false },-->
<!--]-->

<!--// 🧠 Map API data to table data-->
<!--const categoryData = computed(() => {-->
<!--  if (!Array.isArray(categories.value)) return []-->

<!--  return categories.value.map(cat => ({-->
<!--    id: cat.id,-->
<!--    categoryTitle: cat.name || 'Unknown Category',-->
<!--    description: cat.description || 'No description provided.',-->
<!--    totalProduct: cat.totalProduct || 0,-->
<!--    totalEarning: cat.totalEarning || 0,-->
<!--    image: cat.imageUrl || 'https://via.placeholder.com/38',-->
<!--  }))-->
<!--})-->
<!--</script>-->

<!--<template>-->
<!--  <div>-->
<!--    <VCard>-->
<!--      <VCardText>-->
<!--        <div class="d-flex justify-sm-space-between flex-wrap gap-y-4 gap-x-6 justify-start">-->
<!--          &lt;!&ndash; Search Input &ndash;&gt;-->
<!--          <AppTextField-->
<!--            v-model="searchQuery"-->
<!--            placeholder="Search Category"-->
<!--            style="max-inline-size: 280px; min-inline-size: 280px;"-->
<!--          />-->

<!--          <div class="d-flex align-center flex-wrap gap-4">-->
<!--            &lt;!&ndash; Items per page select &ndash;&gt;-->
<!--            <AppSelect-->
<!--              v-model="itemsPerPage"-->
<!--              :items="[5, 10, 15]"-->
<!--              style="max-inline-size: 100px; min-inline-size: 100px;"-->
<!--            />-->

<!--            &lt;!&ndash; Button to open Add Category Drawer &ndash;&gt;-->
<!--            <VBtn-->
<!--              prepend-icon="tabler-plus"-->
<!--              @click="isAddProductDrawerOpen = !isAddProductDrawerOpen"-->
<!--            >-->
<!--              Add Category-->
<!--            </VBtn>-->
<!--          </div>-->
<!--        </div>-->
<!--      </VCardText>-->

<!--      <VDivider />-->

<!--      <div class="category-table">-->
<!--        &lt;!&ndash; Vuetify Data Table &ndash;&gt;-->
<!--        <VDataTable-->
<!--          v-model:items-per-page="itemsPerPage"-->
<!--          v-model:page="page"-->
<!--          :headers="headers"-->
<!--          :items="categoryData"-->
<!--          item-value="categoryTitle"-->
<!--          :search="searchQuery"-->
<!--          show-select-->
<!--          class="text-no-wrap"-->
<!--        >-->
<!--          &lt;!&ndash; Custom action buttons &ndash;&gt;-->
<!--          <template #item.actions>-->
<!--            <IconBtn>-->
<!--              <VIcon-->
<!--                icon="tabler-edit"-->
<!--                size="22"-->
<!--              />-->
<!--            </IconBtn>-->
<!--            <IconBtn>-->
<!--              <VIcon-->
<!--                icon="tabler-dots-vertical"-->
<!--                size="22"-->
<!--              />-->
<!--            </IconBtn>-->
<!--          </template>-->

<!--          &lt;!&ndash; Category title cell &ndash;&gt;-->
<!--          <template #item.categoryTitle="{ item }">-->
<!--            <div class="d-flex gap-x-3 align-center">-->
<!--              <VAvatar-->
<!--                variant="tonal"-->
<!--                rounded-->
<!--                size="38"-->
<!--              >-->
<!--                <img-->
<!--                  :src="item.image"-->
<!--                  :alt="item.categoryTitle"-->
<!--                  width="38"-->
<!--                  height="38"-->
<!--                />-->
<!--              </VAvatar>-->
<!--              <div>-->
<!--                <h6 class="text-h6">-->
<!--                  {{ item.categoryTitle }}-->
<!--                </h6>-->
<!--                <div class="text-body-2">-->
<!--                  {{ item.description }}-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </template>-->

<!--          &lt;!&ndash; Total earnings cell &ndash;&gt;-->
<!--          <template #item.totalEarning="{ item }">-->
<!--            <div class="text-body-1 text-end pe-4">-->
<!--              {{ (item.totalEarning).toLocaleString("en-IN", { style: "currency", currency: 'USD' }) }}-->
<!--            </div>-->
<!--          </template>-->

<!--          &lt;!&ndash; Total products cell &ndash;&gt;-->
<!--          <template #item.totalProduct="{ item }">-->
<!--            <div class="text-end pe-4">-->
<!--              {{ (item.totalProduct).toLocaleString() }}-->
<!--            </div>-->
<!--          </template>-->

<!--          &lt;!&ndash; Pagination &ndash;&gt;-->
<!--          <template #bottom>-->
<!--            <TablePagination-->
<!--              v-model:page="page"-->
<!--              :items-per-page="itemsPerPage"-->
<!--              :total-items="categoryData.length"-->
<!--            />-->
<!--          </template>-->
<!--        </VDataTable>-->
<!--      </div>-->
<!--    </VCard>-->

<!--    &lt;!&ndash; Add Category Drawer &ndash;&gt;-->
<!--    <ECommerceAddCategoryDrawer v-model:is-drawer-open="isAddProductDrawerOpen" />-->
<!--  </div>-->
<!--</template>-->

<!--<style scoped lang="scss">-->
<!--.category-table {-->
<!--  .v-table {-->
<!--    th:nth-child(3),-->
<!--    th:nth-child(4) {-->
<!--      .v-data-table-header__content {-->
<!--        justify-content: end;-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { storeToRefs } from 'pinia'

import ECommerceAddCategoryDrawer from '@/views/apps/ecommerce/ECommerceAddCategoryDrawer.vue'

// 🍍 Pinia Store
const categoryStore = useCategoryStore()
const { categories, loading, error } = storeToRefs(categoryStore)

// Fetch categories on mount
onMounted(async () => {
  await categoryStore.fetchCategories()
})

// 🧠 UI States
const itemsPerPage = ref(10)
const page = ref(1)
const searchQuery = ref('')
const isAddProductDrawerOpen = ref(false)

// ✅ Table headers
const headers = [
  { title: 'Categories', key: 'categoryTitle' },
  { title: 'Total Products', key: 'totalProduct' },
  { title: 'Total Earning', key: 'totalEarning' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// 🧠 Map API data to table data
const categoryData = computed(() => {
  console.log('Raw categories data:', categories.value)

  if (!Array.isArray(categories.value)) {
    console.warn('Categories is not an array:', categories.value)
    return []
  }

  const mappedData = categories.value.map(cat => ({
    id: cat.id,
    categoryTitle: cat.name || cat.categoryTitle || cat.title || 'Unknown Category',
    description: cat.description || 'No description provided.',
    totalProduct: cat.totalProduct || cat.totalProducts || cat.productCount || 0,
    totalEarning: cat.totalEarning || cat.totalEarnings || cat.earnings || 0,
    image: cat.imageUrl || cat.image || cat.avatar || 'https://via.placeholder.com/38',
  }))

  console.log('Mapped category data:', mappedData)
  return mappedData
})

// Watch for data changes (debugging)
watch(categories, (newCategories) => {
  console.log('Categories updated:', newCategories)
}, { deep: true })

// Handle refresh
const refreshCategories = async () => {
  await categoryStore.fetchCategories()
}
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-sm-space-between flex-wrap gap-y-4 gap-x-6 justify-start">
          <!-- Search Input -->
          <AppTextField
            v-model="searchQuery"
            placeholder="Search Category"
            style="max-inline-size: 280px; min-inline-size: 280px;"
          />

          <div class="d-flex align-center flex-wrap gap-4">
            <!-- Items per page select -->
            <AppSelect
              v-model="itemsPerPage"
              :items="[5, 10, 15]"
              style="max-inline-size: 100px; min-inline-size: 100px;"
            />

            <!-- Refresh Button -->
            <VBtn
              variant="outlined"
              prepend-icon="tabler-refresh"
              :loading="loading"
              @click="refreshCategories"
            >
              Refresh
            </VBtn>

            <!-- Button to open Add Category Drawer -->
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

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center align-center pa-8">
        <VProgressCircular
          indeterminate
          color="primary"
          size="64"
        />
        <span class="ml-4">Loading categories...</span>
      </div>

      <!-- Error State -->
      <VAlert
        v-else-if="error"
        type="error"
        class="ma-4"
        closable
        @click:close="error = null"
      >
        {{ error }}
      </VAlert>

      <!-- Empty State -->
      <div v-else-if="!loading && categoryData.length === 0" class="text-center pa-8">
        <VIcon
          icon="tabler-package-off"
          size="64"
          class="mb-4 text-disabled"
        />
        <h3 class="text-h6 mb-2">No Categories Found</h3>
        <p class="text-body-2 text-disabled mb-4">
          There are no categories to display. Add your first category to get started.
        </p>
        <VBtn
          prepend-icon="tabler-plus"
          @click="isAddProductDrawerOpen = !isAddProductDrawerOpen"
        >
          Add First Category
        </VBtn>
      </div>

      <!-- Data Table -->
      <div v-else class="category-table">
        <VDataTable
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="headers"
          :items="categoryData"
          item-value="id"
          :search="searchQuery"
          show-select
          class="text-no-wrap"
        >
          <!-- Custom action buttons -->
          <template #item.actions="{ item }">
            <IconBtn>
              <VIcon
                icon="tabler-edit"
                size="22"
              />
            </IconBtn>
            <IconBtn>
              <VIcon
                icon="tabler-dots-vertical"
                size="22"
              />
            </IconBtn>
          </template>

          <!-- Category title cell -->
          <template #item.categoryTitle="{ item }">
            <div class="d-flex gap-x-3 align-center">
              <VAvatar
                variant="tonal"
                rounded
                size="38"
              >
                <img
                  :src="item.image"
                  :alt="item.categoryTitle"
                  width="38"
                  height="38"
                  @error="$event.target.src = 'https://via.placeholder.com/38'"
                />
              </VAvatar>
              <div>
                <h6 class="text-h6">
                  {{ item.categoryTitle }}
                </h6>
                <div class="text-body-2 text-disabled">
                  {{ item.description }}
                </div>
              </div>
            </div>
          </template>

          <!-- Total earnings cell -->
          <template #item.totalEarning="{ item }">
            <div class="text-body-1 text-end pe-4">
              {{ Number(item.totalEarning).toLocaleString("en-US", { style: "currency", currency: 'USD' }) }}
            </div>
          </template>

          <!-- Total products cell -->
          <template #item.totalProduct="{ item }">
            <div class="text-end pe-4">
              {{ Number(item.totalProduct).toLocaleString() }}
            </div>
          </template>

          <!-- Pagination -->
          <template #bottom>
            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="categoryData.length"
            />
          </template>
        </VDataTable>
      </div>
    </VCard>

    <!-- Add Category Drawer -->
    <ECommerceAddCategoryDrawer
      v-model:is-drawer-open="isAddProductDrawerOpen"
      @category-added="refreshCategories"
    />
  </div>
</template>

<style scoped lang="scss">
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
