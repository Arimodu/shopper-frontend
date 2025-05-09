import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import DashboardPage from "./pages";
import SignInPage from "./pages/signIn";
import ListDetailPage from "./pages/listdetail";
import { ApiProvider } from "./ApiContext";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: DashboardPage,
        children: [
          {
            path: "list/:listId",
            Component: ListDetailPage,
          },
        ],
      },
      {
        path: "/sign-in",
        Component: SignInPage,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApiProvider>
      <RouterProvider router={router} />
    </ApiProvider>
  </React.StrictMode>
);
