import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import BoardsList from "./pages/BoardsList";
import BoardPage from "./pages/BoardPage";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {/* Главная страница с досками */}
          <Route path="/" element={<BoardsList />} />

          {/* Страница конкретной доски */}
          <Route path="/board/:id" element={<BoardPage />} />

          {/* Перенаправление всех других URL на главную страницу */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
