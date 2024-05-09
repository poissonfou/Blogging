<template>
  <div class="article-inputs">
    <form @submit="submitFunction" :id="idProp && idProp">
      <label for="title">Title</label>
      <input
        type="text"
        name="title"
        placeholder="Title"
        :value="titleProp && titleProp.length ? titleProp : ''"
      />
      <label for="abstract">Abstract</label>
      <textarea
        name="abstract"
        id=""
        cols="30"
        rows="5"
        placeholder="Give an introduction to your article!"
        :value="abstractProp && abstractProp.length ? abstractProp : ''"
      ></textarea>
      <label for="body">Body</label>
      <textarea
        name="body"
        id=""
        cols="50"
        rows="15"
        :value="bodyProp && bodyProp.length ? bodyProp : ''"
      ></textarea>
      <div class="tags-container">
        <div>
          <p>Tags</p>
          <span>Choose at least one.</span>
        </div>
        <div class="tags-box-items">
          <div v-if="!tagsProps">
            <span v-for="tag in tags" :key="tag" class="tag" @click="selectTag">
              {{ tag }}
            </span>
          </div>
          <div v-else>
            <span
              v-for="tag in tagsProps"
              :key="tag"
              class="tag selected-tag"
              @click="selectTag"
            >
              {{ tag }}
            </span>
          </div>
          <form @submit="addTag">
            <input type="text" name="tag" placeholder="Add custom" />
          </form>
        </div>
      </div>
      <button>{{ idProp ? "Edit" : "Post" }}</button>
    </form>
  </div>
</template>

<script>
export default {
  props: [
    "submitFunction",
    "titleProp",
    "bodyProp",
    "abstractProp",
    "tagsProps",
    "idProp",
  ],
  data() {
    return {
      tags: [
        "Science",
        "Media",
        "Psycology",
        "History",
        "Cooking",
        "Languages",
        "Travel",
        "Story",
        "News",
        "Politics",
      ],
    };
  },
  methods: {
    selectTag(event) {
      event.target.classList.toggle("selected-tag");
    },
    addTag(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const tag = form.get("tag");

      this.tags.push(tag);
    },
  },
};
</script>

<style scoped>
.article-inputs {
  padding: 0.5em 1em;
}

.article-inputs form {
  display: flex;
  flex-direction: column;
}

.article-inputs input,
.article-inputs textarea {
  border: solid 2px black;
  border-radius: 5px;
  font-size: 1.3rem;
  font-family: "Zilla Slab", serif;
  resize: none;
}

[name="title"] {
  font-size: 2rem !important;
}

.article-inputs label {
  font-family: "Pridi", serif;
  font-size: 1.5rem;
}

.tags-container div:first-child {
  display: flex;
  align-items: baseline;
}

.tags-items-box {
  display: flex;
  flex-direction: column;
}

.tags-container p {
  font-family: "Pridi", serif;
  font-size: 1.5rem;
  margin-right: 0.2em;
  margin-bottom: 0em;
}

.tags-container span {
  font-family: "Zilla Slab", serif;
  font-size: 1.2rem;
}

.tags-box-items {
  display: flex;
  flex-direction: column;
  justify-content: right;
}

.tags-box-items div:first-child {
  display: block;
}

.tags-container input {
  width: 8em;
  margin-top: 0.5em;
}

.tag {
  display: inline-block;
  margin-right: 0.3em;
  margin-top: 0.3em;
  background: rgb(53, 219, 178);
  padding: 0.5em;
  border-radius: 10px;
}

.tag:hover {
  cursor: pointer;
}

.article-inputs button {
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
  font-size: 1.5rem;
  margin-top: 0.5em;
}

.article-inputs button:hover {
  cursor: pointer;
}

.selected-tag {
  border: solid 2px black;
}
</style>
