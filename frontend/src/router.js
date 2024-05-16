import { createRouter, createWebHistory } from "vue-router";

import HomePage from "./pages/HomePage.vue";
import AuthPage from "./pages/AuthPage.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import WelcomePage from "./pages/WelcomePage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", name: "home", components: { default: HomePage } },
    { path: "/auth", name: "auth", components: { default: AuthPage } },
    { path: "/welcome", name: "welcome", components: { default: WelcomePage } },
    {
      path: "/dashboard",
      name: "dashboard",
      components: { default: DashboardPage },
    },
  ],
});

router.beforeEach(function (_, _2, next) {
  next();
});

export default router;
