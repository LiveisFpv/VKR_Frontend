import { createRouter, createWebHistory } from 'vue-router'

const Homeview = () => import('@/views/HomeView.vue')
const AuthView = () => import('@/views/AuthView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')
const SearchView = () => import('@/views/SearchView.vue')
const PaperView = () => import('@/views/PaperView.vue')
const PaperAddView = () => import('@/views/PaperAddView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Homeview },
    { path: '/auth', component: AuthView },
    { path: '/profile', component: ProfileView },
    { path: '/settings', component: SettingsView },
    { path: '/search/:uid', component: SearchView },
    { path: '/paper/:uid', component: PaperView },
    { path: '/paper/add', component: PaperAddView },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
})

export default router
