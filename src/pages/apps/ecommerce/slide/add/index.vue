<script setup>
import { ref } from 'vue'
import { useSlideStore } from '@/plugins/store/slide'

const slideStore = useSlideStore()

const title = ref('')
const description = ref('')
const imageUrl = ref('')
const order = ref(0)
const isActive = ref(true)
const isLoading = ref(false)

const addSlide = async () => {
  isLoading.value = true

  const payload = {
    title: title.value,
    description: description.value,
    imageUrl: imageUrl.value,
    order: order.value,
    isActive: isActive.value,
  }

  await slideStore.addSlide(payload)
  isLoading.value = false
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 font-weight-medium">
          Add a new Slide
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
          @click="addSlide"
        >
          Publish Slide
        </VBtn>
      </div>
    </div>

    <VRow>
      <VCol md="8">
        <VCard
          class="mb-6"
          title="Slide Information"
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
                <AppTextField
                  v-model="imageUrl"
                  label="Image URL"
                  placeholder="https://example.com/image.jpg"
                />
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
