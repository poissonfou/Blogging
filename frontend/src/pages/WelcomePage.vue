<template>
  <div class="auth-body">
    <h1>Welcome to <span>Blogging!</span></h1>
    <the-form @submit="saveTag" name="form">
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
        <input type="file" name="picture" id="picture" />
      </div>
      <button>Done</button>
    </the-form>
  </div>
</template>

<script>
import TheForm from "../components/TheForm.vue";
export default {
  components: {
    TheForm,
  },
  methods: {
    async saveTag(event) {
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
</style>
