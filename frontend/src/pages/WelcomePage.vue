<template>
  <div class="auth-body">
    <h1>Welcome to <span>Blogging!</span></h1>
    <div class="flex-container">
      <the-form @submit="saveTagAndImage" name="form">
        <div class="input-box">
          <label for="userTag">User tag</label>
          <input
            type="text"
            name="userTag"
            placeholder="Create a unique user tag."
            id="userTag"
          />
        </div>

        <div class="input-box">
          <label for="picture">Choose a profile picture</label>
          <input type="file" name="picture" id="picture" @change="preview" />
        </div>
        <button>Done</button>
      </the-form>
      <div class="img-box">
        <h2 id="no-img-msg">Choose an image</h2>
        <img src="" id="image-preview" class="hidden" />
      </div>
    </div>
  </div>
</template>

<script>
import TheForm from "../components/TheForm.vue";
export default {
  components: {
    TheForm,
  },
  methods: {
    async saveTagAndImage(event) {
      event.preventDefault();
      const form = new FormData();
      const picture = document.forms["form"]["picture"].files[0];
      const userTag = document.getElementById("userTag").value;
      const id = JSON.parse(localStorage.getItem("user")).id;
      form.append("picture", picture);
      form.append("userTag", userTag);
      console.log(form);

      const response = await fetch("http://localhost:3000/savetag?id=" + id, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        console.log("something went wrong", response);
        return;
      }

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

.flex-container {
  display: flex;
  gap: 2em;
}

#picture::file-selector-button {
  background: rgb(53, 219, 109);
  background: linear-gradient(
    90deg,
    rgb(53, 219, 109) 0%,
    rgba(183, 251, 169, 1) 100%
  );
  border: none;
  border-radius: 5px;
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

.hidden {
  display: none;
}
</style>
