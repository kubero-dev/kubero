import VueRouter from "vue-router"
import AppsList from "@/components/apps/list"
import AppsNew from "@/components/apps/new"
import Settingsform from "@/components/settings/form"
import Addonslist from "@/components/addons/list"

export default new VueRouter({
  routes: [
    {
      path: "/",
      name: "Apps",
      component: AppsList
    },
    {
      path: "/apps/new",
      name: "New app",
      component: AppsNew
    },
    {
      path: "/settings",
      name: "Settigns",
      component: Settingsform
    },
    {
      path: "/addons",
      name: "Addons",
      component: Addonslist
    }
  ]
})