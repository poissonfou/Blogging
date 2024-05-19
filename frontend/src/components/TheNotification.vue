<template>
  <div
    class="notif-body"
    :id="notification.data.id"
    @click="notificationRedirect(notification.data.id)"
  >
    <div v-if="!notification.data.picture" class="no-pic">
      {{ notification.data.name[0] }}
    </div>
    <div v-else class="img">
      <img
        :src="'http://localhost:3000/images/' + notification.data.picture"
        alt="user picture"
      />
    </div>
    <span>{{
      notification.type == "follow"
        ? notification.data.name + " has followed you."
        : notification.data.name + " has a new post."
    }}</span>
  </div>
</template>

<script>
export default {
  props: ["notification"],
  methods: {
    notificationRedirect(id) {
      const typeOfNotification = this.$props.notification.type;
      if (typeOfNotification == "follow") {
        this.$router.push("/profile/" + id);
      } else {
        const postId = this.$props.notification.data.postId;
        const title = this.$props.notification.data.title;
        this.$router.push("/article/" + id + "/" + postId + "/" + title);
      }
    },
  },
  mounted() {
    const notification = document.getElementById(
      this.$props.notification.data.id
    );
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

.notif-body:hover {
  cursor: pointer;
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
