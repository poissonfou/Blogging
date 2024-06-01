<template>
  <div class="user">
    <div class="user-picture-box">
      <span class="material-symbols-outlined" @click="showImageUI">
        add_a_photo
      </span>
      <div v-if="!user.picture" class="no-pic">{{ user.name[0] }}</div>
      <div v-else class="img">
        <img
          :src="'http://localhost:3000/images/' + user.picture"
          alt="user picture"
        />
      </div>
    </div>

    <h3>{{ user.name }}</h3>
    <span>{{ user.tag }}</span>
    <div class="follow-info">
      <span @click="showConnections('followers')">{{
        `Followers ${user.followers.length}`
      }}</span>
      <span @click="showConnections('following')">{{
        `Following ${user.following.length}`
      }}</span>
    </div>
    <div class="tabs">
      <span @click="changeTab('posts')">Posts</span>
      <span @click="changeTab('feed')">Feed</span>
    </div>
    <div class="link">
      <router-link to="/auth?mode='update'">Update info</router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: ["user", "changeTab", "showConnections", "showImageUI"],
};
</script>

<style scoped>
.user {
  background-color: white;
  border-radius: 5px;
  border: solid 2px black;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Pridi", serif;
}

.user-picture-box span {
  position: absolute;
  font-size: 2.5rem;
  left: 43%;
  top: 7%;
  color: white;
  opacity: 0;
}

.user-picture-box span:hover {
  opacity: 1;
  cursor: pointer;
}

.user .no-pic {
  background-color: rgb(46, 190, 94);
  width: fit-content;
  padding: 0.9rem 1em;
  border-radius: 5em;
  color: white;
  font-size: 1.5rem;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.img {
  background-color: rgb(46, 190, 94);
  padding: 0.3em;
  padding-bottom: 0em;
  border-radius: 100%;
  color: white;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.user h3 {
  margin: 0;
}

.img img {
  width: 5em;
  height: 5em;
  border-radius: 50%;
  margin-top: 0.1em;
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

.follow-info span:hover {
  cursor: pointer;
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
