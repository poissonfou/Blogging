<template>
  <div class="ai-tooltip-body">
    <div class="btn-container">
      <div class="btn" @click="toggleAIBox">
        <span class="material-symbols-outlined"> robot_2 </span>
      </div>
    </div>
    <div class="ai-box">
      <div class="hidden" id="ai-box-container">
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
        <div class="btn-ai">
          <button @click="submitPrompt">
            Generate <i class="bi bi-stars"></i>
          </button>
        </div>
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
      const aiTextbox = document.getElementsByClassName("ai-box")[0];
      const div = document.getElementById("ai-box-container");
      if (this.showAIBox) {
        aiTextbox.classList.remove("hide-textbox");
        aiTextbox.classList.add("show-textbox");
        setTimeout(() => {
          div.classList.remove("hidden");
        }, 280);
      } else {
        setTimeout(() => {
          div.classList.add("hidden");
        }, 200);

        aiTextbox.classList.remove("show-textbox");
        aiTextbox.classList.add("hide-textbox");
      }
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
  border-radius: 15%;
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
  z-index: 400;
  top: 9.5em;
  right: 2.8em;
  width: 0;
  height: 0;
  transition: all 1s;
}

.ai-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-name div:first-child {
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

svg {
  margin-right: 1em;
}

.spinner_z9k8 {
  transform-origin: center;
  animation: spinner_StKS 0.75s infinite linear;
}

@keyframes spinner_StKS {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes show_textbox {
  0% {
    width: 0;
    height: 0;
  }

  55% {
    width: 20%;
    height: 40%;
  }

  65% {
    width: 30%;
    height: 50%;
  }

  80% {
    height: 60%;
  }

  100% {
    width: auto;
    height: auto;
  }
}

.show-textbox {
  animation-name: show_textbox;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
}

@keyframes hide_textbox {
  0% {
    width: auto;
    height: auto;
  }

  50% {
    width: 30%;
    height: 60%;
  }

  65% {
    width: 20%;
    height: 40%;
  }

  100% {
    width: 0;
    height: 0;
  }
}

.hide-textbox {
  animation-name: hide_textbox;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
}

.hidden {
  display: none;
}
</style>
