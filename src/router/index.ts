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
const AdminDashboardView = () => import('@/views/AdminDashboardView.vue')
const ModeratorDashboardView = () => import('@/views/ModeratorDashboardView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Homeview },
    { path: '/auth', component: AuthView },
    { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/settings', component: SettingsView, meta: { requiresAuth: true } },
    { path: '/search/:uid', component: SearchView },
    { path: '/paper/:uid', component: PaperView },
    { path: '/paper/add', component: PaperAddView, meta: { requiresAuth: true, roles: ['USER'] } },
    {
      path: '/admin',
      component: AdminDashboardView,
      meta: { requiresAuth: true, roles: ['ADMIN'] },
    },
    {
      path: '/moderator',
      component: ModeratorDashboardView,
      meta: { requiresAuth: true, roles: ['MODERATOR', 'ADMIN'] },
    },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
})

// Global auth guard + redirect support
function normalizeRole(r?: string): string | null {
  if (!r || typeof r !== 'string') return null
  return r.trim().toUpperCase()
}

router.beforeEach(async (to) => {
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
  // Ensure roles loaded if needed
  const required = ((to.meta as any)?.roles as string[] | undefined) ?? []
  let userRoles = (auth.User?.roles ?? []).map((r) => normalizeRole(r)).filter(Boolean) as string[]
  if (required.length && auth.isAuthenticated && (!userRoles || userRoles.length === 0)) {
    try {
      await auth.authenticate()
      userRoles = (auth.User?.roles ?? []).map((r) => normalizeRole(r)).filter(Boolean) as string[]
    } catch {}
  }

  // Restrict search for admin/moderator roles
  const isAdmin: boolean = userRoles.includes('ADMIN')
  const isModerator: boolean = userRoles.includes('MODERATOR')
  const isSearchRoute = to.path === '/' || to.path.startsWith('/search')
  if ((isAdmin || isModerator) && isSearchRoute) {
    return { path: isAdmin ? '/admin' : '/moderator', replace: true }
  }
  // Hard restrict visible pages for ADMIN/MODERATOR to their dashboards
  if (isAdmin || isModerator) {
    const openPaths = new Set<string>(['/auth', '/settings', '/profile'])
    const adminAllowed = new Set<string>(['/admin', '/moderator'])
    const moderatorAllowed = new Set<string>(['/moderator'])
    const allowed = isAdmin ? adminAllowed : moderatorAllowed
    if (!allowed.has(to.path) && !openPaths.has(to.path)) {
      return { path: isAdmin ? '/admin' : '/moderator', replace: true }
    }
  }
  // Enforce role-based access if route defines roles
  const requiredRoles = required
  if (requiredRoles && requiredRoles.length) {
    const requiredNormalized = requiredRoles
      .map((r) => normalizeRole(r))
      .filter(Boolean) as string[]
    const ok = requiredNormalized.some((r) => userRoles.includes(r))
    if (!ok) {
      if (isAdmin) return { path: '/admin', replace: true }
      if (isModerator) return { path: '/moderator', replace: true }
      return { path: '/', replace: true }
    }
  }
})

export default router
