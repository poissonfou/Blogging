<template>
  <div class="article-inputs">
    <text-edit-tooltip id="tooltip"></text-edit-tooltip>
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
        id="abstract"
        cols="30"
        rows="5"
        placeholder="Give an introduction to your article!"
        :value="abstractProp && abstractProp.length ? abstractProp : ''"
      ></textarea>
      <label for="body">Body</label>
      <div
        id="body"
        tabindex="0"
        contenteditable="true"
        role="textbox"
        spellcheck="true"
        name="body"
      ></div>
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
import TextEditTooltip from "./TextEditTooltip.vue";

export default {
  props: [
    "submitFunction",
    "titleProp",
    "bodyProp",
    "abstractProp",
    "tagsProps",
    "idProp",
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

    textBody.innerHTML =
      this.$props.bodyProp && this.$props.bodyProp.length
        ? this.$props.bodyProp
        : "";
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
  background: #4059ad;
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
