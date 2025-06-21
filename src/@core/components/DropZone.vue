<script setup>
import { ref } from 'vue'
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core'

const dropZoneRef = ref()
const fileData = ref([])

const emit = defineEmits(['update:files'])
const { open, onChange } = useFileDialog({ accept: 'image/*' })

function emitFiles() {
  emit(
    'update:files',
    fileData.value.map(item => ({
      file: item.file,
      url: item.url,
    }))
  )
}

function addFiles(files) {
  const newItems = []

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed')
      continue
    }

    newItems.push({
      file,
      url: useObjectUrl(file).value,
    })
  }

  fileData.value.push(...newItems)
  emitFiles()
}

onChange(files => {
  if (files) addFiles(files)
})

useDropZone(dropZoneRef, addFiles)

function removeFile(index) {
  fileData.value.splice(index, 1)
  emitFiles()
}
</script>

<template>
  <div class="flex">
    <div class="w-full h-auto relative">
      <div
        ref="dropZoneRef"
        class="cursor-pointer"
        @click="() => open()"
      >
        <!-- Empty DropZone -->
        <div
          v-if="fileData.length === 0"
          class="d-flex flex-column justify-center align-center gap-y-2 pa-12 drop-zone rounded"
        >
          <IconBtn
            variant="tonal"
            class="rounded-sm"
          >
            <VIcon icon="tabler-upload" />
          </IconBtn>
          <h4 class="text-h4">
            Drag and drop your image here.
          </h4>
          <span class="text-disabled">or</span>

          <VBtn
            variant="tonal"
            size="small"
          >
            Browse Images
          </VBtn>
        </div>

        <!-- File Previews -->
        <div
          v-else
          class="d-flex justify-center align-center gap-3 pa-8 drop-zone flex-wrap"
        >
          <VRow class="match-height w-100">
            <template
              v-for="(item, index) in fileData"
              :key="index"
            >
              <VCol
                cols="12"
                sm="4"
              >
                <VCard :ripple="false">
                  <VCardText
                    class="d-flex flex-column"
                    @click.stop
                  >
                    <VImg
                      :src="item.url"
                      width="200px"
                      height="150px"
                      class="w-100 mx-auto"
                    />
                    <div class="mt-2">
                      <span class="clamp-text text-wrap">
                        {{ item.file.name }}
                      </span>
                      <span>
                        {{ (item.file.size / 1000).toFixed(2) }} KB
                      </span>
                    </div>
                  </VCardText>
                  <VCardActions>
                    <VBtn
                      variant="text"
                      block
                      @click.stop="removeFile(index)"
                    >
                      Remove File
                    </VBtn>
                  </VCardActions>
                </VCard>
              </VCol>
            </template>
          </VRow>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.drop-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), var(--v-border-opacity));
}
</style>
