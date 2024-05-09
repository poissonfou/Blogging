<template>
  <div class="user">
    <div v-if="!user.picture">{{ user.name[0] }}</div>
    <div v-else>
      <img :src="user.picture" alt="user picture" />
    </div>
    <h3>{{ user.name }}</h3>
    <div class="follow-info">
      <span>0 Followers</span>
      <span>0 Following</span>
    </div>
    <div class="tabs">
      <span @click="changeTab('posts')">Posts</span>
      <span>Feed</span>
    </div>
    <div class="link">
      <router-link to="/auth?mode='update'">Update info</router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: ["user", "changeTab"],
};
</script>

<style scoped>
.user {
  background-color: white;
  border-radius: 5px;
  border: solid 2px black;
}

.user {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Pridi", serif;
}

.user div:first-child {
  background-color: rgb(46, 190, 94);
  width: fit-content;
  padding: 0.7rem 1em;
  border-radius: 5em;
  color: white;
  font-size: 1.5rem;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.user h3 {
  margin: 0;
}

.link {
  width: 100%;
  text-align: right;
}

.link a {
  text-decoration: none;
  padding-right: 0.5em;
  font-size: 0.8rem;
  color: gray;
}

.follow-info span,
.tabs span {
  margin-right: 0.5em;
}

.tabs {
  font-weight: bold;
  font-size: 1.1rem;
  color: rgb(53, 219, 109);
}

.tabs span:hover {
  cursor: pointer;
}
</style>
