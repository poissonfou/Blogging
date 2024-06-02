<template>
  <div class="post-body">
    <the-popup :content="popupMessage"></the-popup>
    <div class="header">
      <h1>{{ post.title }}</h1>
      <h3>{{ post.abstract }}</h3>

      <div class="author-info">
        <div @click="redirectProfile(post.author.id)">
          <div v-if="!post.author.picture" class="no-pic">
            {{ post.author.name[0] }}
          </div>
          <div v-else class="img">
            <img
              :src="'http://localhost:3000/images/' + post.author.picture"
              alt="user picture"
            />
          </div>
          <span>{{ post.author.name }}</span>
        </div>
        <span>
          | <span>Posted at: {{ post.createdAt }}</span
          ><span v-if="post.updated">
            | Edited: {{ post.updatedAt }}</span
          ></span
        >
      </div>
    </div>
    <div id="body"></div>
    <div class="tags-box">
      <h2>Tags:</h2>
      <div class="tags">
        <span
          v-for="[index, tag] in post.tags.entries()"
          :key="index"
          class="tag"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="new-comment">
      <the-form @submit="postComment">
        <div class="input-box">
          <label for="comment">Write a comment</label>
          <textarea
            name="comment"
            id="comment"
            cols="20"
            rows="5"
            v-model="comment"
          ></textarea>
        </div>
        <button>Comment</button>
      </the-form>
    </div>
    <div class="comments">
      <h1>Comments</h1>
      <div v-if="comments.status == 'loading'">
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
      <div v-if="comments.val.length">
        <div
          v-for="[index, comment] in comments.val.entries()"
          :key="index"
          class="comment"
        >
          <div
            class="comment-author"
            @click="redirectProfile(comment.author.id)"
          >
            <div v-if="!comment.author.picture" class="no-pic-comment">
              {{ comment.author.name[0] }}
            </div>
            <div v-else class="img-comment">
              <img
                :src="'http://localhost:3000/images/' + comment.author.picture"
                alt="user picture"
              />
            </div>
            <span>{{ comment.author.name }}</span>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
          <div class="buttons">
            <div>
              <span
                :class="`${'material-symbols-outlined'} ${
                  comment.likes.includes(userId) ? 'button-selected' : ''
                }`"
                @click="commentInteraction('likes', comment.id)"
                id="likes"
              >
                thumb_up
              </span>
              <span>{{ comment.likes.length }}</span>
            </div>
            <div>
              <span
                :class="`${'material-symbols-outlined'} ${
                  comment.dislikes.includes(userId) ? 'button-selected' : ''
                }`"
                @click="commentInteraction('dislikes', comment.id)"
                id="dislikes"
              >
                thumb_down </span
              ><span>{{ comment.dislikes.length }}</span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="!comments.val.length && comments.status == 'done'"
        class="no-comments"
      >
        <h2>Be the first to comment!</h2>
      </div>
    </div>
  </div>
</template>

<script>
import TheForm from "../components/TheForm.vue";
import ThePopup from "../components/ThePopup.vue";

export default {
  data() {
    return {
      post: {
        author: { name: "", picture: null },
        title: "",
        abstract: "",
        body: "",
        id: null,
        tags: [],
        createdAt: null,
        updatedAt: null,
        updated: null,
      },
      comments: { val: [], status: "loading" },
      comment: "",
      popupMessage: {
        type: "",
        msg: "",
        data: null,
      },
    };
  },
  components: {
    TheForm,
    ThePopup,
  },
  computed: {
    userId() {
      return this.$store.state.user.id;
    },
  },
  methods: {
    async fetchPost(postId) {
      const QUERY = {
        query: `
          {
             getPost(postId: ${postId}){
              author {
                id
                picture
                name
              }
               id
               title
               abstract
               body
               tags
               createdAt
               updatedAt
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
          msg: "Could not connect to server. Please reload.",
          data: null,
        };
        return;
      }

      const responseData = await response.json();

      if (responseData.errors) {
        if (responseData.errors[0].status == 401) {
          this.popupMessage = {
            type: "error",
            msg: "Please login to comment.",
            data: null,
          };
        }

        this.popupMessage = {
          type: "error",
          msg: responseData.errors[0].message,
          data: null,
        };
        return;
      }
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dateFormat = new Intl.DateTimeFormat("pt-BR", { timeZone: tz });

      const createdAt = dateFormat.format(
        new Date(+responseData.data.getPost.createdAt)
      );
      const updatedAt = dateFormat.format(
        new Date(+responseData.data.getPost.updatedAt)
      );
      const updated =
        +responseData.data.getPost.createdAt !==
        +responseData.data.getPost.updatedAt;

      console.log(
        +responseData.data.getPost.createdAt !==
          +responseData.data.getPost.updatedAt
      ),
        (this.post = {
          ...responseData.data.getPost,
          createdAt,
          updatedAt,
          updated,
        });
    },
    async fetchComments() {
      const postId = this.post.id;
      const QUERY = {
        query: `
        {
            getComments(postId: ${+postId}){
            author {
              id
              name
              picture
            }
            content
            likes
            dislikes
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
          msg: "Something went wrong. Please reload.",
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
      this.comments = { val: responseData.data.getComments, status: "done" };
    },
    async postComment(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const comment = form.get("comment");
      const { token, id } = JSON.parse(localStorage.getItem("user"));
      const postId = this.$route.params.id;

      if (!comment.length && !comment.replace(/\s/g, "").length) return;

      if (!postId && typeof +postId !== "number") {
        this.popupMessage = {
          type: "error",
          msg: "Something went wrong. Please reload.",
          data: null,
        };
      }

      const QUERY = {
        query: `
        mutation{
	          comment(postId: ${+postId}, comment: "${comment}", token: "${token}"){
            author {
              name
              id
              picture
            }
            content
            likes
            dislikes
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
          msg: "Something went wrong. Please reload.",
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

      this.comment = "";
      this.comments.unshift({
        author: {
          name: this.$store.state.user.name,
          id: id,
          picture: this.$store.state.user.picture,
        },
        content: responseData.data.comment.content,
        likes: responseData.data.comment.likes,
        dislikes: responseData.data.comment.dislikes,
      });
    },
    async redirectProfile(id) {
      this.$router.push("/profile/" + id);
    },
    async commentInteraction(type, commentId) {
      const { token, userId } = JSON.parse(localStorage.getItem("user"));

      const idxComment = this.post.comments.map((c) => c.id).indexOf(commentId);
      const oppositeAction = type == "likes" ? "dislikes" : "likes";
      const isSelected = this.post.comments[idxComment][type].indexOf(userId);
      const button = document.getElementById(type);
      const oppositeButton = document.getElementById(oppositeAction);

      const copyArrType = JSON.parse(
        JSON.stringify(this.post.comments[idxComment][type])
      );
      const copyArrOpposite = JSON.parse(
        JSON.stringify(this.post.comments[idxComment][oppositeAction])
      );
      let reserveButtonAction;

      if (isSelected !== -1) {
        const idxUser = this.post.comments[idxComment][type].indexOf(userId);
        this.post.comments[idxComment][type].splice(idxUser, 1);
        button.classList.remove("button-selected");
        reserveButtonAction = "add";
      } else {
        const oppositeArr = this.post.comments[idxComment][oppositeAction];
        const oppositeIdx = oppositeArr.indexOf(userId);

        if (oppositeIdx !== -1) {
          oppositeButton.classList.remove("button-selected");
          this.post.comments[idxComment][oppositeAction].splice(oppositeIdx, 1);
        }

        this.post.comments[idxComment][type].push(userId);
        button.classList.add("button-selected");
        reserveButtonAction = oppositeIdx == -1 ? "remove" : "add&remove";
      }

      const QUERY = {
        query: `
        mutation{
          commentInteraction(type: "${type}", token: "${token}" , commentId: ${+commentId}){
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
        console.log("Couldn't connect to server.");
        this.post.comments[idxComment][type] = copyArrType;
        this.post.comments[idxComment][oppositeAction] = copyArrOpposite;
        if (reserveButtonAction == "add") {
          button.classList.add("button-selected");
        } else if (reserveButtonAction == "remove") {
          button.classList.remove("button-selected");
        } else {
          button.classList.remove("button-selected");
          oppositeButton.classList.add("button-selected");
        }
        return;
      }

      const responseData = await response.json();

      if (!responseData.errors) {
        if (responseData.errors[0].status == 401) {
          this.popupMessage = {
            type: "error",
            msg: "Please login to interact with comments.",
            data: null,
          };
        }
        console.log("something went wrong", responseData.errors[0].message);
        this.post.comments[idxComment][type] = copyArrType;
        this.post.comments[idxComment][oppositeAction] = copyArrOpposite;
        if (reserveButtonAction == "add") {
          button.classList.add("button-selected");
        } else {
          button.classList.remove("button-selected");
        }
        return;
      }
    },
  },
  async mounted() {
    await this.fetchPost(this.$route.params.id);
    const body = document.getElementById("body");
    body.innerHTML = this.post.body;
    await this.fetchComments();
  },
};
</script>

<style scoped>
.post-body {
  background-color: white;
  border: solid 3px black;
  border-bottom: none;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  margin: 0em 5em;
  margin-top: 2em;
  padding: 0.5em 2em;
}

@media (max-width: 1000px) {
  .post-body {
    margin: 0em 2em;
    margin-top: 2em;
  }
}

@media (max-width: 650px) {
  .post-body {
    margin: 0em 1em;
    margin-top: 2em;
  }
}

.header h1 {
  font-size: 3rem;
  margin: 0em;
  font-family: "Pridi", serif;
}

.header h3 {
  font-family: "Zilla Slab", serif;
  color: rgb(138, 136, 136);
  font-size: 1.8rem;
  margin: 0em;
}

.author-info {
  display: flex;
  align-items: center;
  padding: 0.5em 0em;
}

.author-info div:first-child {
  display: flex;
  align-items: center;
}

.author-info div:first-child:hover {
  cursor: pointer;
}

.author-info span {
  font-size: 1.1rem;
  font-family: "Zilla Slab", serif;
}

.author-info div:first-child span {
  margin: 0em 0.5em;
}

.no-pic {
  background-color: rgb(46, 190, 94);
  width: fit-content;
  padding: 0.3rem 0.8em;
  border-radius: 5em;
  color: white;
  font-size: 1.2rem;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.img {
  display: flex;
  justify-content: center;
  background-color: rgb(46, 190, 94);
  border-radius: 50%;
  padding: 0.2em;
  color: white;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.img img {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  margin-top: 0.1em;
}

.tags {
  margin-top: 0.2em;
  margin-bottom: 0.5em;
}

.tag {
  display: inline-block;
  margin-right: 0.3em;
  background: rgb(64, 89, 173);
  border: solid 2px black;
  box-shadow: 2px 2px 0px black;
  padding: 0.5em 0.8em;
  border-radius: 8px;
  font-size: 1rem;
  font-family: "Pridi", serif;
}

#body {
  padding: 1em 0em;
  font-family: "Zilla Slab", serif;
  font-size: 1.5rem;
  word-wrap: break-word;
}

.tags-box {
  margin-top: 2rem;
  border-top: solid 1px black;
}

.tags-box h2 {
  margin: 0;
  font-family: "Pridi", serif;
}

.new-comment {
  margin-top: 2em;
}

.new-comment textarea {
  resize: none;
  border: solid 2px black;
  border-radius: 5px;
  font-size: 1.3rem;
  font-family: "Zilla Slab", serif;
}

.comments h1 {
  font-family: "Pridi", serif;
  margin-bottom: 0;
}

.no-comments {
  display: flex;
  justify-content: center;
  font-family: "Zilla Slab", serif;
}

.comment {
  border: solid 2px black;
  padding: 1em;
  border-radius: 5px;
  margin: 0.5em 0em;
}

.comment-author {
  display: flex;
  align-items: center;
  font-family: "Pridi", serif;
}

.comment-author:hover {
  cursor: pointer;
}

.comment-author span {
  margin-left: 0.5em;
}

.no-pic-comment {
  background-color: rgb(46, 190, 94);
  width: fit-content;
  padding: 0.5rem 0.8em;
  border-radius: 5em;
  color: white;
  font-size: 1.2rem;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.img-comment {
  display: flex;
  justify-content: center;
  background-color: rgb(46, 190, 94);
  border-radius: 50%;
  padding: 0.2em;
  color: white;
  font-family: "Pridi", serif;
  margin-top: 0.2em;
}

.img-comment img {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  margin-top: 0.1em;
}

.comment-content {
  font-family: "Pridi", serif;
  font-size: 1.3rem;
}

.buttons {
  display: flex;
  gap: 1em;
}

.buttons div {
  display: flex;
  align-items: center;
  margin-top: 1em;
}

@media (max-width: 800px) {
  .post-body {
    padding: 0.5em 0.8em;
  }

  .header h1 {
    font-size: 2.7rem;
  }

  .header h3 {
    font-size: 1.5rem;
  }

  .author-info span {
    font-size: 1rem;
  }

  .no-pic {
    background-color: rgb(46, 190, 94);
    width: fit-content;
    padding: 0.3rem 0.8em;
    border-radius: 5em;
    color: white;
    font-size: 1.2rem;
    font-family: "Pridi", serif;
    margin-top: 0.2em;
  }

  .img img {
    width: 2.5em;
    height: 2.5em;
  }

  .tag {
    font-size: 0.8rem;
  }

  #body {
    font-size: 1.3rem;
  }

  .new-comment label {
    font-size: 1.3rem;
  }

  .new-comment button {
    font-size: 1.3rem;
  }

  .comments h1 {
    font-size: 2rem;
  }

  .no-pic-comment {
    padding: 0.4rem 0.8em;
  }

  .comment-content {
    font-size: 1.1rem;
  }
}

@media (max-width: 500px) {
  .header h1 {
    font-size: 2.5rem;
    word-wrap: break-word;
  }
}

.buttons .material-symbols-outlined:hover {
  cursor: pointer;
}

.button-selected {
  color: rgb(46, 190, 94);
}

.spinner_z9k8 {
  transform-origin: center;
  animation: spinner_StKS 0.75s infinite linear;
}

svg {
  display: block;
  margin: auto;
  margin-top: 3em;
  margin-bottom: 3em;
}

@keyframes spinner_StKS {
  100% {
    transform: rotate(360deg);
  }
}
</style>
