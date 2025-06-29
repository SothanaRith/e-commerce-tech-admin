<script setup>
</script>

<template>
  <div class="v-avatar-group demo-avatar-group">
    <VAvatar :size="40">
      <VImg :src="avatar1" />
      <VTooltip
        activator="parent"
        location="top"
      >
        John Doe
      </VTooltip>
    </VAvatar>

    <VAvatar :size="40">
      <VImg :src="avatar2" />
      <VTooltip
        activator="parent"
        location="top"
      >
        Jennie Obrien
      </VTooltip>
    </VAvatar>

    <VAvatar :size="40">
      <VImg :src="avatar3" />
      <VTooltip
        activator="parent"
        location="top"
      >
        Peter Harper
      </VTooltip>
    </VAvatar>

    <VAvatar :size="40">
      <VImg :src="avatar4" />
      <VTooltip
        activator="parent"
        location="top"
      >
        Vivian Padilla
      </VTooltip>
    </VAvatar>

    <VAvatar :size="40">
      <VImg :src="avatar5" />
      <VTooltip
        activator="parent"
        location="top"
      >
        Scott Wells
      </VTooltip>
    </VAvatar>

    <VAvatar :size="40">
      <VImg :src="avatar6" />
      <VTooltip
        activator="parent"
        location="top"
      >
        Angel Bishop
      </VTooltip>
    </VAvatar>

    <VAvatar
      :size="40"
      :color="$vuetify.theme.current.dark ? '#373b50' : '#eeedf0'"
    >
      +3
    </VAvatar>
  </div>
</template>

<style lang="scss" scoped>
.demo-avatar-group {
  &.v-avatar-group {
    .v-avatar {
      &:last-child {
        border: none;
      }
    }
  }
}
</style>
