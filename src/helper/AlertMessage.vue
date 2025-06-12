<script setup>
import { useAlert } from "@/composables/useApiAlert.js"

// Use the composable to get the alert's state
const { message, type, visible } = useAlert()
</script>

<template>
  <VAlert
    v-if="visible"
    :type="type"
    class="position-fixed"
    style="top: 1rem; right: 1rem; z-index: 9999; min-width: 250px;"
  >
    {{ message }}
  </VAlert>
</template>
