<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosterStore } from "@/plugins/store/poster"

const baseUrl = import.meta.env.VITE_BASE_IMG_URL

const route = useRoute()
const router = useRouter()
const posterId = ref(route.params.id || null)
const posterStore = usePosterStore()

const title = ref('')
const description = ref('')
const imageUrl = ref(null)
const previewUrl = ref(null)
const order = ref(0)
const isActive = ref(true)
const isLoading = ref(false)

onMounted(async () => {
  if (posterId.value) {
    await posterStore.fetchPosterById(posterId.value)

    const poster = posterStore.singlePoster?.data

    if (poster) {
      title.value = poster.title
      description.value = poster.description
      imageUrl.value = `${baseUrl}${poster.imageUrl}`
      order.value = poster.order
      isActive.value = poster.isActive ?? false
    }
  }
})

const handlePosterDrop = event => {
  const file = event.dataTransfer.files[0]
  if (file) {
    imageUrl.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleImageUpload = event => {
  const file = event.target.files[0]
  if (file) {
    imageUrl.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const submitPoster = async () => {
  isLoading.value = true

  const payload = new FormData()

  payload.append('title', title.value)
  payload.append('description', description.value)
  payload.append('order', order.value)
  payload.append('isActive', isActive.value)

  if (imageUrl.value instanceof File) {
    payload.append('image', imageUrl.value)
  }

  if (posterId.value) {
    await posterStore.editPoster(posterId.value, payload)
  } else {
    await posterStore.addPoster(payload)
  }
  router.push({ name: 'apps-ecommerce-poster-list' })

  isLoading.value = false
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
        >
          Discard
        </VBtn>
        <VBtn
          :loading="isLoading"
          @click="submitPoster"
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
                v-if="imageUrl"
                cols="12"
              >
                <div v-if="previewUrl || (typeof imageUrl === 'string')">
                  <VImg
                    :src="previewUrl || `${imageUrl}`"
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
