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
      <nav class="logout">
        <span @click="logout"> Logout </span>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  props: ["user", "logout"],
  computed: {
    route() {
      return this.$route.path;
    },
  },
  methods: {
    async search(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const searchQuery = form.get("query");

      this.$router.push("/search?q=" + searchQuery.replaceAll(" ", "+"));
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

.logout span {
  font-family: "Zilla Slab", serif;
  margin-left: 1em;
  font-size: 1.5rem;
  color: white;
}

.logout span:hover {
  cursor: pointer;
}
</style>
