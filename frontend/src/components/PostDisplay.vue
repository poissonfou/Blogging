<template>
  <div class="display-post">
    <h1>{{ title }}</h1>
    <h3>{{ abstract }}</h3>
    <div class="time-info">
      <span>{{ `Posted on ${createdTime.split(" ")[0]}` }}</span>
      <span v-if="!notUpdated">{{
        ` | Updated on ${updatedTime.split(" ")[0]}`
      }}</span>
    </div>
    <p>{{ body }}</p>
  </div>
</template>

<script>
export default {
  props: [
    "title",
    "abstract",
    "body",
    "createdTime",
    "updatedTime",
    "notUpdated",
  ],
};
</script>

<style scoped>
.display-post {
  padding: 0em 2em;
}

.display-post h1 {
  font-size: 3rem;
  margin: 0em;
  font-family: "Pridi", serif;
}

.display-post h3 {
  font-family: "Zilla Slab", serif;
  color: rgb(138, 136, 136);
  font-size: 1.8rem;
  margin: 0em;
}

.display-post p {
  font-family: "Zilla Slab", serif;
  font-size: 1.5rem;
  margin: 0.5em 0em;
}

.time-info {
  font-size: 1rem;
  margin-top: 0.4em;
  font-family: "Pridi", serif;
  color: rgb(53, 111, 219);
}
</style>
