<template>
  <div>
    <div class="backdrop"></div>
    <div class="container">
      <div class="input-container">
        <the-form @submit="saveImage" id="update-image">
          <div class="input-box">
            <label for="picture">Choose a profile picture</label>
            <input
              type="file"
              name="picture"
              id="picture"
              @change="preview"
              accept="image/png, image/jpg, image/jpeg, image/avif"
            />
            <span v-if="feedback">{{ feedback }}</span>
          </div>
        </the-form>
        <div class="img-box">
          <h2 id="no-img-msg">Choose an image</h2>
          <img src="" id="image-preview" class="hidden" />
        </div>
      </div>
      <div class="btns-container">
        <button @click="saveImage" :disabled="file ? false : true">
          Confirm
        </button>
        <button @click="closePopup">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import TheForm from "./TheForm.vue";

export default {
  components: {
    TheForm,
  },
  props: ["closePopup", "updateUser"],
  data() {
    return {
      feedback: null,
      file: null,
    };
  },
  methods: {
    preview(event) {
      const img = document.getElementById("image-preview");
      const msg = document.getElementById("no-img-msg");
      const [file] = event.target.files;
      if (file) {
        this.file = file;
        msg.classList.add("hidden");
        img.src = URL.createObjectURL(file);
        img.alt = "image preview";
        img.classList.remove("hidden");
      }
    },
    async saveImage() {
      const form = new FormData();
      const picture = document.forms["update-image"]["picture"].files[0];
      const { token, id } = JSON.parse(localStorage.getItem("user"));
      let response;

      if (!picture) {
        this.feedback = "Please choose an image.";
        return;
      }

      if (
        picture.type !== "image/png" &&
        picture.type !== "image/jpg" &&
        picture.type !== "image/jpeg" &&
        picture.type !== "image/avif"
      ) {
        this.feedback =
          "Please choose a valid file. Only png, jpg, jpeg and avif are accepted.";
        return;
      }

      form.append("picture", picture);

      try {
        response = await fetch("http://localhost:3000/updateImage?id=" + id, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
      } catch (e) {
        this.feedback = {
          type: "error",
          msg: "Could not connect to server. Please try again.",
          data: null,
        };
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        if (response.status == 500) {
          this.feedback = "Could not connect to server. Please try again.";
          return;
        }

        this.feedback = data.message;
        return;
      }

      this.feedback = "Image uploaded!😊";
      setTimeout(() => {
        this.$props.closePopup();
        this.$props.updateUser(data.user);
      }, 2000);
    },
  },
  mounted() {
    this.file = document.forms["update-image"]["picture"].files[0];
  },
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  z-index: 500;
  background-color: transparent;
  backdrop-filter: blur(2px);
}

.container {
  background-color: white;
  border: solid 3px black;
  padding: 1em;
  width: 50em;
  border-radius: 10px;
  position: absolute;
  left: 18%;
  top: 15%;
  z-index: 500;
}

.input-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2em;
}

.btns-container {
  margin-top: 1em;
  display: flex;
  justify-content: end;
}

.btns-container button {
  border: solid 2px black;
  box-shadow: 2px 2px 0px black;
  border-radius: 5px;
  font-family: "Pridi", serif;
  padding: 0.3em 0.5em;
  font-size: 1.1rem;
}

.btns-container button:hover {
  cursor: pointer;
}

.btns-container button:first-child {
  background: rgb(53, 219, 109);
  margin-right: 0.5em;
}

.btns-container button:last-child {
  background: #4059ad;
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

.input-box span {
  font-family: "Pridi", serif;
  font-family: 1.3rem;
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

.hidden {
  display: none;
}
</style>
