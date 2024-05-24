export default {
  setUser(state, payload) {
    state.user = payload;
  },
  follow(state, payload) {
    if (payload.idx) {
      state.user.following.splice(payload.idx, 0, payload.data);
    } else {
      state.user.following.push(payload.data);
    }
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
