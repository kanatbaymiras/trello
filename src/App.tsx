import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router";
import BoardsList from "./pages/BoardsList";
import BoardPage from "./pages/BoardPage";
import LoginPage from "./pages/LoginPage";
import React from "react";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const location = useLocation();

  if (!isAuthenticated) {
    // Перенаправляем на страницу логина, сохраняя текущий путь для последующего редиректа
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {/* Публичный маршрут для входа */}
          <Route path="/login" element={<LoginPage />} />

          {/* Защищенные маршруты */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <BoardsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/board/:id"
            element={
              <PrivateRoute>
                <BoardPage />
              </PrivateRoute>
            }
          />

          {/* Перенаправление на главную страницу (теперь защищенную) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
