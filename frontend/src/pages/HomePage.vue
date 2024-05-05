<template>
  <div class="page">
    <section class="img-box-hero">
      <img src="/images/hero_img.avif" alt="illustration" />
      <div>
        <h1>Write and share your vision with the world.</h1>
        <p>
          Blogging offer unique way of expressing yourself online. Follow
          writers that inspire you and create your own community of like-minded
          users.
        </p>
      </div>
    </section>

    <section class="content-demo">
      <h1>Blogging is for everybody.</h1>
      <p>
        Whether you're interested in science, pop culture, or cheesy movies from
        the 80s, Bloggling has a community for you.
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
          <div
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
          </div>
        </div>
      </div>
    </section>

    <section class="ai">
      <h1>Get more done with AI.</h1>
      <p>
        Write better and faster with the help of our AI. Ask questions or give
        it a writing prompt for a paragraph. His name is Philipe Manor The
        Third, but you can call him Phil.😉
      </p>
      <span
        >Articles written exclusively by AI are not allowed. Read our
        <a>terms of service.</a></span
      >
    </section>

    <section class="signup">
      <h1>Get started now.</h1>
      <div class="signup-content">
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

    <section class="credit">
      <p>Emerson Lima | 2024</p>

      <div>
        <a href="https://github.com/poissonfou"><i class="bi bi-github"></i></a>
        <a
          href="https://www.linkedin.com/in/emerson-lima-%F0%9F%8F%B3%EF%B8%8F%E2%80%8D%F0%9F%8C%88-000986237/"
          ><i class="bi bi-linkedin"></i
        ></a>
      </div>
    </section>
  </div>
</template>

<script>
import TheForm from "../components/TheForm.vue";

export default {
  components: {
    TheForm,
  },
  data() {
    return {
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
    async signup(event) {
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

      this.$router.push({ path: "/dashboard" });
    },
  },
  mounted() {
    setInterval(this.displayArticles, 5000);
  },
};
</script>

<style scoped>
.page {
  position: relative;
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

.img-box-hero {
  display: flex;
}

img {
  display: block;
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
  border-radius: 20px;
  background: rgb(53, 219, 109);
  background: linear-gradient(
    90deg,
    rgb(53, 219, 109) 0%,
    rgba(183, 251, 169, 1) 100%
  );
}

.articles-display {
  position: relative;
  display: flex;
  padding: 0.5em 1em;
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
  font-family: "Pridi", serif;
  width: 16em;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.articles-display div p {
  font-size: 1.7rem;
  height: 5em;
  width: 23.5em;
  text-overflow: ellipsis;
  overflow: hidden;
}

.article {
  position: absolute;
  opacity: 1;
  transition: opacity 1s;
}

.author-info-box {
  display: flex;
  align-items: center;
  justify-content: end;
  margin-right: 2em;
}

.author-info-box img {
  display: inline-block;
  width: 4em;
  height: 4em;
  border-radius: 10em;
  margin: 0em;
  object-fit: cover;
  margin-left: 0.5em;
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

.signup h1 {
  margin-bottom: 0;
}

.signup-content {
  display: flex;
  align-items: center;
}

.signup-content img {
  height: 25em;
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
</style>
