<template>
  <div id="wrapper-board">
    <main class="main-container">
      <section class="content">
        <div class="content-inner-container">
          <div
            v-if="
              tab !== 'add-post' &&
              tab !== 'edit-post' &&
              tab !== 'display-post'
            "
            class="header-content"
          >
            <div @click="changeTab('add-post')" class="add-post">
              <span>
                <i class="bi bi-plus-square-fill"></i>
                New post</span
              >
            </div>
            <div>
              <span>{{ `Articles: ` + this.user.posts.length }}</span>
            </div>
          </div>

          <div v-if="tab == 'display-post'" class="user-post-actions">
            <button @click="changeTab('edit-post')">Edit</button>
            <button @click="deletePost">Delete</button>
          </div>
          <div v-if="tab == 'posts'" class="posts">
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
          <div v-if="tab == 'filtered-posts'" class="posts">
            <div
              v-for="[index, post] in filteredPosts.entries()"
              :key="index"
              class="post-miniature"
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
          <div v-if="tab == 'display-post'" class="display-post">
            <post-display
              :title="selectedPost.title"
              :abstract="selectedPost.abstract"
              :body="selectedPost.body"
              :createdTime="selectedPost.createdAt"
              :updatedTime="selectedPost.updatedAt"
              :notUpdated="selectedPost.notUpdated"
            ></post-display>
          </div>
          <div v-if="tab == 'add-post'">
            <the-user-post :submitFunction="addPost"></the-user-post>
          </div>
          <div v-if="tab == 'edit-post'">
            <the-user-post
              :submitFunction="editPost"
              :titleProp="selectedPost.title"
              :abstractProp="selectedPost.abstract"
              :bodyProp="selectedPost.body"
              :tagsProps="selectedPost.tags"
              :idProp="selectedPost.id"
            ></the-user-post>
          </div>
          <div v-if="tab == 'search'" class="search">
            <search-results :results="results" :user="user"></search-results>
          </div>
        </div>
      </section>
      <section class="info">
        <user-info :user="user" :changeTab="changeTab"></user-info>
        <div
          v-if="
            tagsUserArticles.length &&
            tab !== 'add-posts' &&
            tab !== 'display-post' &&
            tab !== 'edit-post'
          "
          class="user-tags"
        >
          <span
            v-for="[index, tag] in tagsUserArticles.entries()"
            :key="index"
            @click="filterPosts"
          >
            {{ tag }}
          </span>
        </div>
        <div v-if="tab == 'add-post'">
          <div></div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import TheUserPost from "../components/TheUserPost.vue";
import UserInfo from "../components/UserInfo.vue";
import PostDisplay from "../components/PostDisplay.vue";
import SearchResults from "../components/SearchResults.vue";

