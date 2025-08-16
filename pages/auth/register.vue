<template>
    <RegisterForm />
</template>

<script setup>
import RegisterForm from '~/components/auth/RegisterForm.vue'

definePageMeta({
    middleware: 'guest',
})
</script>
