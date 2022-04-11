import Vue from "vue";
import App from "./App.vue";
import { router } from "./router";
import store from "./store"; // store'u default olarak export ettiğimiz için süslü paranteze almadık.

new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
});
