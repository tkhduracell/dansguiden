import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/event/:id',
    name: 'ViewEventPage',
    component: () => import('../views/ViewEventPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
