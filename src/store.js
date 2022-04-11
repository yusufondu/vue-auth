import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { router } from "./router";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    // state'te ne tutacağız ? Örn. firebase'e gidip login/kayıt olup firebase'in
    // gönderdiği token'ı state içerisinde tutucaz.
    token: "",
    firebaseApiKey: "AIzaSyBExQcH-qDWfLRzuhQVy9Pw6QxMxLSuOzw",
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    clearToken(state) {
      state.token = "";
    },
  },
  actions: {
    initAuth({ commit, dispatch }) {
      let token = localStorage.getItem("token");
      if (token) {
        let expirationDate = localStorage.getItem("expirationDate");
        let time = new Date().getTime();

        if ( time >= +expirationDate) {
          console.log("token süresi geçmiş.");
          dispatch("logout")
        } else {
          commit("setToken", token);
          let timerSecond = +expirationDate - time;
          console.log(timerSecond);
          dispatch("expiresInTimer", timerSecond)
          router.push("/")
        }
      } else {
        router.push("/auth")
        return false
      }
    },
    login({ commit, dispatch, state }, authData) {
      let authLink =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=";
      if (authData.isUser) {
        authLink =
          "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";
      }
      return axios // return ekledikten sonra promise döndürüp Auth.vue içerisinde .then işlemi yapabilirim.
        .post(authLink + "AIzaSyBExQcH-qDWfLRzuhQVy9Pw6QxMxLSuOzw", {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true,
        })
        .then((response) => {
          console.log('response.data', response.data);
          commit("setToken", response.data.idToken); 
          // setToken mutation'unu commitle neyle ? response.data.idToken ile...
          localStorage.setItem("token", response.data.idToken)
          localStorage.setItem("expirationDate", new Date().getTime() + +response.data.expiresIn * 1000)
          // localStorage.setItem("expirationDate", new Date().getTime() + 10000)

          dispatch("expiresInTimer", +response.data.expiresIn * 1000) 
          // dispatch("expiresInTimer", 10000) // + ile integer yaptık. "parseInt" ile de yapabilirdik.
          // + ile integer yaptık. "parseInt" ile de yapabilirdik.

        });
    },
    logout({ commit, dispatch, state }) {
      commit("clearToken")
      localStorage.removeItem("token");
      localStorage.removeItem("expirationDate");
      router.replace("/auth");
    },
    expiresInTimer({ dispatch }, expiresIn) {
      setTimeout(() => {
        dispatch("logout") // actions'a ulaşmak için dispatch kullanılır.
      }, expiresIn)
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.token !== ""
    }
  },
});

export default store;
