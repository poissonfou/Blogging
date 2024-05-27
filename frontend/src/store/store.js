import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

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
      notifications: [],
      pendingUpdates: [],
    };
  },
  mutations,
});

export default store;
