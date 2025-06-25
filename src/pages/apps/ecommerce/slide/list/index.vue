<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlideStore } from '@/plugins/store/slide'

const slideStore = useSlideStore()
const { slide, totalSlide, searchQuery, page, itemsPerPage, sortBy, orderBy } = storeToRefs(slideStore)

await slideStore.fetchSlide()

const selectedRows = ref([])

const baseUrl = import.meta.env.VITE_BASE_IMG_URL

const headers = [
  { title: 'Image', key: 'image' },
  { title: 'Title', key: 'title' },
  { title: 'Description', key: 'description' },
  { title: 'Active', key: 'isActive' },
  { title: 'Order', key: 'order' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const updateOptions = options => {
  slideStore.updateOptions(options)
}

watch(
  [searchQuery, sortBy, orderBy, page, itemsPerPage],
  async () => {
    await slideStore.fetchSlide()
  },
  { immediate: true },
)

const deleteSlide = async id => {
  await slideStore.deleteSlide(id)
}
</script>

<template>
  <VCard>
    <VDivider />
    <div class="d-flex flex-wrap gap-4 ma-6">
      <div class="d-flex align-center">
        <AppTextField
          v-model="searchQuery"
          placeholder="Search Slide"
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
        <RouterLink :to="{ name: 'apps-ecommerce-slide-add'}">
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
          >
            Add Slide
          </VBtn>
        </RouterLink>
      </div>
    </div>

    <VDivider class="mt-4" />

    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:model-value="selectedRows"
      v-model:page="page"
      :headers="headers"
      :items="slide"
      :items-length="totalSlide"
      class="text-no-wrap"
      @update:options="updateOptions"
    >
      <template #item.image="{ item }">
        <VAvatar size="42">
          <VImg :src="`${item.imageUrl}`" />
        </VAvatar>
      </template>

      <template #item.isActive="{ item }">
        <VChip
          :color="item.isActive ? 'success' : 'error'"
          label
          size="small"
        >
          {{ item.isActive ? 'Active' : 'Inactive' }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <IconBtn>
          <VIcon icon="tabler-dots-vertical" />
          <VMenu activator="parent">
            <VList>
              <VListItem
                value="delete"
                prepend-icon="tabler-trash"
                @click="deleteSlide(item.id)"
              >
                Delete
              </VListItem>
            </VList>
          </VMenu>
        </IconBtn>
      </template>

      <template #bottom>
        <TablePagination
          v-model:page="page"
          :items-per-page="itemsPerPage"
          :total-items="totalSlide"
        />
      </template>
    </VDataTableServer>
  </VCard>
</template>
