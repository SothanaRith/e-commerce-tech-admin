<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePosterStore } from '@/plugins/store/poster'

const router = useRouter()
const posterStore = usePosterStore()

const baseUrl = import.meta.env.VITE_BASE_IMG_URL
const title = ref('')
const description = ref('')
const imageFile = ref(null) // for upload
const imagePreview = ref(null) // for display
const order = ref(0)
const isActive = ref(true)
const isLoading = ref(false)

const handlePosterDrop = event => {
  const file = event.dataTransfer.files[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const handleImageUpload = event => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const addPoster = async () => {
  isLoading.value = true

  const payload = new FormData()
  
  payload.append('title', title.value)
  payload.append('description', description.value)
  payload.append('order', order.value)
  payload.append('isActive', isActive.value)

  if (imageFile.value) {
    payload.append('image', imageFile.value)
  }

  await posterStore.addPoster(payload)
  isLoading.value = false

  router.push({ name: 'apps-ecommerce-poster-list' })
}

const discardForm = () => {
  router.push({ name: 'apps-ecommerce-poster-list' }) // Go back to list
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 font-weight-medium">
          Add a new Poster
        </h4>
        <div class="text-body-1">
          This will appear in the homepage carousel.
        </div>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="discardForm"
        >
          Discard
        </VBtn>
        <VBtn
          :loading="isLoading"
          @click="addPoster"
        >
          Publish Poster
        </VBtn>
      </div>
    </div>

    <VRow>
      <VCol md="8">
        <VCard
          class="mb-6"
          title="Poster Information"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="title"
                  label="Title"
                  placeholder="e.g. Summer Sale"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="description"
                  label="Description"
                  placeholder="Optional subtitle"
                />
              </VCol>

              <VCol cols="12">
                <div
                  class="drop-zone mt-4"
                  @dragover.prevent
                  @drop.prevent="handlePosterDrop"
                >
                  <p class="text-center text-caption">
                    Drag & drop or click to upload
                  </p>
                  <input
                    type="file"
                    class="hidden-input"
                    accept="image/*"
                    @change="handleImageUpload"
                  >
                </div>
              </VCol>

              <VCol
                v-if="imagePreview"
                cols="12"
              >
                <div v-if="imagePreview || (typeof imageFile === 'string')">
                  <VImg
                    :src="imagePreview || `${imageFile}`"
                    alt="Variant Image"
                    class="my-4"
                    max-width="120"
                    max-height="120"
                  />
                </div>
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="order"
                  type="number"
                  label="Order"
                  placeholder="Display order"
                />
              </VCol>

              <VCol cols="12">
                <VSwitch
                  v-model="isActive"
                  label="Active"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
