<!-- NotificationsPage.vue -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useNotificationStore } from '@/plugins/store/notification'
import ECommerceAddNotificationDrawer from '@/views/apps/ecommerce/ECommerceAddNotificationDrawer.vue'

// If you already have a shared TablePagination component, keep this import:
import TablePagination from '@core/components/TablePagination.vue'

const notifStore = useNotificationStore()

/* -----------------------------
   GLOBAL NOTIFICATIONS (existing)
------------------------------ */
const isAddDrawerOpen = ref(false)
const gPage = ref(1)
const gPerPage = ref(10)
const gLoading = ref(false)

const gHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Body', key: 'body' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const gItems = computed(() => notifStore.notifications || [])
const gTotal = computed(() => notifStore.totalNotifications || gItems.value.length || 0)

const loadGlobal = async () => {
  gLoading.value = true
  try {
    await notifStore.fetchGlobalNotifications(gPage.value, gPerPage.value)
  } finally {
    gLoading.value = false
  }
}

const deleteGlobal = async id => {
  await notifStore.deleteNotification(id)
  await loadGlobal()
}

/* -----------------------------------------
   USERS WITH NOTIFICATIONS (new API section)
------------------------------------------ */
const uPage = ref(1)
const uPerPage = ref(10)
const uOnlyUnread = ref(false)
const uLoading = ref(false)
const uExpanded = ref([])

const uHeaders = [
  { title: 'User', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Total', key: 'total', align: 'end' },
]

const uItems = computed(() => notifStore.usersWithNotifications || [])
const uPagination = computed(() => notifStore.usersWithNotifsPagination || { totalItems: 0 })
const uTotal = computed(() => uPagination.value.totalItems || 0)

const loadUsersWithNotifs = async () => {
  uLoading.value = true
  try {
    await notifStore.fetchUsersWithNotifications(
      uPage.value,
      uPerPage.value,
      uOnlyUnread.value,
    )
  } finally {
    uLoading.value = false
  }
}

const markUserNotifRead = async (notifId, userId) => {
  await notifStore.markAsRead(notifId, userId)
  await loadUsersWithNotifs()
}

const deleteUserNotif = async notifId => {
  await notifStore.deleteNotification(notifId)
  await loadUsersWithNotifs()
}

/* -----------------
   LIFECYCLE + WATCH
------------------ */
onMounted(async () => {
  await Promise.all([loadGlobal(), loadUsersWithNotifs()])
})

watch([gPage, gPerPage], loadGlobal)
watch([uPage, uPerPage, uOnlyUnread], loadUsersWithNotifs)
watch(isAddDrawerOpen, async val => {
  if (!val) {
    // refresh lists after closing the drawer
    await Promise.all([loadGlobal(), loadUsersWithNotifs()])
  }
})
</script>

<template>
  <div class="notifications-page">
    <!-- ====== Global Notifications ====== -->
    <VCard class="mb-6">
      <VCardText class="d-flex flex-wrap align-center justify-space-between gap-4">
        <div class="text-subtitle-1 font-weight-medium">
          Global Notifications
        </div>
        <VBtn
          prepend-icon="tabler-plus"
          @click="isAddDrawerOpen = true"
        >
          Add Notification
        </VBtn>
      </VCardText>

      <VDivider />

      <VDataTableServer
        v-model:page="gPage"
        v-model:items-per-page="gPerPage"
        :loading="gLoading"
        :headers="gHeaders"
        :items="gItems"
        :items-length="gTotal"
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
            @click="deleteGlobal(item.id)"
          >
            <VTooltip activator="parent">
              Delete
            </VTooltip>
            <VIcon icon="tabler-trash" />
          </VBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="gPage"
            :items-per-page="gPerPage"
            :total-items="gTotal"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <!-- ====== Users with Notifications ====== -->
    <VCard>
      <VCardText class="d-flex flex-wrap align-center justify-space-between gap-4">
        <div class="text-subtitle-1 font-weight-medium">
          Users with Notifications
        </div>
        <VSwitch
          v-model="uOnlyUnread"
          inset
          color="primary"
          :label="uOnlyUnread ? 'Only Unread' : 'All'"
        />
      </VCardText>

      <VDivider />

      <VDataTableServer
        v-model:page="uPage"
        v-model:items-per-page="uPerPage"
        v-model:expanded="uExpanded"
        :loading="uLoading"
        show-expand
        :headers="uHeaders"
        :items="uItems"
        :items-length="uTotal"
        item-value="user.id"
        class="text-no-wrap"
      >
        <!-- User name -->
        <template #item.name="{ item }">
          <div class="text-subtitle-2">
            {{ item.user && item.user.name }}
          </div>
        </template>
        <!-- Email -->
        <template #item.email="{ item }">
          <span class="text-body-2">{{ item.user && item.user.email }}</span>
        </template>
        <!-- Total -->
        <template #item.total="{ item }">
          <div class="text-end">
            {{ (item.user.notifications.length) || 0 }}
          </div>
        </template>

        <!-- Expanded row: inner list -->
        <template #expanded-row="{ columns, item }">
          <tr>
            <td
              :colspan="columns.length"
              class="py-4"
            >
              <VTable
                density="compact"
                class="inner-table"
              >
                <thead>
                  <tr>
                    <th class="text-left">
                      ID
                    </th>
                    <th class="text-left">
                      Title
                    </th>
                    <th class="text-left">
                      Body
                    </th>
                    <th class="text-left">
                      Status
                    </th>
                    <th class="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="n in (item.user.notifications || [])"
                    :key="n.id"
                  >
                    <td>{{ n.id }}</td>
                    <td class="text-subtitle-2">
                      {{ n.title }}
                    </td>
                    <td class="text-body-2">
                      {{ n.body }}
                    </td>
                    <td>
                      <VChip
                        :color="n.status === 'read' ? 'success' : 'warning'"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ n.status }}
                      </VChip>
                    </td>
                    <td class="text-right">
                      <VBtn
                        size="small"
                        variant="text"
                        prepend-icon="tabler-trash"
                        @click="deleteUserNotif(n.id)"
                      >
                        Delete
                      </VBtn>
                    </td>
                  </tr>

                  <tr v-if="!item.notifications || !item.notifications.length">
                    <td
                      :colspan="5"
                      class="text-center text-medium-emphasis"
                    >
                      No notifications
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </td>
          </tr>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="uPage"
            :items-per-page="uPerPage"
            :total-items="uTotal"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <!-- Drawer -->
    <ECommerceAddNotificationDrawer
      v-model:is-drawer-open="isAddDrawerOpen"
      @update:is-drawer-open="val => (isAddDrawerOpen = val)"
    />
  </div>
</template>

<style scoped lang="scss">
.v-data-table {
  th:last-child,
  td:last-child {
    text-align: end;
  }
}
.inner-table {
  width: 100%;
}
</style>
