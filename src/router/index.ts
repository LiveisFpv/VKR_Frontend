import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

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
    { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/settings', component: SettingsView, meta: { requiresAuth: true } },
    { path: '/search/:uid', component: SearchView },
    { path: '/paper/:uid', component: PaperView },
    { path: '/paper/add', component: PaperAddView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
})

// Global auth guard + redirect support
router.beforeEach((to) => {
  const auth = useAuthStore()
  // block private routes
  if (to.meta?.requiresAuth && !auth.isAuthenticated) {
    return { path: '/auth', query: { redirect: to.fullPath }, replace: true }
  }
  // prevent opening /auth when already logged in
  if (to.path === '/auth' && auth.isAuthenticated) {
    const target = (to.query?.redirect as string) || '/'
    return { path: target, replace: true }
  }
})

export default router
