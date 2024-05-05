<template>
  <form>
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

:deep(button:hover) {
  cursor: pointer;
}
</style>
