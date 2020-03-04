import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { domain, clientId } from "../auth_config.json";
import { Auth0Plugin } from "./auth";
import { firestorePlugin } from "vuefire";

// Install the authentication plugin here
Vue.use(Auth0Plugin, {
  domain,
  clientId
});

Vue.use(firestorePlugin);

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
