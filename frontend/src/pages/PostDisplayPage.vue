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
  </div>
</template>

<script>
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
      },
    };
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
  height: 100%;
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
</style>
