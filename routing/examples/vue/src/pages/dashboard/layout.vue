<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div style="display: flex; border: 1px solid #ddd; min-height: 300px;">
    <aside style="width: 200px; background: #f5f5f5; padding: 10px;">
      <h3>Dashboard</h3>
      <ul style="list-style: none; padding: 0;">
        <li><RouterLink to="/dashboard">Overview</RouterLink></li>
        <li><RouterLink to="/dashboard/settings">Settings</RouterLink></li>
      </ul>
    </aside>
    <div style="padding: 20px; flex: 1;">
      <RouterView />
    </div>
  </div>
</template>