export default {
  data() {
    return {
      user: { name: "", picture: "", posts: [], followers: [], following: [] },
      filteredPosts: [],
      tagsUserArticles: [],
      tab: "posts",
      selectedPost: null,
    };
  },
  computed: {
    results() {
      return this.$store.state.search;
    },
  },
  watch: {
    results() {
      this.changeTab("search");
    },
  },
  components: {
    TheUserPost,
    UserInfo,
    PostDisplay,
    SearchResults,
  },
  methods: {
    async fetchUser() {
      const id = JSON.parse(localStorage.getItem("user")).id;

      const QUERY = {
        query: `
          {
             getUser(id: ${id}){
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

      this.tagsUserArticles = tags;
      this.user = responseData.data.getUser;
    },
    changeTab(tab) {
      this.tab = tab;
    },
    async addPost(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const title = form.get("title");
      const abstract = form.get("abstract");
      const body = document.getElementById("body").innerHTML;
      const id = JSON.parse(localStorage.getItem("user")).id;
      const tags = [...document.querySelectorAll(".selected-tag")];
      const tagsContent = [];
      for (let i = 0; i < tags.length; i++) {
        tagsContent.push(tags[0].innerText);
      }

      if (!title.length) {
        console.log("Please add a title.");
        return;
      }

      if (!body.length) {
        console.log("Please add content to your post.");
        return;
      }

      if (!tagsContent.length) {
        console.log("Please add at least one tag.");
        return;
      }

      const QUERY = {
        query: `
          mutation{
	          addPost(postInput: {title: "${title}", abstract: "${abstract}", body: "${body}", tags: ${JSON.stringify(
          tagsContent
        )}, images: ${JSON.stringify([])}, userId: ${id}}){
               message
               data {
                 title
                 abstract
                 body
                 tags
                 images
                 id
                 createdAt
                 updatedAt
                }
              }
            }
        `,
      };

      console.log(body);

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
        throw new Error(responseData.errors[0].message);
      }

      const post = responseData.data.addPost.data;
      this.user.posts.push(post);

      const tagsPost = [...this.tagsUserArticles];
      for (let i = 0; i < post.tags.length; i++) {
        if (!tagsPost.includes(post.tags[i])) tags.push(post.tags[i]);
      }

      this.tagsUserArticles = tagsPost;
      this.tab = "posts";
    },
    async editPost(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const title = form.get("title");
      const abstract = form.get("abstract");
      const body = form.get("body");
      const id = event.target.id;
      const tags = [...document.querySelectorAll(".selected-tag")];
      const tagsContent = [];

      for (let i = 0; i < tags.length; i++) {
        tagsContent.push(tags[i].innerText);
      }

      if (!title.length) {
        console.log("Please add a title.");
        return;
      }

      if (!body.length) {
        console.log("Please add content to your post.");
        return;
      }

      if (!tagsContent.length) {
        console.log("Please add at least one tag.");
        return;
      }

      const QUERY = {
        query: `
        mutation{
	          editPost(postInput: {title: "${title}", abstract: "${abstract}", body: "${body}", images: ${JSON.stringify(
          []
        )}, tags: ${JSON.stringify(tagsContent)}, postId: ${id}}){
             message
             data{
              title
              abstract
              body
              images
              tags
              id
              createdAt
              updatedAt
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

      const responseData = await response.json();

      if (responseData.errors) {
        console.log(responseData.errors);
        throw new Error(responseData.errors[0].message);
      }

      const post = responseData.data.editPost.data;
      const oldPostIdx = this.user.posts.map((p) => p.id).indexOf(post.id);
      this.user.posts[oldPostIdx] = post;

      const tagsPost = [...this.tagsUserArticles];
      for (let i = 0; i < post.tags.length; i++) {
        if (!tagsPost.includes(post.tags[i])) tags.push(post.tags[i]);
      }

      this.tagsUserArticles = tagsPost;
      this.tab = "posts";
    },
    async deletePost() {
      const id = this.selectedPost.id;

      const QUERY = {
        query: `
          mutation{
	          deletePost(id: ${id}){
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
        throw new Error(responseData.errors[0].message);
      }

      const postIdx = this.user.posts.map((post) => post.id).indexOf(id);
      this.user.posts.splice(postIdx, 1);

      this.tab = "posts";
    },
    filterPosts(event) {
      const tag = event.target.innerText;
      const posts = this.user.posts;
      const postsFiltered = [];
      for (let i = 0; i < posts.length; i++) {
        if (posts[i].tags.includes(tag)) postsFiltered.push(posts[i]);
      }

      this.filteredPosts = postsFiltered;
      this.tab = "filtered-posts";
    },
    showPost(id) {
      this.tab = "display-post";
      const postIdx = this.user.posts.map((p) => p.id).indexOf(id);
      const post = JSON.parse(JSON.stringify(this.user.posts[postIdx]));
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
  created() {
    this.fetchUser();
  },
};
</script>

<style scoped>
#wrapper-board {
  height: 100%;
}

.main-container {
  display: grid;
  grid-template-columns: 1fr 20em;
  height: 100%;
  width: 100%;
}

.content {
  padding: 0.5em;
  padding-bottom: 0em;
}

.content-inner-container {
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  background-color: white;
  height: 99.5%;
  border: solid 3px black;
  border-bottom: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0em 1em;
  font-family: "Pridi", serif;
}

.add-post:hover {
  cursor: pointer;
}

.add-post i {
  font-size: 1.2rem;
  color: rgb(53, 219, 109);
}

.posts,
.search {
  padding: 0em 1em;
  padding-top: 0.5em;
  text-align: start;
  height: 31em;
  overflow-y: scroll;
}

.posts::-webkit-scrollbar,
.search::-webkit-scrollbar {
  display: block;
}

.posts::-webkit-scrollbar-track,
.search::-webkit-scrollbar-track {
  background-color: transparent;
}

.posts::-webkit-scrollbar-thumb,
.search::-webkit-scrollbar-thumb {
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

.user-post-actions {
  display: flex;
  justify-content: end;
}

.user-post-actions button {
  margin-right: 0.5em;
}

.user-post-actions button:hover {
  cursor: pointer;
}

.user-post-actions button:first-child {
  border: none;
  border-radius: 10px;
  padding: 0.3em 1em;
  background: rgb(53, 219, 109);
  background: linear-gradient(
    90deg,
    rgb(53, 219, 109) 0%,
    rgba(183, 251, 169, 1) 100%
  );
  width: fit-content;
  font-family: "Pridi", serif;
  font-size: 1rem;
  margin-top: 0.5em;
}

.user-post-actions button:last-child {
  border: none;
  border-radius: 10px;
  padding: 0.3em 1em;
  background: rgb(53, 219, 109);
  background: linear-gradient(
    90deg,
    rgb(219, 53, 53) 0%,
    rgb(251, 169, 169) 100%
  );
  width: fit-content;
  font-family: "Pridi", serif;
  font-size: 1rem;
  margin-top: 0.5em;
}

.info {
  padding: 0.5em;
  padding-left: 0em;
}

.user-tags {
  background-color: white;
  padding: 0.5em;
  border: solid 2px black;
  margin-top: 0.3em;
  border-radius: 5px;
}

.user-tags span {
  display: inline-block;
  margin-right: 0.3em;
  margin-top: 0.3em;
  background: #4059ad;
  padding: 0.5em;
  border-radius: 8px;
  font-family: "Zilla Slab", serif;
}

.user-tags span:hover {
  cursor: pointer;
}
</style>
