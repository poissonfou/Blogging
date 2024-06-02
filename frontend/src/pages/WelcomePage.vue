<template>
  <div>
    <the-popup :content="popupMessage"></the-popup>
    <div class="auth-body">
      <h1>Welcome to <span>Blogging!</span></h1>
      <span v-if="errorMsg.msg" class="error-msg">{{ errorMsg.error }}</span>
      <div class="flex-container">
        <the-form @submit="saveTagAndImage" name="form">
          <div class="input-box">
            <label for="userTag">User tag</label>
            <input
              type="text"
              name="userTag"
              placeholder="Create a unique user tag."
              id="userTag"
              v-model.trim="tag"
              @blur="validate"
              :class="errorMsg.field == 'userTag' ? 'error' : ''"
            />
          </div>

          <div class="input-box">
            <label for="picture">Choose a profile picture</label>
            <input type="file" name="picture" id="picture" @change="preview" />
          </div>
          <button v-if="!changeButtonDisplay">Done</button>
        </the-form>
        <div class="img-box">
          <h2 id="no-img-msg">Choose an image</h2>
          <img src="" id="image-preview" class="hidden" />
        </div>
        <div v-if="changeButtonDisplay" class="alternative-btn-display">
          <button @click="saveTagAndImage">Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TheForm from "../components/TheForm.vue";
import ThePopup from "../components/ThePopup.vue";

export default {
  components: {
    TheForm,
    ThePopup,
  },
  data() {
    return {
      errorMsg: { field: "", msg: null },
      tag: "",
      popupMessage: { type: "", msg: "", data: null },
      changeButtonDisplay: false,
    };
  },
  methods: {
    validate() {
      if (!this.tag.length) {
        this.errorMsg = { field: "userTag", msg: "Please enter a tag." };
        return;
      }

      if (this.errorMsg.msg) this.errorMsg = { field: "", msg: null };
    },
    async saveTagAndImage(event) {
      if (event) event.preventDefault();
      if (this.tag[0] == "@") this.tag = this.tag.replace("@", "");
      const form = new FormData();
      const picture = document.forms["form"]["picture"].files[0];
      const userTag = this.tag;
      const { id } = JSON.parse(localStorage.getItem("user"));

      if (!userTag.length) {
        this.errorMsg = { field: "", msg: "Please enter a user tag." };
        return;
      }

      const { token } = JSON.parse(localStorage.getItem("user"));

      form.append("picture", picture);
      form.append("userTag", userTag.trim());

      let response;

      try {
        response = await fetch("http://localhost:3000/savetag?id=" + id, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
      } catch (e) {
        this.popupMessage = {
          type: "error",
          msg: "Could not connect to server. Please try again.",
          data: null,
        };
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        if (response.status == 500) {
          this.popupMessage = {
            type: "error",
            msg: "Could not connect to server. Please try again.",
            data: null,
          };
          return;
        }
        this.errorMsg = error.message;
        return;
      }

      const userLocal = JSON.parse(localStorage.getItem("user"));
      userLocal.tag = userTag;
      localStorage.setItem("user", JSON.stringify(userLocal));

      this.$router.push("/dashboard");
    },
    preview(event) {
      const img = document.getElementById("image-preview");
      const msg = document.getElementById("no-img-msg");
      const [file] = event.target.files;
      if (file) {
        msg.classList.add("hidden");
        img.src = URL.createObjectURL(file);
        img.alt = "image preview";
        img.classList.remove("hidden");
      }
    },
  },
  mounted() {
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 650 && !this.changeButtonDisplay) {
        this.changeButtonDisplay = true;
      }
      if (window.innerWidth > 650 && this.changeButtonDisplay) {
        this.changeButtonDisplay = false;
      }
    });

    if (window.innerWidth <= 650 && !this.changeButtonDisplay) {
      this.changeButtonDisplay = true;
    }
    if (window.innerWidth > 650 && this.changeButtonDisplay) {
      this.changeButtonDisplay = false;
    }
  },
};
</script>

<style scoped>
h1 {
  font-family: "Pridi", serif;
  font-size: 3rem;
  margin: 0;
}

h1 span {
  color: rgb(53, 219, 109);
}

.auth-body {
  position: absolute;
  background-color: white;
  width: 50em;
  padding: 1em;
  padding-bottom: 5.45em;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  bottom: 0;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border: solid 3px black;
  border-bottom: none;
}

.alternative-btn-display {
  display: flex;
  justify-content: end;
}

.auth-body button {
  border: solid 2px black;
  border-radius: 5px;
  box-shadow: -2px 2px 0px black;
  padding: 0.1em 1.3em;
  width: fit-content;
  font-family: "Pridi", serif;
  font-size: 1.5rem;
  margin-top: 0.5em;
  background-color: rgb(53, 219, 109);
}

.auth-body button:hover {
  cursor: pointer;
}

.flex-container {
  display: flex;
  gap: 2em;
}

#picture::file-selector-button {
  background: rgb(53, 219, 109);
  border: solid 2px black;
  border-top: none;
  border-right: none;
  border-radius: 3px;
  font-family: "Pridi", serif;
}

#picture::file-selector-button:hover {
  cursor: pointer;
}

.img-box {
  border: solid 2px black;
  border-radius: 5px;
  width: 100%;
  height: 20em;
  text-align: center;
  font-family: "Zilla Slab", serif;
}

.img-box h2 {
  margin-top: 38%;
}

.img-box img {
  height: 20em;
  border-radius: 3px;
  object-fit: cover;
  width: 100%;
}

@media (max-width: 900px) {
  .auth-body {
    width: 40em;
  }

  .auth-body h1 {
    font-size: 2.5rem;
  }

  .auth-body input {
    width: 15em;
  }

  .img-box h2 {
    margin-top: 50%;
  }
}

@media (max-width: 700px) {
  .auth-body {
    width: 37em;
  }

  .auth-body label {
    font-size: 1.2rem;
  }

  .auth-body input {
    width: 12em;
  }

  button {
    font-size: 1.2em;
  }

  .img-box img {
    width: 16em;
  }
}

@media (max-width: 650px) {
  .flex-container {
    display: flex;
    flex-direction: column;
  }

  .auth-body {
    width: auto;
    margin: 0em 1em;
    top: 8em;
    height: fit-content;
  }

  .auth-body h1 {
    margin-bottom: 1.5em;
  }

  .auth-body input {
    width: 18em;
  }

  .img-box {
    width: auto;
    height: 15em;
    margin: 0;
  }

  .img-box h2 {
    margin-top: 25%;
  }
}

@media (max-width: 500px) {
  .auth-body h1 {
    font-size: 2.5rem;
  }

  .auth-body input {
    width: 100%;
  }
}

.hidden {
  display: none;
}

.error-msg {
  font-family: "Pridi", serif;
  font-size: 1.2rem;
}

.error {
  border: solid 2px red;
}
</style>
