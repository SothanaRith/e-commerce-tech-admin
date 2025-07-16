<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePosterStore } from '@/plugins/store/poster'
import { useRouter } from 'vue-router'

const posterStore = usePosterStore()
const { poster, totalPoster, searchQuery, page, itemsPerPage, sortBy, orderBy } = storeToRefs(posterStore)

await posterStore.fetchPoster()

const selectedRows = ref([])

const baseUrl = import.meta.env.VITE_BASE_IMG_URL

const router = useRouter()

const goToEditPoster = id => {
  router.push({ name: 'apps-ecommerce-poster-edit', params: { id } })
}

const headers = [
  { title: 'Image', key: 'image' },
  { title: 'Title', key: 'title' },
  { title: 'Description', key: 'description' },
  { title: 'Active', key: 'isActive' },
  { title: 'Order', key: 'order' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const updateOptions = options => {
  posterStore.updateOptions(options)
}

watch(
  [searchQuery, sortBy, orderBy, page, itemsPerPage],
  async () => {
    await posterStore.fetchPoster()
  },
  { immediate: true },
)

const deletePoster = async id => {
  await posterStore.deletePoster(id)
}
</script>

<template>
  <VCard>
    <VDivider />
    <div class="d-flex flex-wrap gap-4 ma-6">
      <div class="d-flex align-center">
        <AppTextField
          v-model="searchQuery"
          placeholder="Search Poster"
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
        <RouterLink :to="{ name: 'apps-ecommerce-poster-add'}">
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
          >
            Add Poster
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
      :items="poster"
      :items-length="totalPoster"
      class="text-no-wrap"
      @update:options="updateOptions"
    >
      <template #item.image="{ item }">
        <VAvatar size="42">
          <VImg :src="`${baseUrl}${item.imageUrl}`" />
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
                value="edit"
                prepend-icon="tabler-edit"
                @click="$router.push(`/apps/ecommerce/poster/edit/${item.id}`)"
              >
                Edit
              </VListItem>
              <VListItem
                value="delete"
                prepend-icon="tabler-trash"
                @click="deletePoster(item.id)"
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
          :total-items="totalPoster"
        />
      </template>
    </VDataTableServer>
  </VCard>
</template>
