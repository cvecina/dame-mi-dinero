<template>
    <LoginForm />
</template>

<script setup>
import LoginForm from '~/components/auth/LoginForm.vue'

definePageMeta({
    middleware: 'guest',
})
</script>
