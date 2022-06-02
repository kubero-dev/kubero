import VueRouter from "vue-router"
import PipelineList from "@/components/pipelines/list"
import PipelineNew from "@/components/pipelines/new"
import PipelineDetails from "@/components/pipelines/detail"
import AppsNew from "@/components/apps/new"
import Settingsform from "@/components/settings/form"
import Addonslist from "@/components/addons/list"

export default new VueRouter({
  routes: [
    {
      path: "/",
      name: "Pipelines",
      component: PipelineList
    },
    {
      path: "/pipeline/new",
      name: "New Pipeline",
      component: PipelineNew
    },
    {
      path: "/pipeline/:pipeline/apps",
      name: "PupeLine Details",
      component: PipelineDetails,
      props: true
    },
    {
      path: "/pipeline/:pipeline/:phase/apps/new",
      name: "New App",
      component: AppsNew,
      props: true
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