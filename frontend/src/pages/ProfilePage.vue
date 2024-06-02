<template>
  <div class="profile-body">
    <the-popup :content="popupMessage"></the-popup>
    <div v-if="!user.id">
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
          opacity=".25"
          fill="#FFFFFF"
        />
        <path
          d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
          class="spinner_z9k8"
          fill="#2ebe5e"
        />
      </svg>
    </div>
    <div v-else>
      <div class="profile-header">
        <div class="info">
          <div v-if="!user.picture" class="no-pic">{{ user.name[0] }}</div>
          <div v-else class="img">
            <img
              :src="'http://localhost:3000/images/' + user.picture"
              alt="user picture"
            />
          </div>
          <div>
            <div class="user-identifiers">
              <h1>{{ user.name }}</h1>
              <span>{{ user.tag }}</span>
            </div>
            <div class="account-metrics">
              <span>{{ "Followers " + user.followers.length }}</span>
              <span>{{ "Following " + user.following.length }}</span>
            </div>
          </div>
        </div>

        <div v-if="!adjustDisplay">
          <div
            v-if="
              loggedUser.following.map((fol) => fol.id).indexOf(user.id) !== -1
            "
          >
            <button @click="unfollow(user.id)" class="button-unfollow">
              Unfollow
            </button>
          </div>
          <div v-else>
            <button @click="follow(user.id)" class="button-follow">
              Follow
            </button>
          </div>
        </div>
      </div>
      <div v-if="adjustDisplay" class="btn-adjusted">
        <div
          v-if="
            loggedUser.following.map((fol) => fol.id).indexOf(user.id) !== -1
          "
        >
          <button @click="unfollow(user.id)" class="button-unfollow">
            Unfollow
          </button>
        </div>
        <div v-else>
          <button @click="follow(user.id)" class="button-follow">Follow</button>
        </div>
      </div>
      <div class="posts">
        <div v-if="user.posts.length">
          <the-post-miniature
            v-for="[index, post] in user.posts.entries()"
            :key="index"
            :post="post"
            @click="showPost(post.id)"
          ></the-post-miniature>
        </div>
        <div v-else class="no-posts">
          <h2>No posts.</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ThePopup from "../components/ThePopup.vue";
import ThePostMiniature from "../components/ThePostMiniature.vue";

export default {
  components: {
    ThePostMiniature,
    ThePopup,
  },
  data() {
    return {
      user: {
        id: null,
        name: "",
        picture: "",
        posts: [],
        followers: [],
        following: [],
      },
      tagsUserArticles: [],
      adjustDisplay: false,
      filteredPosts: [],
      popupMessage: { type: "", msg: null, data: null },
    };
  },
  computed: {
    loggedUser() {
      return this.$store.state.user;
    },
  },
  methods: {
    async fetchUser() {
      const id = this.$route.params.id;
      const route = this.$route.path;
      const QUERY = {
        query: `
          {
             getUser(id: ${id}, token: "", route: "${route}" ){
              id
              name
              picture
              posts {
                title
                tags
                abstract
                body
                images
                id
                createdAt
                updatedAt
              }
              followers {
                id
                name
                picture
                tag
              }
              following {
                id
                name
                picture
                tag
              }
              tag
             }
          }
        `,
      };
      let response;
      try {
        response = await fetch("http://localhost:3000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(QUERY),
        });
      } catch (e) {
        this.popupMessage = {
          type: "error",
          msg: "Could not get profile. Please try again.",
          data: null,
        };
        return;
      }
      const data = await response.json();
      if (data.errors) {
        this.popupMessage = {
          type: "error",
          msg: data.errors[0].message,
          data: null,
        };
        return;
      }
      const user = data.data.getUser;
      console.log(user);
      const posts = user.posts;
      const tags = new Set([]);
      for (let i = 0; i < posts.length; i++) {
        tags.add(...posts[i].tags);
      }
      this.tagsUserArticles = [...tags];
      this.user = user;
    },
    async follow(id) {
      const { token } = JSON.parse(localStorage.getItem("user"));

      const QUERY = {
        query: `
            mutation{
              follow(id: ${id}, token: "${token}"){
                name
                id
                picture
                tag
              }
            }
            `,
      };

      let response;

      try {
        response = await fetch("http://localhost:3000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(QUERY),
        });
      } catch (e) {
        this.$store.commit("pushNotification", {
          type: "error",
          data: "Could not save follow. Please try again.",
        });
        return;
      }

      const data = await response.json();

      if (data.errors) {
        this.$store.commit("pushNotification", {
          type: "error",
          data: data.errors[0].message,
        });
        return;
      }

      this.$store.commit("follow", data.data.follow);
    },
    async unfollow(id) {
      const { token } = JSON.parse(localStorage.getItem("user"));

      const QUERY = {
        query: `
            mutation{
              unfollow(id: ${id}, token: "${token}"){
                message
              }
            }
            `,
      };

      let response;

      try {
        response = await fetch("http://localhost:3000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(QUERY),
        });
      } catch (e) {
        this.$store.commit("pushNotification", {
          type: "error",
          data: "Could not save unfollow. Please try again.",
        });
        return;
      }

      const responseData = await response.json();

      if (responseData.errors) {
        this.$store.commit("pushNotification", {
          type: "error",
          data: responseData.errors[0].message,
        });
        return;
      }

      const idx = this.$store.state.user.following
        .map((fol) => fol.id)
        .indexOf(id);
      this.$store.commit("unfollow", idx);
    },
    async showPost(id) {
      const postIdx = this.user.posts.map((p) => p.id).indexOf(id);
      const post = this.user.posts[postIdx];
      this.$router.push("/article/" + id + "/" + post.title);
    },
  },
  mounted() {
    this.fetchUser();
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 650 && !this.adjustDisplay) {
        this.adjustDisplay = true;
      }
      if (window.innerWidth > 650 && this.adjustDisplay) {
        this.adjustDisplay = false;
      }
    });

    if (window.innerWidth <= 650 && !this.adjustDisplay) {
      this.adjustDisplay = true;
    }
    if (window.innerWidth > 650 && this.adjustDisplay) {
      this.adjustDisplay = false;
    }
  },
};
</script>

