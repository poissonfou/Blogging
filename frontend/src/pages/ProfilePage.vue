<template>
  <main>
    <the-popup :content="popupMessage"></the-popup>
    <div class="profile-body">
      <div class="info">
        <div>
          <div v-if="!user.picture" class="no-pic">{{ user.name[0] }}</div>
          <div v-else class="img">
            <img
              :src="'http://localhost:3000/images/' + user.picture"
              alt="user picture"
            />
          </div>
          <div class="text-box">
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
        <the-post-miniature
          v-for="[index, post] in user.posts.entries()"
          :key="index"
          :post="post"
          @click="showPost(post.id)"
        ></the-post-miniature>
      </div>
    </div>
  </main>
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
              unfollow(id: ${id}, token: "${token}")"{
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
  },
};
</script>

<style scoped>
main {
  height: 100%;
}

.profile-body {
  background-color: white;
  border: solid 3px black;
  border-bottom: none;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  margin: 0em 5em;
  margin-top: 2em;
  height: 100%;
  padding: 0.5em 3em;
}

.text-box {
  margin-left: 2em;
}

.info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info div:first-child {
  display: flex;
}

.user-identifiers {
  display: flex;
  align-items: center;
}

.user-identifiers span {
  margin-left: 0.5em;
  font-family: "Zilla Slab", serif;
  font-size: 1.5rem;
  color: rgb(53, 219, 109);
}

.info h1 {
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
  padding: 0.5rem 0.8em;
  border-radius: 5em;
  color: white;
  font-size: 3rem;
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
  font-size: 1.3rem;
  padding: 0.3em 1em;
  font-family: "Zilla Slab", serif;
  box-shadow: 2px 2px 0px black;
}

.button-follow:hover,
.button-unfollow:hover {
  cursor: pointer;
}

.posts {
  margin-top: 3em;
  padding: 0em 1em;
  padding-top: 0.5em;
  text-align: start;
  height: 22em;
  overflow-y: scroll;
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
</style>
