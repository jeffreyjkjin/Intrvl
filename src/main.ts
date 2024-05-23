import { createApp } from 'vue'
import { createRouter, createWebHistory, Router } from 'vue-router'
import './style.css'

import App from './App.vue'
import Error from './pages/Error.vue'
import Home from './pages/Home.vue'
import Start from './pages/Start.vue'
import Timer from './pages/Timer.vue'

const routes: any[] = [
    { path: '/', component: Home },
    { path: '/timer/:datetime', component: Timer },
    { path: '/start/:datetime', component: Start },
    { path: '/:pathMatch(.*)*', component: Error }
];

const router: Router = createRouter({
    history: createWebHistory(),
    routes
});

createApp(App)
    .use(router)
    .mount('#app');
