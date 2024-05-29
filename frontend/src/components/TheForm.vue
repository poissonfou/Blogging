<template>
  <form
    :enctype="
      this.$route.path == '/welcome'
        ? 'multipart/form-data'
        : 'application/x-www-form-urlencoded'
    "
  >
    <div class="wrapper">
      <slot></slot>
    </div>
  </form>
</template>

<style scoped>
:deep(div) {
  display: flex;
  flex-direction: column;
  font-family: "Zilla Slab", serif;
  margin-bottom: 0.5em;
}

:deep(div input) {
  border: solid 2px black;
  font-size: 1.3rem;
  border-radius: 5px;
  width: 18em;
  font-family: "Zilla Slab", serif;
}

:deep(div label) {
  font-family: "Pridi", serif;
  font-size: 1.5rem;
}

:deep(span) {
  font-family: "Zilla Slab", serif;
  font-size: 1.2rem;
}

:deep(a) {
  color: rgb(46, 190, 94);
  text-decoration: none;
  margin-left: 0.2em;
}

:deep(button) {
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

:deep(button:hover) {
  cursor: pointer;
}

</style>
