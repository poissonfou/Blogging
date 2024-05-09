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
            @click="changeTab('add-post')"
            class="add-post"
          >
            <span>
              <i class="bi bi-plus-square-fill"></i>
              New post</span
            >
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
              <p>{{ post.title }}</p>
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
              <p>{{ post.title }}</p>
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
            <h1>{{ selectedPost.title }}</h1>
            <h3>{{ selectedPost.abstract }}</h3>
            <p>{{ selectedPost.body }}</p>
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

export default {
  data() {
    return {
      user: { name: "", picture: "", posts: [] },
      filteredPosts: [],
      tagsUserArticles: [],
      tab: "posts",
      selectedPost: null,
    };
  },
  components: {
    TheUserPost,
    UserInfo,
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
        throw new Error(responseData.errors[0].message);
      }

      console.log(responseData.data.getUser);

      const posts = responseData.data.getUser.posts;
      const tags = [];

      for (let i = 0; i < posts.length; i++) {
        let tagsPost = JSON.parse(posts[i].tags);
        posts[i].tags = tagsPost;
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
      const body = form.get("body");
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
      this.selectedPost = this.user.posts[postIdx];
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
  height: 100%;
  border: solid 3px black;
  border-bottom: none;
}

.posts {
  padding: 0em 0.3em;
  padding-top: 0.5em;
  text-align: start;
}

.display-post {
  padding: 0em 2em;
}

.display-post h1 {
  font-size: 3rem;
  margin: 0em;
  font-family: "Pridi", serif;
}

.display-post h3 {
  font-family: "Zilla Slab", serif;
  color: rgb(138, 136, 136);
  font-size: 1.8rem;
  margin: 0em;
}

.display-post p {
  font-family: "Zilla Slab", serif;
  font-size: 1.5rem;
  margin: 0.5em 0em;
}

.add-post {
  margin-left: 1em;
  font-family: "Pridi", serif;
}

.add-post:hover {
  cursor: pointer;
}

.add-post i {
  font-size: 1.2rem;
  color: rgb(53, 219, 109);
}

.post-miniature {
  border: solid 2px rgb(137, 255, 173);
  border-radius: 5px;
  padding: 0.5em;
  display: inline-table;
  width: 10em;
  font-family: "Zilla Slab", serif;
}

.post-miniature:hover {
  cursor: pointer;
}

.post-miniature p {
  margin: 0;
  font-family: "Pridi", serif;
  font-size: 2rem;
  height: 3em;
}

.tag {
  margin-right: 0.3em;
  margin-top: 0.3em;
  background: rgb(53, 219, 178);
  padding: 0.5em;
  border-radius: 10px;
  font-size: 0.7em;
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
  background: rgb(53, 219, 142);
  padding: 0.5em;
  border-radius: 10px;
  font-family: "Zilla Slab", serif;
}

.user-tags span:hover {
  cursor: pointer;
}
</style>
