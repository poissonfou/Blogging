<template>
  <div id="wrapper">
    <the-header :user="user" :logout="logout"></the-header>
    <main>
      <router-view></router-view>
    </main>
    <div class="notifications">
      <the-notification
        v-for="notif in notifications"
        :key="notif.data.id"
        :notification="notif"
      ></the-notification>
    </div>
  </div>
</template>

<script>
import TheHeader from "./components/TheHeader.vue";
import TheNotification from "./components/TheNotification.vue";

import openSocket from "socket.io-client";

export default {
  name: "App",
  components: { TheHeader, TheNotification },
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")),
    };
  },
  computed: {
    route() {
      return this.$route;
    },
    notifications() {
      return this.$store.state.notifications;
    },
  },
  watch: {
    route() {
      if (this.$store.state.pendingUpdates.length) {
        this.$store.state.pendingUpdates.forEach((update) => {
          this.$store.commit(update.action, update.data);
        });
        this.$store.state.pendingUpdates = [];
      }
      if (this.$route.path == "/dashboard") {
        this.user = JSON.parse(localStorage.getItem("user")).id;
      }
    },
  },
  methods: {
    logout() {
      localStorage.setItem("user", JSON.stringify(null));
      this.user = null;
      sessionStorage.clear();
      this.$router.push("/");
    },
  },
  mounted() {
    let socket;

    try {
      socket = openSocket("http://localhost:3000", {
        transports: ["websocket", "polling", "flashsocket"],
      });
    } catch (e) {
      this.error = "Couldn't connect to server. Please reload";
      return;
    }

    socket.on("follow", (data) => {
      if (data.following !== this.user.tag) return;
      if (data.action == "follow") {
        this.$store.commit("pushNotification", {
          data: data.follower,
          type: "follow",
        });
      }
    });

    socket.on("post", (data) => {
      if (!this.$store.state.user.following.includes(String(data.user.id)))
        return;
      if (data.action == "post") {
        this.$store.commit("pushNotification", {
          data: data.user,
          type: "post",
        });
      }
    });

    setInterval(() => {
      if (this.$store.state.notifications.length) {
        this.$store.commit("resetNotifications");
      }
    }, 15000);
  },
};
</script>

<style>
html {
  height: 100%;
}

body {
  margin: 0;
  font-family: "Poppins", sans-serif;
  background-color: rgb(53, 219, 109);
  height: 100%;
}

body::-webkit-scrollbar {
  display: block;
}

body::-webkit-scrollbar-track {
  background-color: transparent;
}

body::-webkit-scrollbar-thumb {
  background: rgb(15, 15, 15);
  border-radius: 10px;
  border: solid rgb(53, 219, 109) 3px;
}

#app {
  height: 100%;
}

#wrapper {
  display: flex;
  flex-flow: column;
  height: 100%;
}

main {
  flex: 1 1 auto;
}

.notifications {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  right: 0.1em;
  bottom: 0.1em;
  width: fit-content;
  overflow: hidden;
  background-color: aqua;
}
</style>
