import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from "./pages/Login"
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Folders from './pages/Folders';
import FolderDetails from './pages/FolderDetails';
import Editor from './pages/Editor';
import Profile from './pages/Profile';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },

  {
    element: <ProtectedRoute />, 
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
     {
        path: '/folders',
        element: <Folders />, 
      },
      { 
        path: '/folder/:id', 
        element: <FolderDetails /> 
      },
      {
        path: '/editor/:songId',
        element: <Editor />,
      },
      {
        path: "/profile",
        element: <Profile />
      }
    ],
  },
]);

function App() {
  // RouterProvider se encarga de inyectar las rutas en toda tu app
  return <RouterProvider router={router} />;
}

export default App;