// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/',
        name: 'Pipelines',
        // route level code-splitting
        // this generates a separate chunk (Pipeline-[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/Pipeline.vue'),
      },
      {
        path: '/pipeline/:pipeline',
        name: 'Pipeline Form',
        props: true,
        component: () => import('@/components/pipelines/form.vue'),
      },
      {
        path: '/pipeline/:pipeline/apps',
        name: 'Pipeline Apps',
        props: true,
        component: () => import('@/components/pipelines/detail.vue'),
      },
      {
        path: "/pipeline/:pipeline/:phase/apps/:app",
        name: "App Form",
        props: true,
        component: () => import('@/components/apps/form.vue'),
      },
      {
        path: "/pipeline/:pipeline/:phase/:app/detail",
        name: "App Dashboard",
        props: true,
        component: () => import('@/components/apps/detail.vue'),
      },
    ],
  },
  {
    path: '/profile',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
      },
    ],
  },
  {
    path: '/addons',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/addons',
        name: 'Addons',
        component: () => import('@/views/Addons.vue'),
      },
    ],
  },
  {
    path: '/activity',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/activity',
        name: 'Activity',
        component: () => import('@/views/Activity.vue'),
      },
    ],
  },
  {
    path: '/templates',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/templates',
        name: 'Templates',
        component: () => import('@/views/Templates.vue'),
      },
    ],
  },
  {
    path: '/accounts',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/accounts',
        name: 'Accounts',
        component: () => import('@/views/Accounts.vue'),
      },
    ],
  },
  {
    path: '/settings',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
      },
    ],
  },
  {
    path: '/runpacks',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/runpacks',
        name: 'Runpacks',
        component: () => import('@/views/Runpacks.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/layouts/login/Login.vue'),
    children: [
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
      },
    ],
  },
  {
    path: '/setup',
    component: () => import('@/layouts/setup/Setup.vue'),
    children: [
      {
        path: '/setup',
        name: 'Setup',
        component: () => import('@/views/Setup.vue'),
      },
    ],
  },
  {
    path: '/popup',
    component: () => import('@/layouts/default/Popup.vue'),
    children: [
      {
        path: '/popup/logs/:pipeline/:phase/:app/:deploymentstrategy/:buildstrategy',
        name: 'Pupup Logs',
        props: true,
        component: () => import('@/components/apps/logs.vue'),
      },
      {
        path: '/popup/console/:pipeline/:phase/:app',
        name: 'Pupup Console',
        props: true,
        component: () => import('@/components/apps/console.vue'),
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
