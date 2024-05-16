<template>
  <div>
    <div v-if="route == 'login'" class="auth-body">
      <h1>Login</h1>
      <div class="input-container">
        <img src="/images/login.png" alt="" />
        <!-- <a href="https://storyset.com/work">Work illustrations by Storyset</a> -->
        <the-form @submit="login">
          <div>
            <label for="email">Email</label>
            <input type="text" name="email" />
          </div>
          <div>
            <label for="password">Password</label>
            <input type="password" name="password" />
          </div>
          <button>Login</button>
        </the-form>
      </div>
    </div>
    <div v-else-if="route == 'signup'" class="auth-body signup">
      <h1>Signup</h1>
      <div class="input-container">
        <img src="/images/signup_auth.png" alt="signup illustration" />
        <!-- <a href="https://storyset.com/people">People illustrations by Storyset</a> -->
        <the-form @submit="signup">
          <div class="input-box">
            <label for="name">Name</label>
            <input type="text" name="name" />
          </div>
          <div>
            <label for="email">Email</label>
            <input type="text" name="email" />
          </div>
          <div>
            <label for="password">Password</label>
            <input type="password" name="password" />
          </div>
          <div>
            <label for="confirm">Confirm your password</label>
            <input type="password" name="confirm" />
          </div>
          <button>Signup</button>
        </the-form>
      </div>
    </div>
    <div v-else class="auth-body">
      <h1>Update</h1>
      <div class="input-container update">
        <img src="/images/update.png" alt="update illustration" />
        <!-- <a href="https://storyset.com/work">Work illustrations by Storyset</a> -->
        <the-form @submit="update">
          <div class="input-box">
            <label for="name">Name</label>
            <input type="text" name="name" />
          </div>
          <div class="input-box">
            <label for="password">Password</label>
            <input type="password" name="password" />
          </div>
          <div class="input-box">
            <label for="confirm">Confirm your password</label>
            <input type="password" name="confirm" />
          </div>
          <span>Leave empty those you don't wish to change.</span>
          <button>Update</button>
        </the-form>
      </div>
    </div>
  </div>
</template>

<script>
import TheForm from "../components/TheForm.vue";

export default {
  components: {
    TheForm,
  },
  methods: {
    async login(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const email = form.get("email");
      const password = form.get("password");

      const QUERY = {
        query: `
          {
             login(email: "${email}", password: "${password}"){
              token
              id
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

      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors[0].message);
      }

      localStorage.setItem(
        "user",
        JSON.stringify({ ...responseData.data.login })
      );

      this.$router.push({ path: "/dashboard" });
    },
    async signup(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const email = form.get("email");
      const password = form.get("password");
      const name = form.get("name");
      const confirm = form.get("confirm");

      const QUERY = {
        query: `
           mutation {
           signup(signupInput: {email: "${email}", name: "${name}", password: "${password}", confirm: "${confirm}" }){
              id
              token
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

      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors[0].message);
      }

      localStorage.setItem(
        "user",
        JSON.stringify({ ...responseData.data.signup })
      );

      this.$router.push({ path: "/welcome" });
    },
    async update(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const password = form.get("password").trim();
      const confirm = form.get("confirm").trim();
      const name = form.get("name").trim();
      const id = JSON.parse(localStorage.getItem("user")).id;

      if (!name.length && !password.length) return;

      if (password.length) {
        if (password !== confirm) {
          console.log("Passwords don't match");
          return;
        }

        if (password.length < 6) {
          console.log("Passwords needs to be at least six digits.");
          return;
        }
      }

      if (!id) {
        console.log("Invalid id. Please login again.");
        return;
      }

      const QUERY = {
        query: `
           mutation {
           update(name: "${name}", password: "${password}", confirm: "${confirm}", id:${id}){
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

      const responseData = await response.json();

      if (responseData.errors) {
        console.log(responseData.errors);
        return;
      }

      this.$router.push({ path: "/dashboard" });
    },
  },
  computed: {
    route() {
      return this.$route.query.mode;
    },
  },
};
</script>

<style scoped>
.auth-body {
  position: absolute;
  background-color: white;
  width: 50em;
  padding: 1em;
  padding-bottom: 5.45em;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  bottom: 0;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border: solid 3px black;
  border-bottom: none;
}

.auth-body img {
  width: 20em;
}

.auth-body h1 {
  font-family: "Pridi", serif;
  font-size: 3rem;
  margin: 0;
  margin-left: 0.5em;
}

.input-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.signup {
  padding-bottom: 2em;
}

.update span {
  font-size: 0.8em;
}
</style>