<style scoped>
.profile-body {
  background-color: white;
  border: solid 3px black;
  border-bottom: none;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  height: 100vh;
  margin: 0em 5em;
  margin-top: 2em;
  padding: 0.5em 3em;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info {
  display: flex;
  gap: 2em;
}

.user-identifiers {
  display: flex;
  align-items: center;
}

.user-identifiers span {
  font-family: "Zilla Slab", serif;
  margin-left: 0.5em;
  font-size: 1.5rem;
  color: rgb(53, 219, 109);
}

.profile-header h1 {
  font-family: "Pridi", serif;
  font-size: 3rem;
  margin: 0;
}

.account-metrics span {
  margin-right: 0.5em;
  font-family: "Zilla Slab", serif;
  font-size: 1.2rem;
}

.no-pic {
  background-color: rgb(46, 190, 94);
  width: fit-content;
  padding: 1rem 0.8em;
  border-radius: 5em;
  color: white;
  font-size: 2.5rem;
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

.img img {
  width: 7em;
  height: 7em;
  border-radius: 50%;
  margin-top: 0.1em;
}

.button-follow {
  border: solid 2px black;
  border-radius: 5px;
  background-color: rgb(53, 219, 109);
  font-size: 1.5rem;
  padding: 0.3em 1.5em;
  font-family: "Zilla Slab", serif;
  box-shadow: 2px 2px 0px black;
}

.button-unfollow {
  border: solid 2px black;
  border-radius: 5px;
  background-color: rgb(53, 219, 109);
  font-size: 1.5rem;
  padding: 0.3em 1em;
  font-family: "Zilla Slab", serif;
  box-shadow: 2px 2px 0px black;
}

.button-follow:hover,
.button-unfollow:hover {
  cursor: pointer;
}

.btn-adjusted {
  display: flex;
  margin-top: 1em;
}

.btn-adjusted button {
  box-shadow: none;
}

@media (max-width: 1000px) {
  .profile-body {
    margin: 0em 2em;
    margin-top: 2em;
  }

  .profile-header h1 {
    font-size: 2.5rem;
  }

  .no-pic {
    padding: 0.7em 1.1em;
    font-size: 1.7rem;
  }

  .img img {
    width: 6em;
    height: 6em;
  }

  .button-follow {
    font-size: 1.3rem;
    padding: 0.3em 1.3em;
  }

  .button-unfollow {
    font-size: 1.3rem;
    padding: 0.3em 1.2em;
  }
}

@media (max-width: 800px) {
  .profile-body {
    margin: 0em 1em;
    margin-top: 2em;
    padding: 1em 1em;
  }

  .profile-header h1 {
    font-size: 2.2rem;
  }

  .info {
    gap: 1.5em;
  }

  .user-identifiers span {
    font-size: 1.2rem;
  }

  .account-metrics span {
    font-size: 1rem;
  }

  .no-pic {
    padding: 0.7em 1.2em;
    font-size: 1.5rem;
  }

  .img img {
    width: 5.5em;
    height: 5.5em;
  }
}

@media (max-width: 650px) {
  .profile-body {
    padding: 1em 0.5em;
  }

  .profile-header h1 {
    font-size: 1.8rem;
  }

  .info {
    gap: 1em;
  }

  .user-identifiers span {
    font-size: 1rem;
  }

  .no-pic {
    padding: 0.8em 1.2em;
    font-size: 1.5rem;
  }

  .img img {
    width: 4.5em;
    height: 4.5em;
  }

  .button-follow {
    font-size: 1.2rem;
    padding: 0.3em 1.3em;
  }

  .button-unfollow {
    font-size: 1.2rem;
    padding: 0.3em 1.2em;
  }
}

@media (max-width: 500px) {
  .user-identifiers {
    flex-direction: row;
    align-items: center;
  }

  .img {
    padding: 0.3em;
    padding-bottom: 0em;
    height: 4.8em;
  }
}

.posts {
  margin-top: 3em;
  padding: 0em 1em;
  padding-top: 0.5em;
  text-align: start;
  overflow-y: auto;
  overflow-x: hidden;
}

.posts::-webkit-scrollbar {
  display: block;
}

.posts::-webkit-scrollbar-track {
  background-color: transparent;
}

.posts::-webkit-scrollbar-thumb {
  background: rgb(15, 15, 15);
  border-radius: 10px;
  border: solid white 3px;
}

.no-posts {
  text-align: center;
}

.no-posts h2 {
  margin: auto;
  margin-top: 1rem;
  font-family: "Pridi", serif;
  font-size: 2rem;
}

.spinner_z9k8 {
  transform-origin: center;
  animation: spinner_StKS 0.75s infinite linear;
}

svg {
  display: block;
  margin: auto;
  margin-top: 30%;
}

@keyframes spinner_StKS {
  100% {
    transform: rotate(360deg);
  }
}
</style>
