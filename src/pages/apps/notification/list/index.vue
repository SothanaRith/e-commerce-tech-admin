<script setup>
import { ref, watch, onMounted } from 'vue'
import { useNotificationStore } from '@/plugins/store/notification'
import ECommerceAddNotificationDrawer from "@/views/apps/ecommerce/ECommerceAddNotificationDrawer.vue"

const useNotification = useNotificationStore()

// Setup state
const notificationData = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)
const page = ref(1)
const isAddProductDrawerOpen = ref(false)

// Define table headers
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Body', key: 'body' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Load data
const loadNotifications = async () => {
  await useNotification.fetchGlobalNotifications(page.value, itemsPerPage.value)
  notificationData.value = useNotification.notifications
  totalItems.value = useNotification.totalNotifications
}

onMounted(loadNotifications)
watch([page, itemsPerPage], loadNotifications)

const deleteNotifications = async id => {
  await useNotification.deleteNotification(id)
  await loadNotifications()
}
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-sm-space-between flex-wrap gap-y-4 gap-x-6 justify-start">

          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn
              prepend-icon="tabler-plus"
              @click="isAddProductDrawerOpen = !isAddProductDrawerOpen"
            >
              Add Notification
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDivider />

      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="notificationData"
        :items-length="totalItems"
        class="text-no-wrap"
      >
        <template #item.title="{ item }">
          <div class="text-subtitle-2 font-weight-medium">
            {{ item.title }}
          </div>
        </template>

        <template #item.body="{ item }">
          <div class="text-body-2">
            {{ item.body }}
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            :color="item.status === 'read' ? 'success' : 'warning'"
            variant="tonal"
            size="small"
          >
            {{ item.status }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon
            @click="deleteNotifications(item.id)"
          >
            <VTooltip activator="parent">
              Delete
            </VTooltip>
            <VIcon icon="tabler-trash" />
          </VBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalItems"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <!-- Add/Edit Drawer Placeholder -->
    <ECommerceAddNotificationDrawer v-model:is-drawer-open="isAddProductDrawerOpen" />
  </div>
</template>

<style scoped lang="scss">
.v-data-table {
  th:last-child,
  td:last-child {
    text-align: end;
  }
}
</style>
