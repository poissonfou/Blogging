<template>
  <div id="wrapper">
    <the-popup :content="popupMessage"></the-popup>
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
import ThePopup from "./components/ThePopup.vue";

import openSocket from "socket.io-client";

export default {
  name: "App",
  components: { TheHeader, TheNotification, ThePopup },
  data() {
    return {
      authTimeout: null,
      popupMessage: {
        type: "",
        msg: null,
        data: null,
      },
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
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
    },
    user() {
      if (JSON.parse(localStorage.getItem("user")) && !this.authTimeout) {
        this.authTimeout = setTimeout(() => {
          this.popupMessage = {
            type: "error",
            msg: "Your session has expired. Please login again.",
            data: null,
          };

          setTimeout(() => {
            this.popupMessage = {
              type: "",
              msg: null,
              data: null,
            };
            this.$store.commit("setUser", {
              id: null,
              name: "",
              picture: "",
              posts: [],
              followers: [],
              following: [],
            });
            localStorage.setItem("user", null);
            this.$router.push("/home");
          }, 3000);
        }, 2.88e7);
      }
    },
  },
  methods: {
    logout() {
      localStorage.setItem("user", JSON.stringify(null));
      this.$store.commit("setUser", {
        id: null,
        name: "",
        picture: "",
        posts: [],
        followers: [],
        following: [],
      });
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
  background-color: #35db6d;
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
  border: solid #35db6d 3px;
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
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  right: 0.1em;
  bottom: 0.1em;
  width: fit-content;
  overflow: hidden;
}

@media (max-width: 750px) {
  .notifications {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
