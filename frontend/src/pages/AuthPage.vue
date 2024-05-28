<template>
  <div>
    <the-popup :content="popupMessage"></the-popup>
    <div v-if="route == 'login'" class="auth-body">
      <div class="header">
        <h1>Login</h1>
        <span v-if="errorMsg.msg" class="error-msg">{{ errorMsg.msg }}</span>
      </div>
      <div class="input-container">
        <img src="/images/login.png" alt="" />
        <!-- <a href="https://storyset.com/work">Work illustrations by Storyset</a> -->
        <the-form @submit="login">
          <div>
            <label for="email">Email</label>
            <input
              type="text"
              name="email"
              v-model.trim="email"
              @blur="validate('email')"
              :class="errorMsg.field == 'email' ? 'error' : ''"
            />
          </div>
          <div>
            <label for="password">Password</label>
            <input
              type="password"
              name="password"
              v-model.trim="password"
              @blur="validate('password')"
              :class="errorMsg.field == 'password' ? 'error' : ''"
            />
          </div>
          <button>Login</button>
        </the-form>
      </div>
    </div>
    <div v-else-if="route == 'signup'" class="auth-body signup">
      <div class="header">
        <h1>Signup</h1>
        <span v-if="errorMsg.msg" class="error-msg">{{ errorMsg.msg }}</span>
      </div>

      <div class="input-container">
        <img src="/images/signup_auth.png" alt="signup illustration" />
        <!-- <a href="https://storyset.com/people">People illustrations by Storyset</a> -->
        <the-form @submit="signup">
          <div class="input-box">
            <label for="name">Name</label>
            <input
              type="text"
              name="name"
              v-model="name"
              @blur="validate('name')"
              :class="errorMsg.field == 'name' ? 'error' : ''"
            />
          </div>
          <div>
            <label for="email">Email</label>
            <input
              type="text"
              name="email"
              v-model.trim="email"
              @blur="validate('email')"
              :class="errorMsg.field == 'email' ? 'error' : ''"
            />
          </div>
          <div>
            <label for="password">Password</label>
            <input
              type="password"
              name="password"
              v-model.trim="password"
              @blur="validate('password')"
              :class="errorMsg.field == 'password' ? 'error' : ''"
            />
          </div>
          <div>
            <label for="confirm">Confirm your password</label>
            <input
              type="password"
              name="confirm"
              v-model.trim="confirm"
              @blur="validate('confirm')"
              :class="errorMsg.field == 'confirm' ? 'error' : ''"
            />
          </div>
          <button>Signup</button>
        </the-form>
      </div>
    </div>
    <div v-else class="auth-body">
      <div class="header">
        <h1>Update</h1>
        <span v-if="errorMsg.msg" class="error-msg">{{ errorMsg.msg }}</span>
      </div>
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
import ThePopup from "../components/ThePopup.vue";

