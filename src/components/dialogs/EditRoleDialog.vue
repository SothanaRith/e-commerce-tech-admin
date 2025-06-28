<script setup>
import { VForm } from 'vuetify/components/VForm'
import avatar1 from "@images/avatars/avatar-1.png"

const props = defineProps({
  rolePermissions: {
    type: Object,
    required: false,
    default: () => ({
      role: "",
    }),
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'update:rolePermissions',
])

const isSelectAll = ref(false)
const role = ref('')
const refPermissionForm = ref()

const onSubmit = () => {
  const rolePermissions = {
    role: role.value,
  }

  emit('update:rolePermissions', rolePermissions)
  emit('update:isDialogVisible', false)

  isSelectAll.value = false
  refPermissionForm.value?.reset()
}

const onReset = () => {
  emit('update:isDialogVisible', false)

  isSelectAll.value = false
  refPermissionForm.value?.reset()
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="onReset"
  >
    <!-- 👉 Dialog close btn -->
    <DialogCloseBtn @click="onReset" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          Edit Role
        </h4>
        <p class="text-body-1 text-center mb-6">
          Set New Role
        </p>

        <!-- 👉 Form -->
        <VForm ref="refPermissionForm">
          <AppSelect
            v-model="role"
            placeholder="Select Role"
            :items="[{ title: 'Admin', value: 'admin' }, { title: 'Customer', value: 'buyer' }]"
            clearable
            clear-icon="tabler-x"
            class=" mb-6 "
          />
          <!-- 👉 Actions button -->
          <div class="d-flex align-center justify-center gap-4">
            <VBtn @click="onSubmit">
              Submit
            </VBtn>

            <VBtn
              color="secondary"
              variant="tonal"
              @click="onReset"
            >
              Cancel
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.permission-table {
  td {
    border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    padding-block: 0.5rem;

    .v-checkbox {
      min-inline-size: 4.75rem;
    }

    &:not(:first-child) {
      padding-inline: 0.5rem;
    }

    .v-label {
      white-space: nowrap;
    }
  }
}
</style>
