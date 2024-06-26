import { createRouter, createWebHistory } from "vue-router";

import HomePage from "./pages/HomePage.vue";
import AuthPage from "./pages/AuthPage.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import WelcomePage from "./pages/WelcomePage.vue";
import ProfilePage from "./pages/ProfilePage.vue";
import PostDisplayPage from "./pages/PostDisplayPage.vue";
import SearchPage from "./pages/SearchPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: () => {
        if (!JSON.parse(localStorage.getItem("user"))) return "/home";
        const id = JSON.parse(localStorage.getItem("user"))?.id;
        const tag = JSON.parse(localStorage.getItem("user"))?.tag;

        if (id && typeof tag == "string" && tag.length) {
          return "/dashboard";
        }

        if (id && typeof tag == "string" && !tag.length) {
          return "/welcome";
        }

        return "/home";
      },
    },
    {
      path: "/home",
      name: "home",
      components: { default: HomePage },
      beforeEnter(to, from, next) {
        if (!JSON.parse(localStorage.getItem("user"))) next(true);
        const token = JSON.parse(localStorage.getItem("user"))?.token;

        if (typeof token !== "string" && !token.length) {
          next(from.fullPath);
        } else {
          next(true);
        }
      },
    },
    {
      path: "/auth",
      name: "auth",
      components: { default: AuthPage },
      beforeEnter(to, from, next) {
        if (to.query.mode == "update") {
          if (!JSON.parse(localStorage.getItem("user"))) return next(false);
          const token = JSON.parse(localStorage.getItem("user"))?.token;

          if (typeof token == "string" && token.length) {
            return next(true);
          } else {
            return next(false);
          }
        }
        next();
      },
    },
    {
      path: "/welcome",
      name: "welcome",
      components: { default: WelcomePage },
      async beforeEnter(to, from, next) {
        if (!JSON.parse(localStorage.getItem("user"))) return next(false);
        const token = JSON.parse(localStorage.getItem("user"))?.token;
        const tag = JSON.parse(localStorage.getItem("user"))?.tag;

        if (
          typeof token == "string" &&
          token.length &&
          typeof tag == "string" &&
          !tag.length
        ) {
          next(true);
        } else {
          next(false);
        }
      },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      components: { default: DashboardPage },
      beforeEnter(to, from, next) {
        if (!JSON.parse(localStorage.getItem("user"))) return next(false);
        const token = JSON.parse(localStorage.getItem("user"))?.token;
        const tag = JSON.parse(localStorage.getItem("user"))?.tag;

        if (token && token.length && tag && tag.length) {
          next(true);
        } else {
          next(false);
        }
      },
    },
    {
      path: "/search",
      name: "search",
      components: { default: SearchPage },
    },
    {
      path: "/article/:id/:title",
      name: "article",
      components: { default: PostDisplayPage },
    },
    {
      path: "/profile/:id",
      name: "profile",
      components: { default: ProfilePage },
    },
    {
      path: "/:unsupportedRoute(.*)",
      redirect: () => {
        if (!JSON.parse(localStorage.getItem("user"))) return "/home";
        const token = JSON.parse(localStorage.getItem("user"))?.id;

        if (typeof token == "string" && token.length) {
          return "/dashboard";
        } else {
          return "/home";
        }
      },
    },
  ],
});

export default router;
