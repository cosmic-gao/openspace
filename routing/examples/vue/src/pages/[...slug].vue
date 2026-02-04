<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div style="padding: 20px; color: red;">
    <h2>404 - Not Found</h2>
    <p>The path <code>{{ route.path }}</code> does not exist.</p>
    <RouterLink to="/">Go Home</RouterLink>
  </div>
</template>
