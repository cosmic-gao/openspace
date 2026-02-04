<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header style="border-bottom: 1px solid #ccc; padding: 10px;">
      <h1>Routing Vue Example</h1>
      <nav style="display: flex; gap: 10px;">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/posts">Posts</RouterLink>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/login">Login (Group)</RouterLink>
        <RouterLink to="/unknown-path">404</RouterLink>
      </nav>
    </header>
    <main style="padding: 20px;">
      <RouterView />
    </main>
    <footer style="border-top: 1px solid #ccc; padding: 10px; margin-top: 20px;">
      <small>Powered by @routing/core</small>
    </footer>
  </div>
</template>
