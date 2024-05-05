<template>
  <header>
    <router-link to="/">
      <h1>Blogging</h1>
    </router-link>

    <nav v-if="route !== '/dashboard'">
      <router-link to="/auth?mode=login">Login</router-link>
      <router-link to="/auth?mode=signup">Signup</router-link>
    </nav>

    <div v-else>
      <form>
        <input type="text" placeholder="search" />
      </form>
    </div>
  </header>
</template>

<script>
export default {
  computed: {
    route() {
      return this.$route.path;
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
