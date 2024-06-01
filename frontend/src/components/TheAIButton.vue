<template>
  <div class="ai-tooltip-body">
    <div class="btn-container">
      <div class="btn" @click="toggleAIBox">
        <span class="material-symbols-outlined"> robot_2 </span>
      </div>
    </div>
    <div class="ai-box" v-if="showAIBox">
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
      <div class="btn-ai">
        <button @click="submitPrompt">
          Generate <i class="bi bi-stars"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["submitPrompt"],
  data() {
    return {
      showAIBox: false,
    };
  },
  methods: {
    toggleAIBox() {
      this.showAIBox = !this.showAIBox;
    },
  },
};
</script>

<style scoped>
.ai-tooltip-body {
  position: relative;
  background-color: rgb(209, 209, 99);
  width: auto;
}

.btn-container {
  position: absolute;
  right: 4em;
  top: 5em;
  z-index: 500;
}

.btn {
  position: fixed;
  background-color: rgb(71, 209, 117);
  border: solid 2px black;
  box-shadow: -2px 2px 0px black;
  border-radius: 50%;
  width: fit-content;
  height: fit-content;
  padding: 0.2em 0.5em;
}

.btn:hover {
  cursor: pointer;
}

.btn span {
  font-size: 2.5rem;
  color: white;
}

.ai-box {
  position: fixed;
  background-color: white;
  border: solid 2px black;
  padding: 0.5em;
  border-radius: 5px;
  font-family: "Pridi", serif;
  z-index: 500;
  top: 12em;
  right: 2em;
}

.ai-name {
  display: flex;
  align-items: center;
}

.ai-name h1 {
  margin: 0;
  font-family: "Pridi", serif;
  font-size: 1.5rem;
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
  width: 10em;
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

.btn-ai {
  display: flex;
  justify-content: end;
}

.ai-box button:hover {
  cursor: pointer;
}
</style>
