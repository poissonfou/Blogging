<template>
  <div id="wrapper-board">
    <the-popup :content="popupMessage" :confirmDelete="deletePost"></the-popup>
    <the-AI-button
      :submitPrompt="submitPrompt"
      v-if="(tab == 'add-post' || tab == 'edit-post') && adjustProfileDisplay"
    ></the-AI-button>
    <image-picker
      :closePopup="toggleImageSelector"
      :updateUser="updateUser"
      v-if="displayImageSelector"
    ></image-picker>
    <main class="main-container" id="grid">
      <section class="user-info-container" v-if="adjustProfileDisplay">
        <div class="user">
          <div class="user-inner-container">
            <div>
              <div class="user-picture-box">
                <span class="material-symbols-outlined" @click="showImageUI">
                  add_a_photo
                </span>
                <div v-if="!user.picture" class="no-pic">
                  {{ user.name[0] }}
                </div>
                <div v-else class="img">
                  <img
                    :src="'http://localhost:3000/images/' + user.picture"
                    alt="user picture"
                  />
                </div>
              </div>
              <div class="user-identifiers-and-followers">
                <div>
                  <h3>{{ user.name }}</h3>
                  <span>{{ user.tag }}</span>
                </div>
                <div class="follow-info">
                  <span @click="showConnections('followers')">{{
                    `Followers ${user.followers.length}`
                  }}</span>
                  <span @click="showConnections('following')">{{
                    `Following ${user.following.length}`
                  }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="navigation">
            <div class="tabs">
              <span @click="changeTab('posts')">Posts</span>
              <span @click="changeTab('feed')">Feed</span>
            </div>
            <div class="link">
              <router-link to="/auth?mode='update'">Update info</router-link>
            </div>
          </div>
        </div>
        <div>
          <div
            v-if="
              tab !== 'add-post' &&
              tab !== 'display-post' &&
              tab !== 'edit-post'
            "
            class="user-tags-adjusted-display"
          >
            <div class="toggle-container" @click="toggleTagsDisplay">
              <span>Tags</span>
              <span class="toggle-arrow spin-arrow" id="toggle-arrow">^</span>
            </div>
            <div class="tags hide-tags" id="tags">
              <span
                v-for="[index, tag] in tagsUserArticles.entries()"
                :key="index"
                @click="filterPosts"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </section>
      <section class="content" id="content">
        <div class="content-inner-container">
          <div
            v-if="tab == 'posts' || tab == 'filtered-posts'"
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
          <div v-if="tab == 'loading'">
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                opacity=".25"
                fill="#FFFFFF"
              />
              <path
                d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                class="spinner_z9k8"
                fill="#2ebe5e"
              />
            </svg>
          </div>
          <div v-if="tab == 'feed'" class="feed">
            <the-post-miniature
              v-for="[index, post] in feed.entries()"
              :key="index"
              :post="post"
              @click="showPost(post.id, post.title)"
            >
            </the-post-miniature>
          </div>
          <div v-if="tab == 'posts'" class="posts">
            <div v-if="user.posts.length">
              <the-post-miniature
                v-for="[index, post] in user.posts.entries()"
                :key="index"
                :post="post"
                :edit="showEdit"
                :deletion="showDelete"
                @click="showPost(post.id, post.title)"
              >
              </the-post-miniature>
            </div>
            <div v-else class="no-posts">
              <img src="/images/no-posts.png" alt="illustration" />
              <!-- <a href="https://storyset.com/idea">Idea illustrations by Storyset</a> -->
              <div class="call-for-action">
                <h2>Write your first post!</h2>
                <button @click="changeTab('add-post')">Get started</button>
              </div>
            </div>
          </div>
          <div v-if="tab == 'filtered-posts'" class="posts">
            <the-post-miniature
              v-for="[index, post] in filteredPosts.entries()"
              :key="index"
              :post="post"
              :edit="showEdit"
              :deletion="deletePost"
              @click="showPost(post.id, post.title)"
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
          <div v-if="tab == 'connections'">
            <div class="inner-container-connections connections-tab-display">
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
                        :src="
                          'http://localhost:3000/images/' + follower.picture
                        "
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
                    v-if="
                      following.map((fol) => fol.id).indexOf(follow.id) !== -1
                    "
                  >
                    <button
                      @click="unfollow(follower.id)"
                      class="button-unfollow"
                    >
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
                  v-for="[index, foll] in following.entries()"
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
                    v-if="
                      following.map((fol) => fol.id).indexOf(foll.id) !== -1
                    "
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
          </div>
        </div>
      </section>
      <section
        class="connections"
        v-if="displayConnections && !adjustConnectionsDisplay"
      >
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
      <section class="info" v-if="!adjustProfileDisplay">
        <user-info
          :user="user"
          :changeTab="changeTab"
          :showConnections="showConnections"
          :showImageUI="toggleImageSelector"
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
              <div>
                <span class="material-symbols-outlined"> robot_2 </span>
                <h1>Phil</h1>
                <span>
                  <i class="bi bi-google"></i>
                  Gemini
                </span>
              </div>
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                class="hidden"
                id="loading-spinner-ai"
              >
                <path
                  d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                  opacity=".25"
                  fill="#FFFFFF"
                />
                <path
                  d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                  class="spinner_z9k8"
                  fill="#2ebe5e"
                />
              </svg>
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
import ImagePicker from "../components/ImagePicker.vue";
import TheAIButton from "../components/TheAIButton.vue";

export default {
  components: {
    TheNewPost,
    UserInfo,
    ThePostMiniature,
    ThePopup,
    ImagePicker,
    TheAIButton,
  },
  data() {
    return {
      filteredPosts: [],
      tagsUserArticles: [],
      feed: [],
      tab: "loading",
      selectedPost: null,
      displayConnections: null,
      displayImageSelector: false,
      adjustConnectionsDisplay: false,
      adjustProfileDisplay: false,
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

      if (this.displayConnections && !this.adjustConnectionsDisplay) {
        grid.classList = "main-container-connection";
        contentDiv.classList = "content-display-connections";
      }

      if (!this.displayConnections && !this.adjustConnectionsDisplay) {
        grid.classList = "main-container";
        contentDiv.classList = "content";
      }
    },
    adjustConnectionsDisplay() {
      const grid = document.getElementById("grid");
      const contentDiv = document.getElementById("content");

      if (this.displayConnections && this.adjustConnectionsDisplay) {
        this.tab = "connections";
        grid.classList = "main-container";
        contentDiv.classList = "content";
      }

      if (this.displayConnections && !this.adjustConnectionsDisplay) {
        if (this.tab == "connections") this.tab = "posts";
        grid.classList = "main-container-connection";
        contentDiv.classList = "content-display-connections";
      }
    },
    adjustProfileDisplay() {
      const grid = document.getElementById("grid");

      if (this.adjustProfileDisplay) {
        grid.classList = "main-container-double-row-display";
      } else {
        grid.classList = "main-container";
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
      const { id, token } = JSON.parse(localStorage.getItem("user"));
      const route = this.$route.path;

      if (!id || typeof id !== "number") {
        this.error = "Invalid id, please login again.";
        return;
      }

      const QUERY = {
        query: `
          {
             getUser(id: ${id}, route: "${route}", token: "${token}" ){
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
        if(data.errors[0].status == 401){
          setTimeout(() => {
            this.$store.commit("setUser", {
              id: null,
              name: "",
              picture: "",
              posts: [],
              followers: [],
              following: [],
            });
            localStorage.setItem("user", null);
            this.$router.push("/home");
          }, 3000);
        }
        return;
      }

      const user = data.data.getUser;

      const posts = user.posts;
      const tags = new Set([]);

      for (let i = 0; i < posts.length; i++) {
        posts[i].tags.map((el) => tags.add(el));
      }

      this.tagsUserArticles = [...tags];
      this.followers = JSON.parse(JSON.stringify(user.followers));
      this.following = JSON.parse(JSON.stringify(user.following));
      this.$store.commit("setUser", user);
      this.tab = "posts";
    },
    async fetchFeed() {
      const { token } = JSON.parse(localStorage.getItem("user"));

      const QUERY = {
        query: `
          {
	          getFeed(token: "${token}") {
              data {
                id
                tags
                title
                abstract
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

      this.feed = data.data.getFeed.data;
      console.log(data.data.getFeed.data);
    },
    updateUser(newUser) {
      this.$store.commit("setUser", newUser);
    },
    async changeTab(tab) {
      if (this.tab !== "feed" && tab == "feed") {
        await this.fetchFeed();
      }
      this.tab = tab;
    },
    async addPost(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const title = form.get("title");
      const abstract = form.get("abstract");
      const body = document.getElementById("body").innerHTML;
      const { token } = JSON.parse(localStorage.getItem("user"));
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
        )}, images: ${JSON.stringify([])}, token: "${token}"}){
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
      const { token } = JSON.parse(localStorage.getItem("user"));
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
        )}, tags: ${JSON.stringify(tags)}, postId: ${id}, token: "${token}"}){
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
      const { token } = JSON.parse(localStorage.getItem("user"));
      const popup = document.getElementById("popup");
      const backdrop = document.getElementById("backdrop");
      popup.classList.add("hidden");
      popup.classList.remove("show-popup");
      backdrop.classList.add("none");

      const QUERY = {
        query: `
          mutation{
	          deletePost(id: ${id}, token: "${token}"){
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

      const tags = new Set([]);

      for (let i = 0; i < this.user.posts.length; i++) {
        this.user.posts[i].tags.map((el) => tags.add(el));
      }

      this.tagsUserArticles = [...tags];
    },
    filterPosts(event) {
      const tag = event.target.innerText;
      const posts = this.user.posts.filter((post) => post.tags.includes(tag));

      this.filteredPosts = posts;
      this.tab = "filtered-posts";
    },
    showPost(id, title) {
      this.$router.push("/article/" + id + "/" + title);
    },
    showConnections(tab) {
      if (this.displayConnections == tab) {
        this.displayConnections = null;
        if (this.adjustConnectionsDisplay) this.tab = "posts";
        return;
      }
      this.displayConnections = tab;
      if (this.adjustConnectionsDisplay) this.tab = "connections";
    },
    toggleImageSelector() {
      console.log("here");
      this.displayImageSelector = !this.displayImageSelector;
    },
    toggleTagsDisplay() {
      const arrowToggle = document.getElementById("toggle-arrow");
      const tagsContainer = document.getElementById("tags");
      arrowToggle.classList.toggle("spin-arrow");
      tagsContainer.classList.toggle("hide-tags");
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
      const { token } = JSON.parse(localStorage.getItem("user"));

      const QUERY = {
        query: `
            mutation{
              follow(id: ${id}, token: "${token}"){
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
      const { token } = JSON.parse(localStorage.getItem("user"));

      const QUERY = {
        query: `
            mutation{
              unfollow(id: ${id}, token: "${token}"){
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
      const loadingSpinner = document.getElementById("loading-spinner-ai");
      const prompt = textbox.innerText;
      const checkIfEmpty = prompt.trim();
      const { token } = JSON.parse(localStorage.getItem("user"));

      if (prompt == "" || !checkIfEmpty.length) {
        this.errorAi = "Please provide a prompt.";
        return;
      }

      let response;

      loadingSpinner.classList.remove("hidden");

      try {
        response = await fetch("http://localhost:3000/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt }),
        });
      } catch (e) {
        this.errorAi = "Couldn't connect to server. Please try again.";
        loadingSpinner.classList.add("hidden");
        return;
      }

      if (!response.ok) {
        const msg = await response.json();
        this.errorAi = msg.message;
        loadingSpinner.classList.add("hidden");
        return;
      }

      if (this.errorAi) this.errorAi = null;

      loadingSpinner.classList.add("hidden");

      const output = await response.json();
      textbox.innerText = output.response;
    },
  },
  mounted() {
    this.fetchUser();
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 1000 && !this.adjustConnectionsDisplay) {
        this.adjustConnectionsDisplay = true;
      }
      if (window.innerWidth > 1000 && this.adjustConnectionsDisplay) {
        this.adjustConnectionsDisplay = false;
      }

      if (window.innerWidth <= 750 && !this.adjustProfileDisplay) {
        this.adjustProfileDisplay = true;
      }
      if (window.innerWidth > 750 && this.adjustProfileDisplay) {
        this.adjustProfileDisplay = false;
      }
    });

    if (window.innerWidth <= 1000 && !this.adjustConnectionsDisplay) {
      this.adjustConnectionsDisplay = true;
    }
    if (window.innerWidth > 1000 && this.adjustConnectionsDisplay) {
      this.adjustConnectionsDisplay = false;
    }

    if (window.innerWidth <= 750 && !this.adjustProfileDisplay) {
      this.adjustProfileDisplay = true;
    }
    if (window.innerWidth > 750 && this.adjustProfileDisplay) {
      this.adjustProfileDisplay = false;
    }
  },
};
</script>

<style scoped>
#wrapper-board {
  height: 100%;
  display: flex;
  flex-flow: column;
}

.main-container {
  display: grid;
  grid-template-columns: 1fr 20em;
  height: 100%;
  width: 100%;
}

.main-container-double-row-display {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  width: 100%;
}

@media (max-width: 1000px) {
  .main-container-connection {
    display: grid;
    grid-template-columns: 1fr 15em;
    height: 100%;
    width: 100%;
  }
}

@media (max-width: 750px) {
  .main-container {
    display: grid;
    grid-template-columns: 1fr 15em;
    height: 100%;
    width: 100%;
  }
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
  height: 100%;
}

.content-display-connections {
  padding-right: 0em;
  padding-left: 0.5em;
  height: 100%;
}

.content-inner-container {
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  background-color: white;
  height: 100%;
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
.search,
.feed {
  padding: 0em 1em;
  padding-top: 0.5em;
  text-align: start;
  height: 31em;
  overflow-y: scroll;
}

@media (max-width: 750px) {
  .header-content {
    padding: 0em 0.5em;
  }

  .posts,
  .search,
  .feed {
    padding: 0em 0.5em;
    padding-right: 0em;
    padding-top: 0.5em;
  }
}

.posts::-webkit-scrollbar,
.search::-webkit-scrollbar,
.feed::-webkit-scrollbar {
  display: block;
}

.posts::-webkit-scrollbar-track,
.search::-webkit-scrollbar-track,
.feed::-webkit-scrollbar-track {
  background-color: transparent;
}

.posts::-webkit-scrollbar-thumb,
.search::-webkit-scrollbar-thumb,
.feed::-webkit-scrollbar-track {
  background: rgb(15, 15, 15);
  border-radius: 10px;
  border: solid white 3px;
}

.no-posts {
  position: relative;
  margin: 0 auto;
  width: 25em;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.no-posts img {
  width: 100%;
  height: 25em;
}

.no-posts h2 {
  margin: 0em;
  font-family: "Pridi", serif;
  font-size: 2rem;
}

.no-posts button {
  border: solid 2px black;
  border-radius: 5px;
  padding: 0.1em 1.3em;
  width: fit-content;
  font-family: "Pridi", serif;
  font-size: 1.2rem;
  background-color: rgb(53, 219, 109);
}

.no-posts button:hover {
  cursor: pointer;
}

.call-for-action {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  bottom: 0;
}

.user-info-container {
  padding: 0em 0.5em;
  display: flex;
  flex-direction: column;
}

.user {
  background-color: white;
  border-radius: 5px;
  border: solid 3px black;
  display: flex;
  flex-direction: column;
  font-family: "Pridi", serif;
  padding: 0.5em;
}

@media (max-width: 750px) {
  .user {
    padding-bottom: 0.1em;
  }
}

.user div:first-child {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.user-inner-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-picture-box span {
  position: absolute;
  font-size: 2.5rem;
  left: 43%;
  top: 7%;
  color: white;
  opacity: 0;
}

.user-picture-box span:hover {
  opacity: 1;
  cursor: pointer;
}

.user .no-pic {
  background-color: rgb(46, 190, 94);
  width: fit-content;
  padding: 0.7rem 1em;
  border-radius: 5em;
  color: white;
  font-size: 1.5rem;
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

.user h3 {
  margin: 0;
}

.img img {
  width: 4.2em;
  height: 4.2em;
  border-radius: 50%;
  margin-top: 0.1em;
}

.user-identifiers-and-followers div:first-child {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.navigation {
  display: flex;
  align-items: center;
}

.link {
  width: 100%;
  text-align: right;
}

.link a {
  text-decoration: none;
  padding-right: 0.5em;
  font-size: 0.8rem;
  color: gray;
}

.follow-info span,
.tabs span {
  margin-right: 0.5em;
}

.follow-info span:hover {
  cursor: pointer;
}

.tabs {
  font-weight: bold;
  font-size: 1.5rem;
  color: rgb(53, 219, 109);
}

.tabs span:hover {
  cursor: pointer;
}

@media (max-width: 750px) {
  .navigation {
    margin-top: 0.5em;
  }

  .tabs {
    font-size: 1.2rem;
    margin-left: 0.5em;
  }

  .user-picture-box .no-pic {
    padding: 0.5em 0.8em;
  }
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

.connections-tab-display {
  border: none;
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
  border: solid 3px black;
  margin-top: 0.3em;
  border-radius: 5px;
}

.user-tags-adjusted-display {
  background-color: white;
  padding: 0.5em;
  border: solid 3px black;
  margin-top: 0.3em;
  border-radius: 5px;
}

.toggle-container {
  font-family: "Pridi", serif;
  font-weight: bold;
  font-size: 1.5rem;
  display: flex;
  gap: 0.2em;
}

.toggle-container:hover {
  cursor: pointer;
}

.toggle-arrow {
  transform: rotateZ(0deg) translateY(0.2em);
  transition: all 0.3s;
}

.spin-arrow {
  transform: rotateZ(180deg) translateY(0.2em);
  transition: all 0.3s;
}

.tags {
  display: block;
  transition: all 0.3s;
}

.tags span,
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

.hide-tags {
  display: none;
  transition: all 0.3s;
}

.user-tags span:hover,
.tags span:hover {
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
  justify-content: space-between;
}

.ai-name div {
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

.spinner_z9k8 {
  transform-origin: center;
  animation: spinner_StKS 0.75s infinite linear;
}

.content-inner-container svg {
  display: block;
  margin: auto;
  margin-top: 30%;
}

@keyframes spinner_StKS {
  100% {
    transform: rotate(360deg);
  }
}

.hidden {
  display: none;
}
</style>
