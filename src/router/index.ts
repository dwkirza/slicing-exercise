import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/login',
      name: 'login-alias',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ✅ Global route guard
router.beforeEach((to, from, next) => {
  const token = Cookies.get('authToken')
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !token) {
    return next({ name: 'login' })
  }

  if ((to.path === '/' || to.path === '/login') && token) {
    return next({ name: 'profile' })
  }

  return next()
})

export default router
