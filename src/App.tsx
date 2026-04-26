import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from "./pages/Login"
import Register from './pages/Register'
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Folders from './pages/Folders';
import FolderDetails from './pages/FolderDetails';

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
    ],
  },
]);

function App() {
  // RouterProvider se encarga de inyectar las rutas en toda tu app
  return <RouterProvider router={router} />;
}

export default App;

