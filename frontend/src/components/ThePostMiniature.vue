<template>
  <div class="post-miniature">
    <h2>{{ post.title }}</h2>
    <p>{{ post.abstract }}</p>
    <div v-if="post.author" class="author-container">
      <div v-if="post.author.picture" class="no-pic">
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
    <div class="tags-and-btns" v-if="edit && deletion">
      <div class="tags-container">
        <span
          v-for="[index, tag] in post.tags.entries()"
          :key="index"
          class="tag"
          >{{ tag }}</span
        >
      </div>
      <div class="btn">
        <button @click="edit($event, post)">Edit</button>
        <button @click="deletion($event, post.id)" class="delete">
          Delete
        </button>
      </div>
    </div>
    <div v-else class="tags-container">
      <span
        v-for="[index, tag] in post.tags.entries()"
        :key="index"
        class="tag"
        >{{ tag }}</span
      >
    </div>
  </div>
</template>

<script>
export default {
  props: ["edit", "post", "deletion"],
};
</script>

<style scoped>
.post-miniature {
  border: solid 3px rgb(0, 0, 0);
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

.author-container {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.author-container img {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

.no-pic {
  background-color: rgb(53, 219, 109);
  padding: 0em 0.5em;
  border-radius: 50%;
  font-family: "Pridi", serif;
}

.tags-container {
  padding: 0.2em;
}

.tags-and-btns .tags-container {
  width: 60%;
}

.tag {
  display: inline-block;
  margin-right: 0.3em;
  background: rgb(64, 89, 173);
  border: solid 1px black;
  box-shadow: -2px 2px 0px black;
  padding: 0.5em;
  border-radius: 5px;
  font-size: 0.8rem;
  margin-top: 0.5em;
}

.tags-and-btns {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn button {
  font-family: "Pridi", serif;
  font-size: 1.2rem;
  border: solid 2px black;
  box-shadow: -2px 2px 0px black;
  border-radius: 5px;
}

.btn button:hover {
  cursor: pointer;
}

.btn button:first-child {
  padding: 0em 0.6em;
  background-color: rgb(53, 219, 109);
  margin-right: 0.5em;
}

@media (max-width: 650px) {
  .post-miniature h2 {
    font-size: 1.8rem;
  }

  .post-miniature p {
    font-size: 1.3rem;
  }
}

.delete {
  background-color: rgb(230, 10, 10);
}
</style>
