<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
</script>

<template>
    <PageHeader />
    <div class="flex flex-col font-roboto text-center pt-36 m-4 gap-6 md:mx-auto md:w-[720px] md:gap-8"> 
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