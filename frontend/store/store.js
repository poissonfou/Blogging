import { createStore } from "vuex";
import getters from "./getters.js";
import mutations from "./mutations.js";

let store = createStore({
  state() {
    return {
      search: [],
      user: { name: "", picture: "", posts: [], followers: [], following: [] },
    };
  },
  mutations,
  getters,
});

export default store;
