import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { useParams } from 'react-router';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './layouts/dashboard';
import DashboardPage from './pages';
import SignInPage from './pages/signIn';
import ListDetailPage from './pages/listdetail'
import { ListProvider } from './ListContext';

const ListDetailWithProvider = () => {
  const { listId } = useParams<{ listId: string }>();
  console.log("ListDetailWithProvider - listId:", listId); // Debug log
  if (!listId) return <div>Error: No list ID</div>;
  return (
    <ListProvider listId={listId}>
      <ListDetailPage />
    </ListProvider>
  );
};

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '/',
            Component: DashboardPage,
            children: [
              {
              path: 'list/:listId',
              Component: ListDetailWithProvider,
            },
            ]
          },
          /*{
            path: '/orders',
            Component: OrdersPage,
          },*/
        ],
      },
      {
        path: '/sign-in',
        Component: SignInPage,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
