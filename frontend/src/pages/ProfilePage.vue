<template>
  <main>
    <div class="profile-body">
      <div class="info">
        <div>
          <div v-if="!user.picture" class="no-pic">{{ user.name[0] }}</div>
          <div v-else class="img">
            <img
              :src="'http://localhost:3000/images/' + user.picture"
              alt="user picture"
            />
          </div>
          <div class="text-box">
            <div class="user-identifiers">
              <h1>{{ user.name }}</h1>
              <span>{{ user.tag }}</span>
            </div>
            <div class="account-metrics">
              <span>{{ "Followers " + user.followers.length }}</span>
              <span>{{ "Following " + user.following.length }}</span>
            </div>
          </div>
        </div>

        <div v-if="this.$store.state.user.following.includes(String(user.id))">
          <button @click="unfollow(user.id)" class="button-unfollow">
            Unfollow
          </button>
        </div>
        <div v-else>
          <button @click="follow(user.id)" class="button-follow">Follow</button>
        </div>
      </div>
      <div class="posts">
        <div
          v-for="[index, post] in user.posts.entries()"
          :key="index"
          class="post-miniature"
          @click="showPost(post.id)"
        >
          <h2>{{ post.title }}</h2>
          <p>{{ post.abstract }}</p>
          <div>
            <span
              v-for="[index, tag] in post.tags.entries()"
              :key="index"
              class="tag"
              >{{ tag }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  data() {
    return {
      user: { name: "", picture: "", posts: [], followers: [], following: [] },
      selectedPost: null,
      tagsUserArticles: [],
      filteredPosts: [],
    };
  },
  methods: {
    async fetchUser(id, isUserStore) {
      const QUERY = {
        query: `
          {
             getUser(id: ${id}){
              id
              name
              picture
              posts {
                title
                tags
                abstract
                body
                images
                id
                createdAt
                updatedAt
              }
              followers
              following
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

      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors[0].message);
      }

      console.log(responseData.data.getUser);

      const posts = responseData.data.getUser.posts;
      const tags = [];

      for (let i = 0; i < posts.length; i++) {
        let tagsPost = posts[i].tags;

        for (let j = 0; j < tagsPost.length; j++) {
          if (!tags.includes(tagsPost[j])) tags.push(tagsPost[j]);
        }
      }

      if (!isUserStore) {
        this.tagsUserArticles = tags;
        this.user = responseData.data.getUser;
      } else {
        this.$store.commit("setUser", responseData.data.getUser);
      }
    },
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

      this.$store.commit("follow", id);
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

      const idx = this.$store.state.user.following.indexOf(id);
      this.$store.commit("unfollow", idx);
    },
    async showPost(id) {
      this.tab = "display-post";
      const postIdx = this.$store.state.user.posts.map((p) => p.id).indexOf(id);
      const post = JSON.parse(
        JSON.stringify(this.$store.state.user.posts[postIdx])
      );
      post.notUpdated = +post.createdAt == +post.updatedAt;

      const dateCreation = new Date(+post.createdAt);
      const dateUpdate = new Date(+post.updatedAt);
      post.createdAt =
        dateCreation.getUTCDay() +
        "/" +
        dateCreation.getUTCMonth() +
        "/" +
        dateCreation.getUTCFullYear();
      +" " + dateCreation.getHours();
      +"h" + dateCreation.getMinutes();
      +"m" + dateCreation.getSeconds();

      post.updatedAt =
        dateUpdate.getUTCDay() +
        "/" +
        dateUpdate.getUTCMonth() +
        "/" +
        dateUpdate.getUTCFullYear() +
        " " +
        dateUpdate.getHours();
      +"h" + dateUpdate.getMinutes();
      +"m" + dateUpdate.getSeconds();
      this.selectedPost = post;
    },
  },
  async mounted() {
    const id = this.$route.params.id;
    const userId = JSON.parse(localStorage.getItem("user")).id;
    this.fetchUser(id, false);
    this.fetchUser(userId, true);
  },
};
</script>

<style scoped>
main {
  height: 100%;
}

.profile-body {
  background-color: white;
  border: solid 3px black;
  border-bottom: none;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  margin: 0em 5em;
  margin-top: 2em;
  height: 100%;
  padding: 0.5em 3em;
}

.text-box {
  margin-left: 2em;
}

.info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info div:first-child {
  display: flex;
}

.user-identifiers {
  display: flex;
  align-items: center;
}

.user-identifiers span {
  margin-left: 0.5em;
  font-family: "Zilla Slab", serif;
  font-size: 1.5rem;
  color: rgb(53, 219, 109);
}

.info h1 {
  font-family: "Pridi", serif;
  font-size: 3rem;
  margin: 0;
}

.account-metrics span {
  margin-right: 0.5em;
  font-family: "Zilla Slab", serif;
  font-size: 1.2rem;
}

.no-pic {
  background-color: rgb(46, 190, 94);
  width: fit-content;
  padding: 0.5rem 0.8em;
  border-radius: 5em;
  color: white;
  font-size: 3rem;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.img {
  background-color: rgb(46, 190, 94);
  padding: 0.3em;
  padding-bottom: 0em;
  border-radius: 100%;
  color: white;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.img img {
  width: 7em;
  height: 7em;
  border-radius: 50%;
  margin-top: 0.1em;
}

.button-follow {
  border: solid 2px black;
  border-radius: 5px;
  background-color: rgb(53, 219, 109);
  font-size: 1.5rem;
  padding: 0.3em 1.5em;
  font-family: "Zilla Slab", serif;
  box-shadow: 2px 2px 0px black;
}

.button-unfollow {
  border: solid 2px black;
  border-radius: 5px;
  background-color: rgb(53, 219, 109);
  font-size: 1.5rem;
  padding: 0.3em 1em;
  font-family: "Zilla Slab", serif;
  box-shadow: 2px 2px 0px black;
}

.button-follow:hover,
.button-unfollow:hover {
  cursor: pointer;
}

.posts {
  margin-top: 3em;
  padding: 0em 1em;
  padding-top: 0.5em;
  text-align: start;
  height: 22em;
  overflow-y: scroll;
}

.posts::-webkit-scrollbar {
  display: block;
}

.posts::-webkit-scrollbar-track {
  background-color: transparent;
}

.posts::-webkit-scrollbar-thumb {
  background: rgb(15, 15, 15);
  border-radius: 10px;
  border: solid white 3px;
}

.post-miniature {
  border: solid 3px rgb(51, 51, 51);
  border-radius: 5px;
  padding: 0.5em;
  margin-bottom: 0.5em;
  font-family: "Zilla Slab", serif;
}

.post-miniature:hover {
  cursor: pointer;
}

.post-miniature h2 {
  margin: 0;
  font-family: "Pridi", serif;
  font-size: 2rem;
}

.post-miniature p {
  margin: 0;
  font-family: "Zilla Slab", serif;
  color: gray;
  font-size: 1.5rem;
  margin-bottom: 0.4em;
}

.tag {
  margin-right: 0.3em;
  background: rgb(64, 89, 173);
  padding: 0.5em;
  border-radius: 8px;
  font-size: 0.8rem;
}
</style>
