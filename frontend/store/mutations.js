export default {
  setUser(state, payload) {
    state.user = payload;
  },
  follow(state, payload) {
    state.user.following.push(payload);
  },
  unfollow(state, payload) {
    state.user.following.splice(payload, 1);
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
  pushNotification(state, payload) {
    state.notifications.push(payload);
  },
  resetNotifications(state) {
    state.notifications = [];
  },
  pushPendingUpdate(state, payload) {
    state.pendingUpdates.push(payload);
  },
};
