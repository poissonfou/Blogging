<template>
  <div class="article-inputs">
    <text-edit-tooltip id="tooltip"></text-edit-tooltip>
    <span
      v-if="error.field == '' && error.msg"
      class="error-msg"
      id="general-error"
      >{{ error.msg }}</span
    >

    <form @submit="submitFunction" :id="idProp && idProp">
      <label for="title">Title</label>
      <span v-if="error.field == 'title'" class="error-msg" id="title-error">{{
        error.msg
      }}</span>

      <input
        type="text"
        name="title"
        placeholder="Title"
        v-model="title"
        :class="error.field == 'title' ? 'validation-error' : ''"
      />

      <label for="abstract">Abstract</label>
      <span
        v-if="error.field == 'abstract'"
        class="error-msg"
        id="abstract-error"
        >{{ error.msg }}</span
      >

      <textarea
        name="abstract"
        id="abstract"
        cols="30"
        rows="5"
        placeholder="Give an introduction to your article!"
        v-model="abstract"
        :class="error.field == 'abstract' ? 'validation-error' : ''"
      ></textarea>

      <label for="body">Body</label>
      <span v-if="error.field == 'body'" class="error-msg" id="body-error">{{
        error.msg
      }}</span>

      <div
        id="body"
        tabindex="0"
        contenteditable="true"
        role="textbox"
        spellcheck="true"
        name="body"
        :class="error.field == 'body' ? 'validation-error' : ''"
      ></div>
      <div class="tags-container">
        <div class="tags-header">
          <p>Tags</p>
          <span>Choose at least one.</span>
        </div>
        <span v-if="error.field == 'tags'" class="error-msg" id="tags-error">{{
          error.msg
        }}</span>
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
      <button type="submit">
        {{ idProp ? "Edit" : "Post" }}
      </button>
    </form>
  </div>
</template>

<script>
import TextEditTooltip from "./TextEditTooltip.vue";

export default {
  props: [
    "submitFunction",
    "titleProp",
    "bodyProp",
    "abstractProp",
    "tagsProps",
    "idProp",
    "error",
  ],
  components: {
    TextEditTooltip,
  },
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
      title: "",
      abstract: "",
      body: "",
      validationError: { field: "", msg: null },
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
  mounted() {
    const textBody = document.getElementById("body");
    const tooltip = document.getElementById("tooltip");

    let lastYPosition = null;

    textBody.addEventListener("mousemove", (event) => {
      const selection = String(window.getSelection());
      if (selection == "") return;

      let X = event.pageX;
      let Y = event.pageY;

      if (tooltip.style.top == "") {
        lastYPosition = Y + 10;
        tooltip.style.top = Y - 58 + "px";
        tooltip.style.left = X + "px";
        tooltip.classList.remove("hidden");
      } else {
        if (Y <= lastYPosition && Y >= lastYPosition - 10) {
          tooltip.style.left = X + "px";
          tooltip.classList.remove("hidden");
          return;
        }
      }
    });

    textBody.innerHTML = this.$props.bodyProp ? this.$props.bodyProp : "";

    this.abstract = this.$props.abstractProp ? this.$props.abstractProp : "";

    this.title = this.$props.titleProp ? this.$props.titleProp : "";
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

#body {
  border: solid 2px black;
  border-radius: 5px;
  height: 20em;
  font-family: "Zilla Slab", serif;
  font-size: 1.3rem;
  user-select: text;
  word-break: break-word;
  white-space: pre-wrap;
  padding: 0.3em 0.5em;
}

#body:hover {
  cursor: text;
}

.tags-header {
  display: flex;
  align-items: baseline;
}

.tags-header span {
  font-family: "Zilla Slab", serif;
  font-size: 1.1rem;
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
  background: #4059ad;
  border: solid 2px black;
  box-shadow: 2px 2px 0px black;
  padding: 0.5em;
  border-radius: 10px;
  font-family: "Pridi", serif;
  font-size: 1.2rem;
}

.tag:hover {
  cursor: pointer;
}

.article-inputs button {
  border: solid 2px black;
  border-radius: 5px;
  box-shadow: -2px 2px 0px black;
  background-color: rgb(53, 219, 109);
  padding: 0.1em 1.3em;
  width: fit-content;
  font-family: "Pridi", serif;
  font-size: 1.5rem;
  margin-top: 0.5em;
}

.article-inputs button:hover {
  cursor: pointer;
}

.selected-tag {
  box-shadow: none;
}

.error-msg {
  font-family: "Pridi", serif;
  font-size: 1.1rem;
}

.validation-error {
  border: solid 2px red !important;
}
</style>
