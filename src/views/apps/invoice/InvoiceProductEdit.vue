<!-- eslint-disable vue/no-mutating-props -->
<script setup>
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  data: {
    type: Object,
    required: true,
    default: () => ({
      title: 'App Design',
      cost: 24,
      hours: 1,
      description: 'Designed UI kit & app pages.',
    }),
  },
})

const emit = defineEmits([
  'removeProduct',
  'totalAmount',
])

const itemsOptions = [
  {
    title: 'App Design',
    cost: 24,
    hours: 1,
    description: 'Designed UI kit & app pages.',
  },
  {
    title: 'App Customization',
    cost: 26,
    hours: 1,
    description: 'Customization & Bug Fixes.',
  },
  {
    title: 'ABC Template',
    cost: 28,
    hours: 1,
    description: 'Vuetify admin template.',
  },
  {
    title: 'App Development',
    cost: 32,
    hours: 1,
    description: 'Native App Development.',
  },
]

const selectedItem = ref('App Customization')
const localProductData = ref(structuredClone(toRaw(props.data)))

watch(selectedItem, () => {
  const item = itemsOptions.filter(obj => {
    return obj.title === selectedItem.value
  })

  localProductData.value = item[0]
})

const removeProduct = () => {
  emit('removeProduct', props.id)
}

const totalPrice = computed(() => Number(localProductData.value.cost) * Number(localProductData.value.hours))

watch(totalPrice, () => {
  emit('totalAmount', totalPrice.value)
}, { immediate: true })
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="add-products-header mb-2 d-none d-md-flex mb-4">
    <VRow class="me-10">
      <VCol
        cols="12"
        md="6"
      >
        <h6 class="text-h6">
          Item
        </h6>
      </VCol>
      <VCol
        cols="12"
        md="2"
      >
        <h6 class="text-h6 ps-2">
          Hours
        </h6>
      </VCol>
      <VCol
        cols="12"
        md="2"
      >
        <h6 class="text-h6">
          Price
        </h6>
      </VCol>
    </VRow>
  </div>

  <VCard
    flat
    border
    class="d-flex flex-sm-row flex-column-reverse"
  >
    <!-- 👉 Left Form -->
    <div class="pa-6 flex-grow-1">
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <AppSelect
            id="item"
            v-model="selectedItem"
            :items="itemsOptions"
            item-title="title"
            item-value="title"
            placeholder="Select Item"
            class="mb-6"
          />

          <AppTextarea
            id="item-description"
            v-model="localProductData.description"
            rows="2"
            placeholder="Item description"
            persistent-placeholder
          />
        </VCol>
        <VCol
          cols="12"
          md="2"
          sm="4"
        >
          <AppTextField
            id="item-hours"
            v-model="localProductData.hours"
            type="number"
            placeholder="5"
          />
        </VCol>
        <VCol
          cols="12"
          md="2"
          sm="4"
        >
          <p class="my-2">
            <span class="d-inline d-md-none">Price: </span>
            <span class="text-high-emphasis">${{ totalPrice }}</span>
          </p>
        </VCol>
      </VRow>
    </div>
  </VCard>
</template>