export default {
  components: {
    TheForm,
    ThePopup,
  },
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirm: "",
      errorMsg: { field: "", msg: null },
      popupMessage: { type: "", msg: "", data: null },
    };
  },
  computed: {
    route() {
      return this.$route.query.mode;
    },
  },
  methods: {
    validate(field) {
      if (field == "name") {
        if (!this.name.length) {
          this.errorMsg = { field, msg: "Please enter your name." };
          return;
        }
      }

      if (field == "email") {
        if (!this.email.length || !this.email.includes("@")) {
          this.errorMsg = { field, msg: "Please enter a valid email." };
          return;
        }
      }

      if (field == "password") {
        if (!this.password.length) {
          this.errorMsg = { field, msg: "Please enter a password." };
          return;
        }

        if (this.password.length <= 5) {
          this.errorMsg = {
            field,
            msg: "Password must be longer than five digits.",
          };
          return;
        }

        if (this.confirm.length) {
          if (this.password !== this.confirm) {
            this.errorMsg = {
              field,
              msg: "Password must be longer than five digits.",
            };
            return;
          }
        }
      }

      if (field == "confirm") {
        if (!this.confirm.length) {
          this.errorMsg = { field, msg: "Please confirm your password." };
          return;
        }

        if (this.confirm.length <= 5) {
          this.errorMsg = {
            field,
            msg: "Password must be longer than five digits.",
          };
          return;
        }

        if (this.password !== this.confirm) {
          this.errorMsg = {
            field,
            msg: "Passwords must match.",
          };
          return;
        }
      }

      if (this.errorMsg.msg) this.errorMsg = { field: "", msg: null };
    },
    async login(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const email = form.get("email").trim();
      const password = form.get("password").trim();

      if (!password.length) {
        this.errorMsg = {
          field: "password",
          msg: "Please enter your password",
        };
        return;
      }

      if (!email.length) {
        this.errorMsg = {
          field: "email",
          msg: "Please enter your email",
        };
        return;
      }

      if (!email.includes("@")) {
        this.errorMsg = {
          field: "email",
          msg: "Please enter a valid email",
        };
        return;
      }

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
          msg: "Failed to contact server. Please try again.",
          data: null,
        };
        return;
      }

      const responseData = await response.json();

      if (responseData.errors) {
        this.errorMsg = {
          field: "",
          msg: responseData.errors[0].message,
        };
        return;
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
      const email = form.get("email").trim();
      const password = form.get("password").trim();
      const name = form.get("name");
      const checkIfEmpty = name.trim();
      const confirm = form.get("confirm").trim();

      this.errorMsg = { field: "", msg: null };

      if (!name.length || !checkIfEmpty.length) {
        this.errorMsg = { field: "name", msg: "Please enter your name." };
        return;
      }

      if (!email.length || !email.includes("@")) {
        this.errorMsg = { field: "email", msg: "Please enter a valid email." };
        return;
      }

      if (password.length <= 5) {
        this.errorMsg = {
          field: "password",
          msg: "Password needs to be longer than five digits.",
        };
        return;
      }

      if (password !== confirm) {
        this.errorMsg = { field: "password", msg: "Passwords must match." };
        return;
      }

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
          msg: "Failed to contact server. Please try again.",
          data: null,
        };
        return;
      }

      const responseData = await response.json();

      if (responseData.errors) {
        this.errorMsg = { field: "", msg: responseData.errors[0].message };
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({ ...responseData.data.signup, tag: "" })
      );

      this.$router.push({ path: "/welcome" });
    },
    async update(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const password = form.get("password").trim();
      const confirm = form.get("confirm").trim();
      const name = form.get("name");
      const checkIfEmpty = name.trim();
      const { token } = JSON.parse(localStorage.getItem("user"));

      if (name.length && !checkIfEmpty.length) {
        this.errorMsg = {
          field: "",
          msg: "Please provide a valid name.",
        };
        return;
      }

      if (!name.length && !password.length) {
        this.errorMsg = {
          field: "",
          msg: "You must provide at least one update value.",
        };
        return;
      }

      if (password.length) {
        if (password !== confirm) {
          this.errorMsg = {
            field: "password",
            msg: "Passwords must match.",
          };
          return;
        }

        if (password.length < 6) {
          this.errorMsg = {
            field: "password",
            msg: "Password needs to be at least six digits.",
          };
          return;
        }
      }

      const QUERY = {
        query: `
           mutation {
           update(name: "${name}", password: "${password}", confirm: "${confirm}", token:"${token}"){
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
        this.popupMessage = {
          type: "error",
          msg: "Failed to contact server. Please try again.",
          data: null,
        };
        return;
      }

      const responseData = await response.json();

      if (responseData.errors) {
        this.errorMsg = {
          field: "",
          msg: responseData.errors[0].message,
        };
        return;
      }

      this.$router.push({ path: "/dashboard" });
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

.header {
  display: flex;
  align-items: center;
}

.signup {
  padding-bottom: 2em;
}

.update span {
  font-size: 0.8em;
}

.error-msg {
  font-family: "Pridi", serif;
  font-size: 1.2rem;
  margin-left: 0.5em;
  margin-top: 1em;
}

.error {
  border: solid 2px red;
}
</style>
