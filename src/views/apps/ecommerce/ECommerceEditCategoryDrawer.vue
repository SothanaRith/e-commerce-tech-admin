<script setup>
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { ref, watch, onMounted } from 'vue'
import { useProductStore } from '@/plugins/store/product'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  categoryId: {  // Added categoryId to fetch the category for editing
    type: String,
    required: false,
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

// Variables to hold category data
const categoryTitle = ref('')
const categoryImg = ref(null)
const categoryDescription = ref('')

// Store reference to the form
const refVForm = ref()
const useProduct = useProductStore()

// Fetch the category for editing when categoryId is provided
const fetchCategoryData = async () => {
  if (props.categoryId) {
    const category = await useProduct.fetchCategoryById(props.categoryId)

    categoryTitle.value = category.name
    categoryDescription.value = category.description

    // If the category has an image, assign it
    if (category.imageUrl) {
      categoryImg.value = category.imageUrl
    }
  }
}

// Watch for changes to categoryId and fetch new category data
watch(() => props.categoryId, async newCategoryId => {
  if (newCategoryId) {
    await fetchCategoryData()
  }
}, { immediate: true })

// Function to add or update category
const submitCategory = async () => {
  const isValid = await refVForm.value?.validate()
  if (!isValid) return

  const formData = new FormData()

  formData.append('name', categoryTitle.value)
  formData.append('description', editor.value.getHTML())
  if (categoryImg.value) formData.append('image', categoryImg.value)

  if (props.categoryId) {
    await useProduct.updateCategory(formData, props.categoryId)
  }

  resetForm()
}

const resetForm = () => {
  // Check if editor is initialized
  if (editor.value) {
    editor.value.commands.setContent('')
  }

  emit('update:isDrawerOpen', false)
  categoryTitle.value = ''
  categoryImg.value = null
  categoryDescription.value = ''
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
      title="Edit Category"
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
                    @click="submitCategory"
                  >
                    {{ props.categoryId ? 'Update' : 'Add' }} Category
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
