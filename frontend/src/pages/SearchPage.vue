<template>
  <div class="page-body">
    <the-popup :content="popupMessage"></the-popup>
    <div v-if="results.status == 'loading'">
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
    <div v-if="results.users.length">
      <div
        class="search-result"
        v-for="[index, result] in results.users.entries()"
        :key="index"
        @click="showProfile(result)"
      >
        <div class="result-info">
          <div v-if="!result.picture" class="no-pic">
            {{ result.name[0] }}
          </div>
          <div v-else class="img">
            <img
              :src="'http://localhost:3000/images/' + result.picture"
              alt="profile-picture"
            />
          </div>
          <div>
            <div class="identifiers">
              <h3>{{ result.name }}</h3>
              <span>{{ result.tag }}</span>
            </div>

            <span>{{ "Followers " + result.followers.length }}</span>
            <span>{{ "Following " + result.following.length }}</span>
          </div>
        </div>

        <div
          v-if="user.following.map((fol) => fol.id).indexOf(result.id) !== -1"
        >
          <button @click="unfollow($event, result.id)" class="button-unfollow">
            Unfollow
          </button>
        </div>
        <div v-else>
          <button @click="follow($event, result.id)" class="button-follow">
            Follow
          </button>
        </div>
      </div>
    </div>
    <div v-if="results.posts.length">
      <the-post-miniature
        v-for="[index, result] in results.posts.entries()"
        :key="index"
        @click="showArticle(result)"
        :post="result"
      >
      </the-post-miniature>
    </div>
    <div
      v-if="
        !results.users.length &&
        !results.posts.length &&
        results.status == 'done'
      "
      class="no-results"
    >
      <span class="material-symbols-outlined"> error </span>
      <h2>No results!</h2>
    </div>
  </div>
</template>

<script>
import ThePopup from "../components/ThePopup.vue";
import ThePostMiniature from "../components/ThePostMiniature.vue";

export default {
  data() {
    return {
      results: {
        users: [],
        posts: [],
        status: "loading",
      },
      popupMessage: {
        type: "",
        msg: "",
        data: null,
      },
    };
  },
  components: {
    ThePopup,
    ThePostMiniature,
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    async follow(event, id) {
      event.stopPropagation();
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
    async unfollow(event, id) {
      event.stopPropagation();
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

      const data = await response.json();

      if (data.errors) {
        this.$store.commit("pushNotification", {
          type: "error",
          data: data.errors[0].message,
        });
        return;
      }

      const idx = this.$store.state.user.following
        .map((fol) => fol.id)
        .indexOf(id);
      this.$store.commit("unfollow", idx);
    },
    async fetchSearch() {
      const searchQuery = this.$route.query.q;
      const userData = JSON.parse(localStorage.getItem("user"));

      const QUERY = {
        query: `
        {
	      search(query: "${searchQuery}", userId: ${userData?.id}){
          users {
            id
            name
            picture
            tag
            followers {
              name
            }
            following {
              name
            }
          }
          posts{
            id
            title
            abstract
            tags
            }
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
          msg: "Could not complete search. Please try again.",
          data: null,
        };
        return;
      }

      const responseData = await response.json();

      if (responseData.errors) {
        this.popupMessage = {
          type: "error",
          msg: "Could not complete search. Please try again.",
          data: null,
        };
        return;
      }

      this.results = { ...responseData.data.search, status: "done" };
    },
    showProfile(profile) {
      this.$router.push("/profile/" + profile.id);
    },
    showArticle(article) {
      this.$router.push("/article/" + article.id + "/" + article.title);
    },
  },
  mounted() {
    this.fetchSearch();
  },
};
</script>

<style scoped>
.page-body {
  background-color: white;
  border: solid 3px black;
  border-bottom: none;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  margin: 0em 5em;
  margin-top: 4em;
  height: 100%;
  padding: 0.5em 3em;
}

.search-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: solid 3px rgb(0, 0, 0);
  border-radius: 5px;
  padding: 0.5em;
  margin-bottom: 0.5em;
  font-family: "Zilla Slab", serif;
}

.search-result:hover {
  cursor: pointer;
}

.result-info {
  display: flex;
  align-items: center;
  gap: 1em;
}

.result-info h3 {
  margin: 0;
  font-size: 1.5rem;
}

.result-info span {
  margin-right: 0.3em;
}

.identifiers {
  display: flex;
  align-items: center;
}

.identifiers span {
  margin-left: 0.3em;
  color: rgb(39, 151, 77);
  font-size: 1.2rem;
}

.no-pic {
  background-color: rgb(46, 190, 94);
  width: fit-content;
  padding: 0.4em 0.8em;
  border-radius: 5em;
  font-size: 1.8rem;
  font-family: "Pridi", serif;
  color: white;
}

.img {
  background-color: rgb(46, 190, 94);
  padding: 0.3em;
  padding-bottom: 0em;
  border-radius: 100%;
  margin-top: 0.2em;
}

.img img {
  width: 5em;
  height: 5em;
  border-radius: 50%;
  margin-top: 0.1em;
}

.button-follow {
  border: solid 2px black;
  border-radius: 5px;
  background-color: rgb(53, 219, 109);
  font-size: 1.3rem;
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

@media (max-width: 700px) {
  .page-body {
    margin: 0em 1em;
    margin-top: 4em;
    padding: 0.5em 1em;
  }

  .button-follow {
    font-size: 1.1rem;
    padding: 0.3em 1.5em;
  }

  .button-unfollow {
    font-size: 1.1rem;
    padding: 0.3em 1em;
  }
}

@media (max-width: 500px) {
  .page-body {
    margin: 0em 0.5em;
    margin-top: 4em;
    padding: 0.5em;
  }

  .no-pic {
    padding: 0.4em 0.8em;
    border-radius: 5em;
    font-size: 1.2rem;
  }

  .result-info {
    gap: 0.5em;
  }

  .result-info h3 {
    font-size: 1.3rem;
  }

  .identifiers span {
    font-size: 1rem;
  }

  .button-follow {
    font-size: 0.9rem;
  }

  .button-unfollow {
    font-size: 0.9rem;
  }
}

.search-result button:hover {
  cursor: pointer;
}

.no-results {
  display: flex;
  align-items: center;
  font-family: "Pridi", serif;
  font-size: 1.5rem;
  justify-content: center;
  padding-top: 15%;
}

.no-results span {
  font-size: 3.5rem;
  color: red;
}

.spinner_z9k8 {
  transform-origin: center;
  animation: spinner_StKS 0.75s infinite linear;
}

svg {
  display: block;
  margin: auto;
  margin-top: 3em;
  margin-bottom: 3em;
}

@keyframes spinner_StKS {
  100% {
    transform: rotate(360deg);
  }
}
</style>
