import { useContext } from 'react'
import { AuthContext } from './context/AuthContext.jsx';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Statistics from './pages/Statistics.jsx';
import Products from './pages/Products.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  const { currentUser, dispatch } = useContext(AuthContext);

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>}>
          {/* Default Route */}
          <Route index element={<Statistics />} />
          {/* Nested Routes */}
          <Route path="statistics" element={<Statistics />} />
          <Route path="products" element={<Products />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
