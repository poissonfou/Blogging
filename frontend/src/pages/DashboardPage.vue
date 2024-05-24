<template>
  <div id="wrapper-board">
    <the-popup :content="popupMessage" :confirmDelete="deletePost"></the-popup>
    <main class="main-container" id="grid">
      <section class="content" id="content">
        <div class="content-inner-container">
          <div
            v-if="tab == 'posts' || tab == 'filtered-post'"
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
          <div v-if="tab == 'feed'">
            <h1>WEE</h1>
          </div>
          <div v-if="tab == 'posts'" class="posts">
            <the-post-miniature
              v-for="[index, post] in user.posts.entries()"
              :key="index"
              :post="post"
              :edit="showEdit"
              :deletion="showDelete"
              @click="showPost(post.id)"
            >
            </the-post-miniature>
          </div>
          <div v-if="tab == 'filtered-posts'" class="posts">
            <the-post-miniature
              v-for="[index, post] in filteredPosts.entries()"
              :key="index"
              :post="post"
              :edit="showEdit"
              :deletion="deletePost"
              @click="showPost(post.id)"
            >
            </the-post-miniature>
          </div>
          <div v-if="tab == 'add-post'">
            <the-new-post
              :submitFunction="addPost"
              :error="errorForm"
            ></the-new-post>
          </div>
          <div v-if="tab == 'edit-post'">
            <the-new-post
              :submitFunction="editPost"
              :titleProp="selectedPost.title"
              :abstractProp="selectedPost.abstract"
              :bodyProp="selectedPost.body"
              :tagsProps="selectedPost.tags"
              :idProp="selectedPost.id"
              :error="errorForm"
            ></the-new-post>
          </div>
        </div>
      </section>
      <section class="connections" v-if="displayConnections">
        <div class="inner-container-connections">
          <div v-if="displayConnections == 'followers'" class="followers">
            <h1>Followers</h1>
            <div
              class="follower"
              v-for="[index, follower] in followers.entries()"
              :key="index"
              @click="showProfile(follower)"
            >
              <div class="follower-info">
                <div v-if="!follower.picture" class="follower-no-pic">
                  {{ follower.name[0] }}
                </div>
                <div v-else class="follower-img">
                  <img
                    :src="'http://localhost:3000/images/' + follower.picture"
                    alt="profile-picture"
                  />
                </div>
                <div>
                  <div class="follower-identifiers">
                    <h3>{{ follower.name }}</h3>
                    <span>{{ follower.tag }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="following.map((fol) => fol.id).indexOf(follow.id) !== -1"
              >
                <button @click="unfollow(follower.id)" class="button-unfollow">
                  Unfollow
                </button>
              </div>
              <div v-else>
                <button @click="follow(follower.id)" class="button-follow">
                  Follow
                </button>
              </div>
            </div>
          </div>
          <div v-if="displayConnections == 'following'" class="following">
            <h1>Following</h1>
            <div
              v-for="[index, foll] in user.following.entries()"
              :key="index"
              class="follow"
            >
              <div class="follow-info">
                <div v-if="!foll.picture" class="follow-no-pic">
                  {{ foll.name[0] }}
                </div>
                <div v-else class="follow-img">
                  <img
                    :src="'http://localhost:3000/images/' + foll.picture"
                    alt="profile-picture"
                  />
                </div>
                <div>
                  <div class="follow-identifiers">
                    <h3>{{ foll.name }}</h3>
                    <span>{{ foll.tag }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="following.map((fol) => fol.id).indexOf(foll.id) !== -1"
              >
                <button @click="unfollow(foll.id)" class="button-unfollow">
                  Unfollow
                </button>
              </div>
              <div v-else>
                <button @click="follow(foll.id)" class="button-follow">
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="info">
        <user-info
          :user="user"
          :changeTab="changeTab"
          :showConnections="showConnections"
        ></user-info>
        <div
          v-if="
            tab !== 'add-post' && tab !== 'display-post' && tab !== 'edit-post'
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
        <div v-if="tab == 'add-post' || tab == 'edit-post'" class="ai-section">
          <div class="ai-box">
            <div class="ai-name">
              <span class="material-symbols-outlined"> robot_2 </span>
              <h1>Phil</h1>
              <span>
                <i class="bi bi-google"></i>
                Gemini
              </span>
            </div>
            <span v-if="errorAi">{{ errorAi }}</span>
            <div
              id="ai-textbox"
              tabindex="1"
              contenteditable="true"
              role="textbox"
              spellcheck="true"
            ></div>
            <div class="btn">
              <button @click="submitPrompt">
                Generate <i class="bi bi-stars"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import TheNewPost from "../components/TheNewPost.vue";
import UserInfo from "../components/UserInfo.vue";
import ThePostMiniature from "../components/ThePostMiniature.vue";
import ThePopup from "../components/ThePopup.vue";

export default {
  components: {
    TheNewPost,
    UserInfo,
    ThePostMiniature,
    ThePopup,
  },
  data() {
    return {
      filteredPosts: [],
      tagsUserArticles: [],
      tab: "posts",
      selectedPost: null,
      displayConnections: null,
      storeUpdates: [],
      followers: [],
      following: [],
      popupMessage: { type: "", msg: "", data: null },
      errorAi: null,
      errorForm: { field: "", msg: null },
    };
  },
  watch: {
    displayConnections() {
      const grid = document.getElementById("grid");
      const contentDiv = document.getElementById("content");
      if (this.displayConnections) {
        grid.classList = "main-container-connection";
        contentDiv.classList = "content-display-connections";
      } else {
        grid.classList = "main-container";
        contentDiv.classList = "content";
      }
    },
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    async fetchUser() {
      console.log("running");
      const id = JSON.parse(localStorage.getItem("user")).id;

      if (typeof id !== "number") {
        this.error = "Invalid id, please login again.";
        return;
      }

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
              followers {
                id
                name
                picture
                tag
              }
              following {
                id
                name
                picture 
                tag
              }
              tag
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
          msg: "Couldn't connect to server. Please reload",
          data: null,
        };
        return;
      }

      const data = await response.json();

      if (data.errors) {
        this.popupMessage = {
          type: "error",
          msg: data.errors[0].message,
          data: null,
        };
        return;
      }

      const user = data.data.getUser;

      console.log(user);

      const posts = user.posts;
      const tags = new Set([]);

      for (let i = 0; i < posts.length; i++) {
        tags.add(...posts[i].tags);
      }

      this.tagsUserArticles = [...tags];
      this.followers = JSON.parse(JSON.stringify(user.followers));
      this.following = JSON.parse(JSON.stringify(user.following));
      this.$store.commit("setUser", user);
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
      const tags = [...document.querySelectorAll(".selected-tag")].map(
        (tag) => tag.innerText
      );

      if (!title.length || !title.replace(/\s/g, "").length) {
        this.errorForm = { field: "title", msg: "Please add a title." };
        setTimeout(() => {
          document
            .getElementById("title-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);

        return;
      }

      if (!abstract.length || !abstract.replace(/\s/g, "").length) {
        this.errorForm = {
          field: "abstract",
          msg: "Please add an abstract to your post.",
        };
        setTimeout(() => {
          document
            .getElementById("abstract-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }

      if (!body.length || !body.replace(/\s/g, "").length) {
        this.errorForm = {
          field: "body",
          msg: "Please add content to your post.",
        };
        setTimeout(() => {
          document
            .getElementById("body-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }

      if (!tags.length) {
        this.errorForm = {
          field: "title",
          msg: "Please add at least one tag.",
        };
        setTimeout(() => {
          document
            .getElementById("tags-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }

      const QUERY = {
        query: `
          mutation{
	          addPost(postInput: {title: "${title}", abstract: "${abstract}", body: "${body}", tags: ${JSON.stringify(
          tags
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
          msg: "Couldn't connect to server. Please try again.",
          data: null,
        };
        return;
      }

      const responseData = await response.json();

      if (responseData.errors) {
        this.errorForm = {
          field: "",
          msg: responseData.errors[0].message,
        };
        setTimeout(() => {
          document
            .getElementById("general-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }

      const post = responseData.data.addPost.data;
      this.$store.commit("addPost", post);

      const newUserArticlesTags = new Set([
        ...this.tagsUserArticles,
        ...post.tags,
      ]);

      this.tagsUserArticles = [...newUserArticlesTags];
      this.tab = "posts";
    },
    async editPost(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const title = form.get("title");
      const abstract = form.get("abstract");
      const body = form.get("body");
      const id = event.target.id;
      const tags = [...document.querySelectorAll(".selected-tag")].map(
        (tag) => tag.innerText
      );

      if (!id || typeof +id !== "number") {
        this.error = "Could not get post id. Please reload and try again.";
        return;
      }

      if (!title.length || !title.replace(/\s/g, "").length) {
        this.errorForm = { field: "title", msg: "Please add a title." };
        setTimeout(() => {
          document
            .getElementById("title-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);

        return;
      }

      if (!abstract.length || !abstract.replace(/\s/g, "").length) {
        this.errorForm = {
          field: "abstract",
          msg: "Please add an abstract to your post.",
        };
        setTimeout(() => {
          document
            .getElementById("abstract-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }

      if (!body.length || !body.replace(/\s/g, "").length) {
        this.errorForm = {
          field: "body",
          msg: "Please add content to your post.",
        };
        setTimeout(() => {
          document
            .getElementById("body-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }

      if (!tags.length) {
        this.errorForm = {
          field: "title",
          msg: "Please add at least one tag.",
        };
        setTimeout(() => {
          document
            .getElementById("tags-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }

      const QUERY = {
        query: `
        mutation{
	          editPost(postInput: {title: "${title}", abstract: "${abstract}", body: "${body}", images: ${JSON.stringify(
          []
        )}, tags: ${JSON.stringify(tags)}, postId: ${id}}){
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
          msg: "Couldn't connect to server. Please try again.",
          data: null,
        };
        return;
      }

      const responseData = await response.json();

      if (responseData.errors) {
        this.errorForm = {
          field: "",
          msg: responseData.errors[0].message,
        };
        setTimeout(() => {
          document
            .getElementById("general-error")
            .scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }

      const post = responseData.data.editPost.data;
      const oldPostIdx = this.user.posts.map((p) => p.id).indexOf(post.id);
      this.$store.commit("editPost", { idx: oldPostIdx, post });

      const newUserArticlesTags = new Set([
        ...this.tagsUserArticles,
        ...post.tags,
      ]);

      this.tagsUserArticles = newUserArticlesTags;
      this.tab = "posts";
    },
    async deletePost(id) {
      const popup = document.getElementById("popup");
      popup.classList.add("hidden");
      popup.classList.remove("show-popup");

      const QUERY = {
        query: `
          mutation{
	          deletePost(id: ${id}){
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
          msg: "Couldn't connect to server. Please try again.",
          data: null,
        };
        return;
      }

      const responseData = await response.json();

      if (responseData.errors) {
        this.popupMessage = {
          type: "error",
          msg: responseData.errors[0].message,
          data: null,
        };
        return;
      }

      const postIdx = this.user.posts.map((post) => post.id).indexOf(id);
      this.$store.commit("deletePost", postIdx);

      this.tab = "posts";
    },
    filterPosts(event) {
      const tag = event.target.innerText;
      const posts = this.user.posts.filter((post) => post.tags.includes(tag));

      this.filteredPosts = posts;
      this.tab = "filtered-posts";
    },
    showPost(id) {
      const postIdx = this.user.posts.map((p) => p.id).indexOf(id);
      const post = JSON.parse(JSON.stringify(this.user.posts[postIdx]));
      this.$router.push(
        "/article/" + this.user.id + "/" + id + "/" + post.title
      );
    },
    showConnections(tab) {
      if (this.displayConnections == tab) {
        this.displayConnections = null;
        this.storeUpdates.forEach((update) => {
          this.$store.commit(update.action, update.data);
        });
        return;
      }
      this.displayConnections = tab;
    },
    showProfile(profile) {
      this.$router.push("/profile/" + profile.id);
    },
    showEdit(event, post) {
      event.stopPropagation();
      this.selectedPost = post;
      this.tab = "edit-post";
    },
    showDelete(event, id) {
      event.stopPropagation();
      this.popupMessage = {
        type: "delete",
        msg: "Are you sure you want to delete this article?",
        data: id,
      };
    },
    async follow(id) {
      const userId = JSON.parse(localStorage.getItem("user")).id;

      const QUERY = {
        query: `
            mutation{
              follow(id: ${id}, userId: ${userId}){
                name
                id
                picture
                tag
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
        this.$store.commit("pushNotification", {
          type: "error",
          data: "Could not save follow. Please try again.",
        });
        return;
      }

      const data = await response.json();

      if (data.errors) {
        this.$store.commit("pushNotification", {
          type: "error",
          data: data.errors[0].message,
        });
        return;
      }

      const idx = this.following.map((fol) => fol.id).indexOf(-Math.abs(id));
      if (idx !== -1) {
        this.following[idx].id = id;
        return;
      }
      this.following.push(data.data.follow);
      this.storeUpdates.push({ action: "follow", data: data.data.follow });
      this.$store.commit("pushPendingUpdate", {
        action: "follow",
        data: data.data.follow,
      });
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
        this.$store.commit("pushNotification", {
          type: "error",
          data: "Could not save unfollow. Please try again.",
        });
        return;
      }

      const data = await response.json();

      if (data.errors) {
        this.$store.commit("pushNotification", {
          type: "error",
          data: data.errors[0].message,
        });
        return;
      }

      const idx = this.following.map((fol) => fol.id).indexOf(id);
      this.following[idx].id = -Math.abs(id);
      this.storeUpdates.push({ action: "unfollow", data: idx });
      this.$store.commit("pushPendingUpdate", {
        action: "unfollow",
        data: idx,
      });
    },
    async submitPrompt() {
      const textbox = document.getElementById("ai-textbox");
      const prompt = textbox.innerText;
      const checkIfEmpty = prompt.trim();

      if (prompt == "" || !checkIfEmpty.length) {
        this.errorAi = "Please provide a prompt.";
        return;
      }

      let response;

      try {
        response = await fetch("http://localhost:3000/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });
      } catch (e) {
        this.errorAi = "Couldn't connect to server. Please try again.";
        return;
      }

      if (!response.ok) {
        const msg = await response.json();
        this.errorAi = msg.message;
        return;
      }

      if (this.errorAi) this.errorAi = null;

      const output = await response.json();
      textbox.innerText = output.response;
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

.main-container-connection {
  display: grid;
  grid-template-columns: 1fr 18em 20em;
  height: 100%;
  width: 100%;
}

.content {
  padding: 0.5em;
  padding-bottom: 0em;
}

.content-display-connections {
  padding-right: 0em;
  padding-left: 0.5em;
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

.connections {
  padding: 0.5em;
}

.inner-container-connections {
  border-radius: 5px;
  background-color: white;
  height: 85vh;
  border: solid 2px black;
  padding: 0.5em;
  padding-bottom: 0em;
}

.followers h1,
.following h1 {
  font-family: "Pridi", serif;
  margin: 0;
}

.follow,
.follower {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.follow-info,
.follower-info {
  display: flex;
}

.follow-no-pic,
.follower-no-pic {
  font-family: "Zilla Slab", serif;
  font-size: 1.5rem;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  text-align: center;
  padding: 0.2em;
  padding-bottom: 0em;
  background-color: rgb(53, 219, 109);
}

.follow-img img {
  width: 2.5em;
  height: 2.5em;
  border-radius: 50%;
}

.follow-identifiers,
.follower-identifiers {
  margin-left: 0.3em;
}

.follow-identifiers h3,
.follower-identifiers h3 {
  margin: 0;
  font-family: "Pridi", serif;
  height: 1em;
}

.follow-identifiers span,
.follower-identifiers span {
  font-family: "Zilla Slab", serif;
  color: rgb(53, 219, 109);
}

.follow .button-unfollow,
.follower .button-unfollow {
  background-color: rgb(53, 219, 109);
  border: solid 1px black;
  border-radius: 5px;
  font-family: "Pridi", serif;
  font-size: 1rem;
  box-shadow: 2px 2px 0px black;
}

.follow .button-follow,
.follower .button-follow {
  background-color: rgb(53, 219, 109);
  border: solid 1px black;
  border-radius: 5px;
  font-family: "Pridi", serif;
  font-size: 1rem;
  box-shadow: 2px 2px 0px black;
}

.button-follow:hover,
.button-unfollow:hover {
  cursor: pointer;
}

.info {
  padding: 0.5em;
  padding-left: 0em;
  position: relative;
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
  border: solid 2px black;
  border-radius: 8px;
  box-shadow: 2px 2px 0px black;
  font-family: "Pridi", serif;
}

.user-tags span:hover {
  cursor: pointer;
}

.ai-section {
  padding: 0.3em 0em;
}

.ai-box {
  background-color: white;
  border: solid 2px black;
  padding: 0.5em;
  border-radius: 5px;
  font-family: "Pridi", serif;
}

.ai-name {
  display: flex;
  align-items: center;
}

.ai-name h1 {
  margin: 0;
  font-family: "Pridi", serif;
}

.ai-name span {
  margin-left: 0.5em;
  font-size: 0.8rem;
}

.ai-name span:first-child {
  font-size: 2rem;
  margin-left: 0;
}

#ai-textbox {
  height: 12em;
  border: solid 2px black;
  border-radius: 5px;
  margin-bottom: 0.5em;
  overflow: scroll;
  user-select: text;
  word-break: break-word;
  white-space: pre-wrap;
  font-family: "Zilla Slab", serif;
  font-size: 1.2rem;
  padding: 0.3em;
}

#ai-textbox::-webkit-scrollbar {
  display: block;
}

#ai-textbox::-webkit-scrollbar-track {
  background-color: transparent;
}

#ai-textbox::-webkit-scrollbar-thumb {
  background: rgb(15, 15, 15);
  border-radius: 10px;
  border: solid rgb(255, 255, 255) 3px;
}

.ai-box button {
  background-color: rgb(53, 219, 109);
  border: solid 2px black;
  box-shadow: 2px 2px 0px black;
  font-family: "Pridi", serif;
  font-size: 1rem;
  border-radius: 5px;
  padding: 0.3em;
}

.btn {
  display: flex;
  justify-content: end;
}

.ai-box button:hover {
  cursor: pointer;
}
</style>
