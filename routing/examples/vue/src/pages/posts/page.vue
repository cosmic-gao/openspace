<script setup lang="ts">
import { RouterLink } from 'vue-router'
const posts = [1, 2, 3]
</script>

<template>
  <div>
    <h2>Posts List</h2>
    <ul>
      <li v-for="id in posts" :key="id">
        <RouterLink :to="`/posts/${id}`">View Post {{ id }}</RouterLink>
      </li>
    </ul>
  </div>
</template>
