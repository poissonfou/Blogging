<template>
  <div>
    <div class="backdrop none" id="backdrop"></div>
    <div class="popup-parent">
      <div class="popup-body hidden" id="popup">
        <div v-if="content.type == 'error'">
          <h1>Warning</h1>
          <p>{{ content.msg }}</p>
          <div>
            <button @click="close">Close</button>
          </div>
        </div>
        <div v-if="content.type == 'delete'">
          <h1>Warning</h1>
          <p>{{ content.msg }}</p>
          <div class="btns-type-delete">
            <button @click="confirmDelete(content.data)">Yes</button>
            <button @click="close">Nevermind</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["content", "confirmDelete"],
  computed: {
    contentVal() {
      return this.$props.content;
    },
  },
  watch: {
    contentVal() {
      const popup = document.getElementById("popup");
      const backdrop = document.getElementById("backdrop");
      if (this.contentVal.type !== "") {
        console.log("we are here");
        popup.classList.remove("hidden");
        popup.classList.add("show-popup");
        backdrop.classList.remove("none");
      } else {
        console.log("we are hidden");
        popup.classList.add("hidden");
        popup.classList.remove("show-popup");
        backdrop.classList.add("none");
      }
    },
  },
  methods: {
    close() {
      const popup = document.getElementById("popup");
      const backdrop = document.getElementById("backdrop");
      popup.classList.add("hidden");
      popup.classList.remove("show-popup");
      backdrop.classList.add("none");
    },
  },
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  z-index: 1000;
  background-color: transparent;
  backdrop-filter: blur(2px);
}

.popup-parent {
  position: relative;
  display: flex;
  flex-direction: column;
  font-family: "Pridi", serif;
  z-index: 1000;
}

.popup-body {
  display: flex;
  position: fixed;
  top: 0;
  left: 50%;
  padding: 0.3em;
  width: 18em;
  background-color: white;
  border: solid 2px black;
  border-radius: 5px;
  transform: translateY(-1.6em) translateX(-50%);
  opacity: 1;
  transition: all 0.2s;
}

.popup-body div:first-child {
  display: flex;
  flex-direction: column;
}

.popup-body h1 {
  margin: 0;
}

.popup-body p {
  margin: 0em;
  padding: 0.5em;
  padding-top: 0em;
}

.popup-body div {
  display: flex;
  justify-content: end;
}

.popup-body button {
  background-color: rgb(53, 219, 109);
  border: solid 2px black;
  box-shadow: 2px 2px 0px black;
  font-family: "Pridi", serif;
  border-radius: 5px;
  font-size: 1rem;
  padding: 0.2em 1em;
}

.popup-body button:hover {
  cursor: pointer;
}

.btns-type-delete {
  display: flex;
  flex-direction: row-reverse;
}

.btns-type-delete button:last-child {
  background-color: #4059ad;
  border: solid 2px black;
  box-shadow: 2px 2px 0px black;
  font-family: "Pridi", serif;
  border-radius: 5px;
  font-size: 1rem;
  padding: 0.2em 1em;
  margin-right: 0.5em;
}

@media (max-width: 500px) {
  .popup-body h1 {
    font-size: 1.7rem;
  }

  .popup-body p {
    font-size: 1rem;
    padding-left: 0em;
  }
}

.hidden {
  opacity: 0;
  transition: all 0.2s;
}

.none {
  display: none;
}

.show-popup {
  transform: translateY(0.2em) translateX(-50%);
  transition: all 0.2s;
}
</style>
