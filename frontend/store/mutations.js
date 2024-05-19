export default {
  setSearch(state, payload) {
    state.search = payload;
  },
  setUser(state, payload) {
    state.user = payload;
  },
  follow(state, payload) {
    state.user.following.push(payload);
  },
  unfollow(state, payload) {
    state.user.following.splice(payload, 1);
  },
  followed(state, payload) {
    state.user.followers.push(payload);
  },
  addPost(state, payload) {
    state.user.posts.push(payload);
  },
  editPost(state, payload) {
    state.user.posts[payload.idx] = payload.post;
  },
  deletePost(state, payload) {
    state.user.posts.splice(payload, 1);
  },
};
