import React from "react";


//Docs
//const ChangeLog = React.lazy(() => import("./pages/Docs/ChangeLog"));
//const Components = React.lazy(() => import("./pages/Docs/Components"));
//const Documentation = React.lazy(() => import("./pages/Docs/Documentation"));
//const Widget = React.lazy(() => import("./pages/Docs/widget"));

//const Forums = React.lazy(() => import("./pages/Forums/index"));
//const Blog = React.lazy(() => import("./pages/Blog/index"));
const OnlineLearning = React.lazy(() => import("./pages/OnlineLearning/index"));
const PageError = React.lazy(() => import("./pages/Pages/Special/PageError"));
const Shop = React.lazy(() => import("./pages/Shop/index"));

const PageInvoice = React.lazy(() =>
  import("./pages/Pages/Account/AccountView")
);

const Dashboard = React.lazy(() => import('./pages/Dashboard/index'));

const routes = [
  

  // Landings
  //{ path: "/index-blog", component: Blog, isTopbarDark: true },
  //{ path: "/index-forums", component: Forums, isTopbarDark: true },

  //Docs
  //{ path: "/changelog", component: ChangeLog, isTopbarDark: true },
  //{ path: "/components", component: Components, isTopbarDark: true },
  //{ path: "/documentation", component: Documentation, isTopbarDark: true },
  //{ path: "/widget", component: Widget, isTopbarDark: true },

  { path: "/profile", component: Shop, isTopbarDark: true },
  { path: "/account", component: PageInvoice, isTopbarDark: true },
  { path: "/dashboard", component: Dashboard },

  //Index Main
  { path: "/index", component: OnlineLearning, isTopbarDark: true },

  //Index root
  { path: "/", component: OnlineLearning, isTopbarDark: true },
  //{ path: "/old", component: Root, isWithoutLayout: true, exact: true },
  { component: PageError, isWithoutLayout: true, exact: false },
];

export default routes;
