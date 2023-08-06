import VueRouter from "vue-router"
import PipelineList from "@/components/pipelines/list"
import PipelineNew from "@/components/pipelines/new"
import PipelineDetails from "@/components/pipelines/detail"
import AppsNew from "@/components/apps/new"
import AppsDetail from "@/components/apps/detail"
import AppsLogsPopUp from "@/components/apps/logspopup"
import Settingsform from "@/components/settings/form"
import Addonslist from "@/components/addons/list"
import EventsView from "@/components/events/view"
import Serviceslist from "@/components/services/list"
import Login from "@/components/login"

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
      path: "/pipeline/:pipeline",
      name: "Edit Pipeline",
      component: PipelineNew,
      props: true
    },
    {
      path: "/pipeline/:pipeline/:phase/:app",
      name: "Edit App",
      component: AppsNew,
      props: true
    },
    {
      path: "/pipeline/:pipeline/:phase/:app/detail",
      name: "App details",
      component: AppsDetail,
      props: true
    },
    {
      path: "/pipeline/:pipeline/:phase/:app/logspopup",
      name: "App logs popup",
      component: AppsLogsPopUp,
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
    },
    {
      path: "/login",
      name: "Login",
      component: Login
    },
    {
      path: "/events",
      name: "Events",
      component: EventsView
    },
    {
      path: "/templates",
      name: "Templates",
      component: Serviceslist
    },
  ]
})