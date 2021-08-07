import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../pages/Home.vue';
import Campaign from '../pages/Campaign.vue';
import Create from '../pages/Create.vue';
import About from '../pages/About.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/campaign/new',
    name: 'Create',
    component: Create,
  },
  {
    path: '/campaign/:id',
    name: 'Campaign',
    component: Campaign,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
