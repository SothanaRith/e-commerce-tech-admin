<script setup>
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { ref } from 'vue'
import { useNotificationStore } from '@/plugins/store/notification'
import {useUserStore} from "@/plugins/store/user.js";
import AppSelect from "@core/components/app-form-elements/AppSelect.vue";

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:isDrawerOpen'])

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}

// Editor for body
const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    Image,
    Placeholder.configure({ placeholder: 'Enter notification body...' }),
    Underline,
    Link.configure({ openOnClick: false }),
  ],
})

const refVForm = ref()
const notificationTitle = ref('')
const userId = ref('')
const users = ref(null)
const useNotification = useNotificationStore()
const useUser = useUserStore()

await useUser.fetchUser()

users.value = useUser.user

console.log(users.value)

const addNotification = async () => {
  const isValid = await refVForm.value?.validate()
  if (!isValid) return

  const bodyHTML = editor.value?.getText() || ''

  await useNotification.createNotification({
    title: notificationTitle.value,
    body: bodyHTML,
    userId: userId.value,
  })

  resetForm()
}

const resetForm = () => {
  emit('update:isDrawerOpen', false)
  notificationTitle.value = ''
  editor?.commands.setContent('')
  refVForm.value?.reset()
}
</script>

<template>
  <VNavigationDrawer
    :model-value="props.isDrawerOpen"
    temporary
    location="end"
    width="370"
    border="none"
    class="category-navigation-drawer scrollable-content"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Header -->
    <AppDrawerHeaderSection
      title="Add Notification"
      @cancel="resetForm"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent=""
          >
            <VRow>
              <VCol cols="12">
                <AppSelect
                  v-model="userId"
                  item-title="title"
                  item-value="value"
                  label="To User (optional)"
                  chips
                  placeholder="Select User"
                  :items="users.map(p => ({ title: p.name, value: p.id }))"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="notificationTitle"
                  label="Title"
                  placeholder="Enter title..."
                  :rules="[v => !!v || 'Title is required']"
                />
              </VCol>

              <VCol cols="12">
                <label class="text-sm text-high-emphasis mb-1 d-block">Body</label>
                <div class="editor-wrapper border rounded pa-3">
                  <EditorContent :editor="editor" />
                </div>
              </VCol>

              <VCol cols="12">
                <div class="d-flex justify-start">
                  <VBtn
                    type="submit"
                    color="primary"
                    class="me-4"
                    @click="addNotification"
                  >
                    Add
                  </VBtn>
                  <VBtn
                    color="error"
                    variant="tonal"
                    @click="resetForm"
                  >
                    Discard
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<style scoped lang="scss">
.category-navigation-drawer {
  .ProseMirror {
    min-height: 120px;
    padding: 4px;

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: #aaa;
      pointer-events: none;
    }
  }
}
</style>
