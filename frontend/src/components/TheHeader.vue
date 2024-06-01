<template>
  <header>
    <router-link :to="user ? '/dashboard' : '/'">
      <h1 v-if="!adjustDisplay">Blogging</h1>
      <h1 v-else class="collapsed-logo">B.</h1>
    </router-link>

    <nav v-if="!user" class="nav-loged-off">
      <router-link to="/auth?mode=login">Login</router-link>
      <router-link to="/auth?mode=signup">Signup</router-link>
    </nav>

    <div v-else class="nav-loged-in">
      <form @submit="search">
        <label for="query"></label>
        <input type="text" name="query" placeholder="search" />
      </form>
      <nav>
        <span @click="logout" v-if="!adjustDisplay" class="logout">
          Logout
        </span>
        <span
          class="material-symbols-outlined logout-icon"
          @click="logout"
          v-else
        >
          logout
        </span>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  props: ["user", "logout"],
  data() {
    return {
      adjustDisplay: false,
    };
  },
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
  mounted() {
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

.collapsed-logo {
  font-size: 2.5rem;
}

.collapsed-logo span {
  font-size: 1.8rem;
}

h1 {
  font-family: "Pridi", serif;
  color: white;
  margin: 0.2em 0em;
}

a {
  text-decoration: none;
}

.nav-loged-in {
  display: flex;
  align-items: center;
}

.nav-loged-in nav {
  padding-top: 0.3em;
}

.nav-loged-off a {
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

.logout {
  font-family: "Zilla Slab", serif;
  margin-left: 1em;
  font-size: 1.5rem;
  color: white;
}

.logout:hover {
  cursor: pointer;
}

.logout-icon {
  color: white;
  font-size: 2rem;
  margin-left: 0.3em;
}

.logout-icon:hover {
  cursor: pointer;
}

@media (max-width: 500px) {
  .nav-loged-off a {
    margin-right: 1em;
    font-size: 1.3rem;
  }
}
</style>
