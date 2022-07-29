import React from "react";


//Docs
//const ChangeLog = React.lazy(() => import("./pages/Docs/ChangeLog"));
//const Components = React.lazy(() => import("./pages/Docs/Components"));
//const Documentation = React.lazy(() => import("./pages/Docs/Documentation"));
//const Widget = React.lazy(() => import("./pages/Docs/widget"));

//const Forums = React.lazy(() => import("./pages/Forums/index"));
//const Blog = React.lazy(() => import("./pages/Blog/index"));
const HomePage = React.lazy(() => import("./pages/HomePage/index"));
const PageError = React.lazy(() => import("./pages/Pages/Special/PageError"));
const Collections = React.lazy(() => import("./pages/Collections/index"));
const Test = React.lazy(() => import("./pages/test/PageError"));
const PageInvoice = React.lazy(() =>
  import("./pages/Pages/Account/AccountView")
);

const Dashboard = React.lazy(() => import('./pages/Dashboard/index'));
const Collection = React.lazy(() => import("./pages/Pages/CaseStudy/Collection"));
const Batch = React.lazy(() => import("./pages/Pages/Batch/Cart"));
const routes = [
  

  // Landings
  //{ path: "/index-blog", component: Blog, isTopbarDark: true },
  //{ path: "/index-forums", component: Forums, isTopbarDark: true },

  //Docs
  //{ path: "/changelog", component: ChangeLog, isTopbarDark: true },
  //{ path: "/components", component: Components, isTopbarDark: true },
  //{ path: "/documentation", component: Documentation, isTopbarDark: true },
  //{ path: "/widget", component: Widget, isTopbarDark: true },

  { path: "/collections", component: Collections, isTopbarDark: true },
  { path: "/account", component: PageInvoice, isTopbarDark: true },
  { path: "/dashboard", component: Dashboard },

  { path: "/collection/:address", component: Collection },

  { path: "/test", component: Test, isWithoutLayout: true, exact: false },
  { path: "/batch", component: Batch, isTopbarDark: true },

  //Index Main
  { path: "/index", component: HomePage, isTopbarDark: true },

  //Index root
  { path: "/", component: HomePage, isTopbarDark: true },
  //{ path: "/old", component: Root, isWithoutLayout: true, exact: true },
  { component: PageError, isWithoutLayout: true, exact: false },
];

export default routes;
