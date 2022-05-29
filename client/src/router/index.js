import VueRouter from "vue-router"
import AppsList from "@/components/pipelines/list"
import AppsNew from "@/components/pipelines/new"
import AppsDetails from "@/components/pipelines/detail"
import Settingsform from "@/components/settings/form"
import Addonslist from "@/components/addons/list"

export default new VueRouter({
  routes: [
    {
      path: "/",
      name: "Pipelines",
      component: AppsList
    },
    {
      path: "/pipeline/new",
      name: "New Pipeline",
      component: AppsNew
    },
    {
      path: "/pipeline/details/:name",
      name: "PupeLine Details",
      component: AppsDetails
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