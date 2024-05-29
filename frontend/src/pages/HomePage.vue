<template>
  <div>
    <the-popup :content="popupMessage"></the-popup>
    <div class="page">
      <section class="hero-section">
        <img src="/images/hero_img.avif" alt="illustration" />
        <div>
          <h1>Write and share your vision with the world.</h1>
          <p>
            Blogging offers a unique way of expressing yourself online. Follow
            writers that inspire you and create your own community of
            like-minded users.
          </p>
        </div>
      </section>

      <section class="content-demo">
        <h1>Blogging is for everybody.</h1>
        <p>
          Whether you're interested in science, pop culture, or cheesy movies
          from the 80s, Bloggling has a community for you.
        </p>

        <div class="topics">
          <ul>
            <li
              @click="selectTopic('science')"
              :class="selectedTopic == 'science' ? 'selected' : ''"
            >
              Science
            </li>
            <li
              @click="selectTopic('media')"
              :class="selectedTopic == 'media' ? 'selected' : ''"
            >
              Media
            </li>
            <li
              @click="selectTopic('food')"
              :class="selectedTopic == 'food' ? 'selected' : ''"
            >
              Food
            </li>
            <li
              @click="selectTopic('tech')"
              :class="selectedTopic == 'tech' ? 'selected' : ''"
            >
              Tech
            </li>
          </ul>

          <div class="articles-display">
            <article
              v-for="[index, article] in articles[selectedTopic].entries()"
              :key="index"
              :class="
                index == displayedIndex ? 'article displayed' : 'article hidden'
              "
              :id="index"
            >
              <div>
                <h3>{{ article.title }}</h3>
                <p>{{ article.abstract }}</p>
              </div>
              <div class="author-info-box">
                <span>{{ article.author }}</span>
                <img :src="article.urlProfile" alt="profile picture" />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="ai">
        <h1>Get more done with AI.</h1>
        <p>
          Write better and faster with the help of our AI. Ask it questions or
          give it a writing prompt for a paragraph. His name is Philipe Manor
          The Third, but you can call him Phil.😉
        </p>
        <span
          >Articles written exclusively by AI are not allowed. Read our
          <a>terms of service.</a></span
        >
      </section>

      <section class="signup">
        <h1>Get started now.</h1>
        <span v-if="errorMsg.msg" class="error-msg">{{ errorMsg.msg }}</span>
        <div class="signup-content">
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
            <span
              >Already have an account?<router-link to="/auth?mode=login"
                >Login</router-link
              ></span
            >
            <button>Signup</button>
          </the-form>
          <img src="/images/sign_up.png" alt="illustration" />
          <!-- <a href="https://storyset.com/communication">Communication illustrations by Storyset</a>  -->
        </div>
      </section>

      <footer class="credit">
        <p>Emerson Lima | 2024</p>

        <div>
          <a href="https://github.com/poissonfou"
            ><i class="bi bi-github"></i
          ></a>
          <a
            href="https://www.linkedin.com/in/emerson-lima-%F0%9F%8F%B3%EF%B8%8F%E2%80%8D%F0%9F%8C%88-000986237/"
            ><i class="bi bi-linkedin"></i
          ></a>
        </div>
      </footer>
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
      errorMsg: { field: "", msg: null },
      displayedIndex: 0,
      selectedTopic: "science",
      articles: {
        science: [
          {
            title: "The new frontiers of space.",
            abstract:
              "Let's discuss the latest dicoveries in the fields of Astronomy and Cosmology! 🌍🚀",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
          {
            title: "Internet and socialization.",
            abstract:
              "The age of the internet has reshaped many aspects of our lives, and one of them is how we learn and acquire behaviors.",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
          {
            title: "Religious extremism and the Middle East.",
            abstract:
              "The region is known for fostering many terrorist organizations. But what is the historical background of this scenario?",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
          {
            title: "Depression and work.",
            abstract:
              "How to be productive and meet deadlines when your brain is working against you?",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
        ],
        media: [
          {
            title: "The new frontiers of space.",
            abstract:
              "Let's discuss the latest dicoveries in the fields of Astronomy and Cosmology! 🌍🚀",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile_two.jpg",
          },
          {
            title: "Internet and socialization.",
            abstract:
              "The age of the internet has reshaped many aspects of our lives, and one of them is how we learn and acquire behaviors.",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile_two.jpg",
          },
          {
            title: "Religious extremism and the Middle East.",
            abstract:
              "The region is known for fostering many terrorist organizations. But what is the historical background of this scenario?",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile_two.jpg",
          },
          {
            title: "Depression and work.",
            abstract:
              "How to be productive and meet deadlines when your brain is working against you?",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile_two.jpg",
          },
        ],
        food: [
          {
            title: "The new frontiers of space.",
            abstract:
              "Let's discuss the latest dicoveries in the fields of Astronomy and Cosmology! 🌍🚀",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
          {
            title: "Internet and socialization.",
            abstract:
              "The age of the internet has reshaped many aspects of our lives, and one of them is how we learn and acquire behaviors.",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
          {
            title: "Religious extremism and the Middle East.",
            abstract:
              "The region is known for fostering many terrorist organizations. But what is the historical background of this scenario?",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
          {
            title: "Depression and work.",
            abstract:
              "How to be productive and meet deadlines when your brain is working against you?",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
        ],
        tech: [
          {
            title: "The new frontiers of space.",
            abstract:
              "Let's discuss the latest dicoveries in the fields of Astronomy and Cosmology! 🌍🚀",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
          {
            title: "Internet and socialization.",
            abstract:
              "The age of the internet has reshaped many aspects of our lives, and one of them is how we learn and acquire behaviors.",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
          {
            title: "Religious extremism and the Middle East.",
            abstract:
              "The region is known for fostering many terrorist organizations. But what is the historical background of this scenario?",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
          {
            title: "Depression and work.",
            abstract:
              "How to be productive and meet deadlines when your brain is working against you?",
            author: "Jane Mackintosh",
            urlProfile: "/images/profile.avif",
          },
        ],
      },
      name: "",
      email: "",
      password: "",
      confirm: "",
      popupMessage: { type: "", msg: "", data: null },
    };
  },
  methods: {
    selectTopic(topic) {
      if (this.selectedTopic == topic) return;
      this.selectedTopic = topic;
    },
    displayArticles() {
      let idx = this.displayedIndex;
      if (idx == 3) {
        this.displayedIndex = 0;
      } else {
        this.displayedIndex++;
      }
    },
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
    async signup(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const email = form.get("email").trim();
      const password = form.get("password").trim();
      const name = form.get("name");
      const confirm = form.get("confirm").trim();

      this.errorMsg = { field: "", msg: null };

      if (!name.length) {
        this.errorMsg = { field: "name", msg: "Please enter your name." };
        return;
      }

      if (!email.length || !email.includes("@")) {
        this.errorMsg = { field: "email", msg: "Please enter a valid email." };
        return;
      }

      if (!password.length <= 5) {
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
        this.errorMsg = {
          field: "",
          msg: responseData.errors[0].message,
        };
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({ ...responseData.data.signup })
      );

      this.$router.push({ path: "/welcome" });
    },
  },
  mounted() {
    setInterval(this.displayArticles, 5000);
  },
};
</script>

<style scoped>
.page {
  border: solid 3px rgb(0, 0, 0);
  border-bottom: none;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  margin: 0em 5em;
  margin-top: 2em;
  padding: 2em 5em;
  background-color: white;
}

.page h1 {
  font-family: "Pridi", serif;
  font-size: 3rem;
}

.page p {
  font-family: "Zilla Slab", serif;
  font-size: 2rem;
}

@media (max-width: 1300px) {
  .page h1 {
    font-size: 2.5rem;
  }

  .page p {
    font-size: 1.5rem;
  }
}

@media (max-width: 1100px) {
  .page {
    margin: 0em 2em;
    margin-top: 2em;
  }
}

@media (max-width: 900px) {
  .page {
    margin: 0em 1em;
    margin-top: 2em;
    padding: 2em 3em;
  }

  .page h1 {
    font-size: 2rem;
  }

  .page p {
    font-size: 1.3rem;
  }
}

@media (max-width: 700px) {
  .page {
    padding: 2em 1em;
  }

  .hero-section h1 {
    margin: 0;
  }

  .hero-section img {
    display: none;
  }
}

.hero-section {
  display: flex;
}

img {
  width: 50%;
  margin: 0 auto;
}

.content-demo p {
  margin-top: 0em;
}

.content-demo h1 {
  margin-bottom: 0em;
}

.topics {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

ul {
  list-style: none;
  font-family: "Pridi", serif;
  font-size: 2rem;
}

ul li {
  margin: 0.5em;
  padding: 0.2em 0.5em;
  width: fit-content;
}

ul li:hover {
  cursor: pointer;
}

.selected {
  border-radius: 10px;
  border: solid 2px black;
  background: rgb(53, 219, 109);
  box-shadow: -2px 2px 0px black;
}

.articles-display {
  position: relative;
  display: flex;
  padding: 0.5em 0em;
  border: solid 3px black;
  border-bottom: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  width: 40em;
  height: 18em;
}

.articles-display div h3 {
  font-size: 2.5rem;
  margin: 0;
  width: 100%;
  font-family: "Pridi", serif;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0em 0.2em;
}

.articles-display div p {
  font-size: 1.7rem;
  height: 5em;
  width: 100%;
  white-space: wrap;
  padding: 0em 0.5em;
}

.article {
  position: absolute;
  opacity: 1;
  transition: opacity 1s;
  width: 100%;
}

.author-info-box {
  display: flex;
  align-items: center;
  justify-content: end;
  padding: 0em 0.5em;
}

.author-info-box img {
  width: 3.5em;
  height: 3.5em;
  border-radius: 10em;
  margin: 0em;
  object-fit: cover;
  margin-left: 0.5em;
}

@media (max-width: 1300px) {
  ul {
    font-size: 1.3rem;
  }

  .articles-display {
    width: 35em;
    height: 15em;
  }

  .articles-display div h3 {
    font-size: 2rem;
  }

  .articles-display div p {
    font-size: 1.5rem;
  }
}

@media (max-width: 1100px) {
  .articles-display {
    width: 30em;
    height: 15em;
  }
}

@media (max-width: 900px) {
  .topics {
    display: flex;
    flex-direction: column;
  }

  ul {
    display: flex;
    justify-content: space-around;
    font-size: 1.3rem;
    width: 100%;
  }

  .articles-display {
    width: 100%;
    height: 15em;
  }
}

@media (max-width: 700px) {
  ul {
    margin-left: -1.5em;
  }

  .articles-display div h3 {
    font-size: 1.8rem;
  }

  .articles-display div p {
    font-size: 1.3rem;
  }
}

@media (max-width: 500px) {
  ul {
    margin-left: -2.5em;
    font-size: 1.1rem;
  }
}

@media (max-width: 400px) {
  ul {
    margin-left: -4em;
  }
}

.hidden {
  opacity: 0;
  transition: opacity 1s;
}

.ai h1 {
  margin-bottom: 0;
}

.ai p {
  margin-top: 0em;
}

.ai span {
  font-family: "Pridi", serif;
  font-size: 1.2rem;
}

.ai a {
  color: rgb(46, 190, 94);
}

.ai a:hover {
  cursor: pointer;
}

@media (max-width: 1300px) {
  .ai span {
    font-size: 1rem;
  }
}

.signup h1 {
  margin-bottom: -0.3em;
}

.signup-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 1300px) {
  form div input {
    font-size: 1.2rem;
    width: 15em;
  }

  form div label {
    font-size: 1.3rem;
  }

  form button {
    font-size: 1.3rem;
  }
}

@media (max-width: 900px) {
  form div input {
    width: 15em;
  }

  form div label {
    font-size: 1.2rem;
  }

  form button {
    font-size: 1.2rem;
  }

  form span {
    font-size: 1rem;
  }
}

@media (max-width: 800px) {
  .signup-content img {
    display: none;
  }

  form div input {
    width: 23em;
  }

  form div label {
    font-size: 1.3rem;
  }
}

@media (max-width: 700px) {
  form div input {
    width: 18em;
  }

  form div label {
    font-size: 1.3rem;
  }
}

@media (max-width: 500px) {
  form div input {
    width: 16em;
  }
}

@media (max-width: 400px) {
  form div input {
    width: 14em;
  }
}

.credit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5em;
}

.credit p {
  font-size: 1.2rem;
}

.credit i {
  font-size: 1.8rem;
  color: rgb(53, 219, 109);
  margin-right: 0.5em;
}

.error-msg {
  font-family: "Pridi", serif;
  font-size: 1.2rem;
}

.error {
  border: solid 2px red;
}
</style>
