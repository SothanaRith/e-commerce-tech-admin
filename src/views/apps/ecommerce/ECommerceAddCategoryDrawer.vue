<script setup>
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'
import {
  EditorContent,
  useEditor,
} from '@tiptap/vue-3'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { ref, watch } from 'vue'
import { useProductStore } from '@/plugins/store/product'

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

const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    Image,
    Placeholder.configure({ placeholder: 'Enter a category description...' }),
    Underline,
    Link.configure({ openOnClick: false }),
  ],
})

const addImage = () => {
  const url = prompt('Enter image URL')
  if (url) {
    editor?.chain().focus().setImage({ src: url }).run()
  }
}

const refVForm = ref()
const categoryTitle = ref('')
const categoryImg = ref(null)
const useProduct = useProductStore()

const addCategory = async () => {
  const isValid = await refVForm.value?.validate()
  if (!isValid) return

  const formData = new FormData()

  formData.append('name', categoryTitle.value)
  formData.append('description', editor.value.getHTML())
  if (categoryImg.value) formData.append('image', categoryImg.value)

  await useProduct.addCategory(formData)

  resetForm()
}

const resetForm = () => {
  emit('update:isDrawerOpen', false)
  categoryTitle.value = ''
  categoryImg.value = null
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
      title="Add Category"
      @cancel="$emit('update:isDrawerOpen', false)"
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
                <AppTextField
                  v-model="categoryTitle"
                  label="Title"
                  placeholder="Fashion"
                />
              </VCol>
              <VCol cols="12">
                <VLabel>
                  <span class="text-sm text-high-emphasis mb-1">Attachment</span>
                </VLabel>
                <VFileInput
                  v-model="categoryImg"
                  prepend-icon=""
                  clearable
                >
                  <template #append>
                    <VBtn variant="tonal">
                      Choose
                    </VBtn>
                  </template>
                </VFileInput>
              </VCol>

              <VCol cols="12">
                <div class="d-flex justify-start">
                  <VBtn
                    type="submit"
                    color="primary"
                    class="me-4"
                    @click="addCategory"
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

<style lang="scss">
.category-navigation-drawer {
  .ProseMirror {
    min-block-size: 9vh !important;

    p {
      margin-block-end: 0;
    }

    p.is-editor-empty:first-child::before {
      block-size: 0;
      color: #adb5bd;
      content: attr(data-placeholder);
      float: inline-start;
      pointer-events: none;
    }

    &-focused {
      outline: none;
    }

    ul,
    ol {
      padding-inline: 1.125rem;
    }
  }

  .is-active {
    border-color: rgba(var(--v-theme-primary), var(--v-border-opacity)) !important;
    background-color: rgba(var(--v-theme-primary), var(--v-activated-opacity));
    color: rgb(var(--v-theme-primary));
  }
}
</style>
