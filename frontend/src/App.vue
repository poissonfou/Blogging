<template>
  <div id="wrapper">
    <the-header></the-header>
    <main id="main">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import TheHeader from "./components/TheHeader.vue";

export default {
  name: "App",
  components: { TheHeader },
};
</script>

<style>
body {
  margin: 0;
  font-family: "Poppins", sans-serif;
  background-color: rgb(53, 219, 109);
  height: 100%;
}

body::-webkit-scrollbar {
  display: block;
}

body::-webkit-scrollbar-track {
  background-color: transparent;
}

body::-webkit-scrollbar-thumb {
  background: rgb(15, 15, 15);
  border-radius: 10px;
  border: solid rgb(53, 219, 109) 3px;
}

#wrapper,
#app,
html {
  height: 100%;
}

#main {
  height: 89.9%;
}
</style>
