import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import getters from "./getters.js";
import mutations from "./mutations.js";

let store = createStore({
  plugins: [createPersistedState({ storage: window.sessionStorage })],
  state() {
    return {
      user: {
        id: null,
        name: "",
        picture: "",
        posts: [],
        followers: [],
        following: [],
      },
    };
  },
  mutations,
  getters,
});

export default store;
