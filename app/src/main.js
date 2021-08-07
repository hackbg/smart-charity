import Vue from 'vue';
import Buefy from 'buefy';
import VueTruncate from 'vue-truncate-filter';
import App from './App.vue';
import router from './router';
import store from './store';
import './main.scss';

import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';

Vue.config.productionTip = false;

Vue.use(Buefy, {
  defaultIconPack: 'fas',
});

Vue.use(VueTruncate);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
