<template>
  <div id="wrapper-board">
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
          <div v-if="tab == 'add-post'">
            <the-new-post :submitFunction="addPost"></the-new-post>
          </div>
          <div v-if="tab == 'edit-post'">
            <the-new-post
              :submitFunction="editPost"
              :titleProp="selectedPost.title"
              :abstractProp="selectedPost.abstract"
              :bodyProp="selectedPost.body"
              :tagsProps="selectedPost.tags"
              :idProp="selectedPost.id"
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
                v-if="followers.map((fol) => fol.id).indexOf(follow.id) !== -1"
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
              v-for="[index, follow] in following.entries()"
              :key="index"
              class="follow"
            >
              <div class="follow-info">
                <div v-if="!follow.picture" class="follow-no-pic">
                  {{ follow.name[0] }}
                </div>
                <div v-else class="follow-img">
                  <img
                    :src="'http://localhost:3000/images/' + follow.picture"
                    alt="profile-picture"
                  />
                </div>
                <div>
                  <div class="follow-identifiers">
                    <h3>{{ follow.name }}</h3>
                    <span>{{ follow.tag }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="following.map((fol) => fol.id).indexOf(follow.id) !== -1"
              >
                <button @click="unfollow(follow.id)" class="button-unfollow">
                  Unfollow
                </button>
              </div>
              <div v-else>
                <button @click="follow(follow.id)" class="button-follow">
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
        <div class="notifications">
          <the-notification
            v-for="notif in notifications"
            :key="notif.data.id"
            :notification="notif"
          ></the-notification>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import TheNewPost from "../components/TheNewPost.vue";
import UserInfo from "../components/UserInfo.vue";
import TheNotification from "../components/TheNotification.vue";

import openSocket from "socket.io-client";

export default {
  data() {
    return {
      filteredPosts: [],
      tagsUserArticles: [],
      tab: "posts",
      selectedPost: null,
      notifications: [],
      displayConnections: null,
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
    followers() {
      return this.$store.state.user.followers;
    },
    following() {
      return this.$store.state.user.following;
    },
  },
  components: {
    TheNewPost,
    UserInfo,
    TheNotification,
  },
  methods: {
    async fetchUser() {
      const id = JSON.parse(localStorage.getItem("user")).id;

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

      const data = await response.json();
      const user = data.data.getUser;

      if (user.errors) {
        throw new Error(user.errors[0].message);
      }

      console.log(user);

      const posts = user.posts;
      const tags = [];

      for (let i = 0; i < posts.length; i++) {
        let tagsPost = posts[i].tags;

        for (let j = 0; j < tagsPost.length; j++) {
          if (!tags.includes(tagsPost[j])) tags.push(tagsPost[j]);
        }
      }

      for (let i = 0; i < user.followers.length; i++) {
        user.followers[i] = JSON.parse(user.followers[i]);
      }

      for (let j = 0; j < user.following.length; j++) {
        user.following[j] = JSON.parse(user.following[j]);
      }

      this.tagsUserArticles = tags;
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
      this.$store.commit("addPost", post);

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
      this.$store.commit("editPost", { idx: oldPostIdx, post });

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
      this.$store.commit("deletePost", postIdx);

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
      const postIdx = this.user.posts.map((p) => p.id).indexOf(id);
      const post = JSON.parse(JSON.stringify(this.user.posts[postIdx]));
      this.$router.push(
        "/article/" + this.user.id + "/" + id + "/" + post.title
      );

      // const dateCreation = new Date(+post.createdAt);
      // const dateUpdate = new Date(+post.updatedAt);
      // post.createdAt =
      //   dateCreation.getUTCDay() +
      //   "/" +
      //   dateCreation.getUTCMonth() +
      //   "/" +
      //   dateCreation.getUTCFullYear();
      // +" " + dateCreation.getHours();
      // +"h" + dateCreation.getMinutes();
      // +"m" + dateCreation.getSeconds();

      // post.updatedAt =
      //   dateUpdate.getUTCDay() +
      //   "/" +
      //   dateUpdate.getUTCMonth() +
      //   "/" +
      //   dateUpdate.getUTCFullYear() +
      //   " " +
      //   dateUpdate.getHours();
      // +"h" + dateUpdate.getMinutes();
      // +"m" + dateUpdate.getSeconds();
      // this.selectedPost = post;
    },
    showConnections(tab) {
      if (this.displayConnections == tab) {
        this.displayConnections = null;
        return;
      }
      this.displayConnections = tab;
    },
    showProfile(profile) {
      this.$router.push("/profile/" + profile.id);
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

      const data = await response.json();

      console.log(data);

      this.$store.commit("follow", data.data.follow);
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

      const idx = this.$store.state.user.following
        .map((fol) => fol.id)
        .indexOf(id);
      this.$store.commit("unfollow", idx);
    },
  },
  created() {
    this.fetchUser();

    const socket = openSocket("http://localhost:3000", {
      transports: ["websocket", "polling", "flashsocket"],
    });

    socket.on("follow", (data) => {
      if (data.following !== this.user.tag) return;
      if (data.action == "follow") {
        this.notifications.push({
          data: data.follower,
          type: "follow",
        });
        this.$store.commit("followed", data.follower.id);
      }
    });

    socket.on("post", (data) => {
      if (!this.$store.state.user.following.includes(String(data.user.id)))
        return;
      if (data.action == "post") {
        this.notifications.push({ data: data.user, type: "post" });
      }
    });
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
}

.follow .button-follow,
.follower .button-follow {
  background-color: rgb(53, 219, 109);
  border: solid 1px black;
  border-radius: 5px;
  font-family: "Pridi", serif;
  font-size: 1rem;
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
  border-radius: 8px;
  font-family: "Zilla Slab", serif;
}

.user-tags span:hover {
  cursor: pointer;
}

.notifications {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  right: 0.1em;
  bottom: 0.1em;
  width: 100%;
  overflow: hidden;
}
</style>
