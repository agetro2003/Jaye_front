import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from "./pages/Login"
import Register from './pages/Register'
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

/* 
X: 1
T: Piratas del caribe
C: Pepe el musico
M: 4/4
L: 1/8
K: C
V: 1
|E G A2 A2 A B | c2 c2 c d B2 |B2 A G G A z2|
|E G A2 A2 A B | c2 c2 c d B2 |B2 A G A z2 z|
|E G A2 A2 A c | d2 d2 d e f2 |f2 e d e A z2|
|A B c2 c2 d2 | e A z2 A c B2 |B2 c A B z2 z| 
|e4 f4 | e2e2e2 ed z2| c4 d4 |c2 c2 B2 A2 |
|ABc e2 ABc f2 | Abc e2e2e2 ed |c2 d2 c c B A|
*/