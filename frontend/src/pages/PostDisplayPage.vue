<template>
  <div class="display-body">
    <div class="header">
      <h1>{{ post.title }}</h1>
      <h3>{{ post.abstract }}</h3>
      <div class="tags">
        <span
          v-for="[index, tag] in post.tags.entries()"
          :key="index"
          class="tag"
        >
          {{ tag }}
        </span>
      </div>

      <div class="author-info">
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
    </div>
    <div id="body"></div>
    <div class="new-comment">
      <the-form @submit="postComment">
        <div class="input-box">
          <label for="comment">Write a comment</label>
          <textarea name="comment" id="comment" cols="20" rows="5"></textarea>
        </div>
        <button>Comment</button>
      </the-form>
    </div>
    <div class="comments">
      <div
        v-for="[index, comment] in post.comments.entries()"
        :key="index"
        class="comment"
      >
        <div class="comment-author" @click="redirectProfile(comment.authorId)">
          <div v-if="!comment.picture" class="no-pic-comment">
            {{ comment.author[0] }}
          </div>
          <div v-else class="img-comment">
            <img
              :src="'http://localhost:3000/images/' + comment.picture"
              alt="user picture"
            />
          </div>
          <span>{{ comment.author }}</span>
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
  </div>
</template>

<script>
import TheForm from "../components/TheForm.vue";

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
        comments: [],
      },
    };
  },
  components: {
    TheForm,
  },
  computed: {
    userId() {
      return JSON.parse(localStorage.getItem("user")).id;
    },
  },
  methods: {
    async fetchPost(postId, authorId) {
      const QUERY = {
        query: `
          {
             getPost(postId: ${postId}, authorId: ${authorId}){
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
               comments {
                 id
                 author
                 authorId
                 content
                 likes
                 dislikes
                 picture
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

      console.log(responseData.data.getPost);

      this.post = responseData.data.getPost;
    },
    async postComment(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const comment = form.get("comment");
      const picture = this.$store.state.user.picture;
      const author = this.$store.state.user.name;
      const idAuthor = this.$store.state.user.id;
      const postId = this.$route.params.id;

      const QUERY = {
        query: `
        mutation{
	          comment(postId: ${+postId}, author: "${author}", comment: "${comment}", picture: "${picture}", authorId: ${+idAuthor}){
            author
            authorId
            content
            likes
            dislikes
            picture
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

      const responseData = await response.json();

      console.log(responseData.data.comment);

      this.post.comments.push(responseData.data.comment);
    },
    async redirectProfile(id) {
      this.$router.push("/profile/" + id);
    },
    async commentInteraction(type, commentId) {
      const userId = JSON.parse(localStorage.getItem("user")).id;

      const idxComment = this.post.comments.map((c) => c.id).indexOf(commentId);
      const oppositeAction = type == "likes" ? "dislikes" : "likes";
      const isSelected = this.post.comments[idxComment][type].indexOf(userId);

      const QUERY = {
        query: `
        mutation{
          commentInteraction(type: "${type}", userId: ${+userId} , commentId: ${+commentId}){
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

      console.log(await response.json());

      if (!response.ok) {
        console.log("something went wrong", response);
        return;
      }

      const button = document.getElementById(type);

      if (isSelected !== -1) {
        const idxUser = this.post.comments[idxComment][type].indexOf(userId);
        this.post.comments[idxComment][type].splice(idxUser, 1);
        button.classList.remove("button-selected");
      } else {
        const oppositeArr = this.post.comments[idxComment][oppositeAction];
        const oppositeIdx = oppositeArr.indexOf(userId);

        if (oppositeIdx !== -1) {
          const oppositeButton = document.getElementById(oppositeAction);
          oppositeButton.classList.remove("button-selected");
          this.post.comments[idxComment][oppositeAction].splice(oppositeIdx, 1);
        }

        this.post.comments[idxComment][type].push(userId);
        button.classList.add("button-selected");
      }
    },
  },
  async mounted() {
    await this.fetchPost(this.$route.params.id, this.$route.params.authorId);
    const body = document.getElementById("body");
    body.innerHTML = this.post.body;
  },
};
</script>

<style scoped>
.display-body {
  background-color: white;
  border: solid 3px black;
  border-bottom: none;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  margin: 0em 5em;
  margin-top: 2em;

  padding: 0.5em 3em;
}

.header {
  padding: 0em 2em;
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

.author-info span {
  font-size: 1.2rem;
  font-family: "Zilla Slab", serif;
  margin-left: 0.5em;
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
  width: 3em;
  height: 3em;
  border-radius: 50%;
  margin-top: 0.1em;
}

.tags {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.tag {
  margin-right: 0.3em;
  background: rgb(64, 89, 173);
  padding: 0.5em 1em;
  border-radius: 8px;
  font-size: 1rem;
  font-family: "Pridi", serif;
}

#body {
  padding: 1em 1.5em;
  font-family: "Zilla Slab", serif;
  font-size: 1.5rem;
}

.new-comment {
  padding: 0em 2em;
  margin-top: 5em;
}

.new-comment textarea {
  resize: none;
  border: solid 2px black;
  border-radius: 5px;
  font-size: 1.3rem;
  font-family: "Zilla Slab", serif;
}

.comments {
  padding: 1.7em;
}

.comment {
  border: solid 2px black;
  padding: 1em;
  border-radius: 5px;
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
  padding: 0.3rem 0.8em;
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

.buttons .material-symbols-outlined:hover {
  cursor: pointer;
}

.button-selected {
  color: rgb(46, 190, 94);
}
</style>
