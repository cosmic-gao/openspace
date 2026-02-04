<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div>
    <h2>Post Detail</h2>
    <p>Post ID: <strong>{{ route.params['id'] }}</strong></p>
    <RouterLink to="/posts">Back to List</RouterLink>
  </div>
</template>
