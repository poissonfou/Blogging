<template>
  <header>
    <router-link :to="user ? '/dashboard' : '/'">
      <h1>Blogging</h1>
    </router-link>

    <nav v-if="!user">
      <router-link to="/auth?mode=login">Login</router-link>
      <router-link to="/auth?mode=signup">Signup</router-link>
    </nav>

    <div v-else>
      <form @submit="search">
        <label for="query"></label>
        <input type="text" name="query" placeholder="search" />
      </form>
      <nav>
        <router-link to="/" @click="logout"> Logout </router-link>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  computed: {
    route() {
      return this.$route.path;
    },
    user() {
      return localStorage.getItem("user") &&
        localStorage.getItem("user") !== "null"
        ? JSON.parse(localStorage.getItem("user")).id
        : null;
    },
  },
  methods: {
    async search(event) {
      console.log("ehre");
      event.preventDefault();
      const form = new FormData(event.target);
      const searchQuery = form.get("query");

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

      this.$store.commit("setSearch", responseData.data.search);

      console.log(responseData);
    },
    logout() {
      localStorage.setItem("user", null);
    },
  },
};
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  background-color: rgb(53, 219, 109);
  align-items: center;
  padding: 0em 1em;
}

header div {
  display: flex;
}

header div a {
  margin: 0;
  margin-left: 0.5em;
}

h1 {
  font-family: "Pridi", serif;
  color: white;
  margin: 0.2em 0em;
}

a {
  text-decoration: none;
}

nav a {
  font-family: "Zilla Slab", serif;
  margin-right: 2em;
  font-size: 1.5rem;
  color: white;
}

input {
  border: solid 2px black;
  font-size: 1.3rem;
  border-radius: 5px;
  width: 10em;
  font-family: "Zilla Slab", serif;
}
</style>
