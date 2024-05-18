<template>
  <div class="notif-body" :id="follower.id">
    <div v-if="!follower.picture" class="no-pic">{{ follower.name[0] }}</div>
    <div v-else class="img">
      <img
        :src="'http://localhost:3000/images/' + follower.picture"
        alt="user picture"
      />
    </div>
    <span>{{ follower.name + " has followed you." }}</span>
  </div>
</template>

<script>
export default {
  props: ["follower"],
  mounted() {
    const notification = document.getElementById(this.$props.follower.id);
    setTimeout(() => {
      notification.classList.add("popup");
    }, 100);

    setTimeout(() => {
      notification.classList.add("hidden");
    }, 5000);
  },
};
</script>

<style scoped>
.notif-body {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.2em 0.5em;
  border-radius: 5px;
  border: solid 2px black;
  width: fit-content;
  background-color: rgb(255, 255, 255);
  font-family: "Pridi", serif;
  font-size: 1rem;
  opacity: 1;
  transition: all 1s;
  margin-bottom: 0.2em;
  transform: translateY(3.8em);
}

.popup {
  transform: translateY(0em);
  transition: transform 1s;
}

.notif-body span {
  margin-left: 0.5em;
}

.no-pic {
  background-color: rgb(46, 190, 94);
  padding: 0.5rem 1em;
  border-radius: 5em;
  color: white;
  font-size: 1.2rem;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.img {
  background-color: rgb(46, 190, 94);
  padding: 0.2em;
  padding-bottom: 0em;
  border-radius: 100%;
  color: white;
  margin-top: 0.2em;
  height: 2.3em;
}

.img img {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  margin-top: 0.1em;
}

.hidden {
  opacity: 0;
  transition: opacity 1s;
}
</style>
