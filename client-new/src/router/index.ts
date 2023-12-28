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
    path: '/events',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/events',
        name: 'Events',
        component: () => import('@/views/Events.vue'),
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
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
