<template>
  <div class="page-body">
    <div
      class="search-result"
      v-for="[index, result] in results.entries()"
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

      <div v-if="user.following.map((fol) => fol.id).indexOf(result.id) !== -1">
        <button @click="unfollow(result.id)" class="button-unfollow">
          Unfollow
        </button>
      </div>
      <div v-else>
        <button @click="follow(result.id)" class="button-follow">Follow</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      results: [],
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    async follow(id) {
      const userId = JSON.parse(localStorage.getItem("user")).id;

      const QUERY = {
        query: `
            mutation{
              follow(id: ${id}, userId: ${userId}){
                name
                id
                picture
                tag
              }
            }
            `,
      };

      const response = await fetch("http://localhost:3000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(QUERY),
      });

      if (!response.ok) {
        console.log("something went wrong", response);
        return;
      }

      const data = await response.json();

      console.log(data);

      this.$store.commit("follow", data.data.follow);
    },
    async unfollow(id) {
      const userId = JSON.parse(localStorage.getItem("user")).id;

      const QUERY = {
        query: `
            mutation{
              unfollow(id: ${id}, userId: ${userId}){
                message
              }
            }
            `,
      };

      const response = await fetch("http://localhost:3000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(QUERY),
      });

      if (!response.ok) {
        console.log("something went wrong", response);
        return;
      }

      const idx = this.$store.state.user.following
        .map((fol) => fol.id)
        .indexOf(id);
      this.$store.commit("unfollow", idx);
    },
    async fetchSearch() {
      const searchQuery = this.$route.query.q;

      const QUERY = {
        query: `
        {
	      search(query: "${searchQuery}"){
          id,
          picture
          name,
          tag,
          followers,
          following,
          posts{
            id,
            title,
            abstract,
            tags
            }
          }
        }
        `,
      };

      const response = await fetch("http://localhost:3000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(QUERY),
      });

      if (!response.ok) {
        console.log("something went wrong :(", response);
        return;
      }

      const responseData = await response.json();

      this.results = responseData.data.search;

      console.log(responseData);
    },
    showProfile(profile) {
      this.$router.push("/profile/" + profile.id);
    },
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
  gap: 2em;
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
  padding: 0.5em 1em;
  border-radius: 5em;
  font-size: 1.8rem;
  font-family: "Pridi", serif;
}

.img {
  background-color: rgb(46, 190, 94);
  padding: 0.3em;
  padding-bottom: 0em;
  border-radius: 100%;
  color: white;
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

.search-result button:hover {
  cursor: pointer;
}
</style>
