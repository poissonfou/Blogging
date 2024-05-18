<template>
  <div>
    <div
      v-for="[index, result] in results.entries()"
      :key="index"
      class="search-result"
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

      <div v-if="user.following.includes(String(result.id))">
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
  props: ["results", "user"],
  methods: {
    async follow(id) {
      const userId = JSON.parse(localStorage.getItem("user")).id;

      const QUERY = {
        query: `
            mutation{
              follow(id: ${id}, userId: ${userId}){
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

      this.$props.user.following.push(String(id));
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

      const idx = this.$props.user.following.indexOf(id);
      this.$props.user.following.splice(idx, 1);
    },
  },
};
</script>

<style scoped>
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
  background-color: rgb(46, 190, 94);
  color: black;
  font-family: "Pridi", serif;
  border: solid 2px black;
  border-radius: 5px;
  height: 2em;
  padding: 0em 1em;
  font-size: 1.3rem;
}

.button-unfollow {
  color: rgb(0, 0, 0);
  font-family: "Pridi", serif;
  border: solid 2px rgb(0, 0, 0);
  border-radius: 5px;
  height: 2em;
  padding: 0em 1em;
  font-size: 1.3rem;
}

.search-result button:hover {
  cursor: pointer;
}
</style>
