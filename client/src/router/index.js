import VueRouter from "vue-router"
import Appslist from "@/components/apps/list"
import Settingsform from "@/components/settings/form"
import Addonslist from "@/components/addons/list"

export default new VueRouter({
  routes: [
    {
      path: "/",
      name: "Apps",
      component: Appslist
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