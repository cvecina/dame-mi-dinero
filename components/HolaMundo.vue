<template>
  {{ data }}
</template>

<script setup>
const { data } = await useFetch("/api/hello");
</script>