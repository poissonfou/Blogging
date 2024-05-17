import { createStore } from "vuex";
import getters from "./getters.js";

let store = createStore({
  state() {
    return {
      search: [],
    };
  },
  mutations: {
    setSearch(state, payload) {
      console.log("heree");
      state.search = payload;
    },
  },
  getters,
});

export default store;
