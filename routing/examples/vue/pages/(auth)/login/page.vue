<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function login() {
  router.push('/dashboard')
}
</script>

<template>
  <div>
    <h2>Login Page</h2>
    <p>This page is inside <code>pages/(auth)/login.vue</code></p>
    <p>The URL is <code>/login</code> (group name omitted).</p>
    <button @click="login">Login & Go to Dashboard</button>
  </div>
</template>
