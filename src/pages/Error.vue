<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
</script>

<template>
    <PageHeader />
    <div class="flex flex-col font-roboto text-center m-4 gap-6 pt-36">
        <div class="font-bold text-9xl">
            Oops!
        </div>
        <div class="text-xl">
            The page you were looking for could not be found.
            <RouterLink class="text-blue-400 inline" to="/home">
                Click here to go back to the home page.
            </RouterLink>
        </div>
    </div>
</template>