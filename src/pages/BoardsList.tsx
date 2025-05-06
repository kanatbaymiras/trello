import { useEffect, useState } from "react";
import { fetchBoards } from "../api/Board";
import { useNavigate } from "react-router";
import { useTheme } from "../Theme/useTheme";
import type { Board } from "../types/boards";

const BoardsList = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const getBoards = async () => {
      try {
        const data = await fetchBoards();
        setBoards(data);
      } catch (error) {
        console.error("ошибка при загрузке boards", error);
      }
    };
    getBoards();
  }, []);

  const handleBoardClick = (boardId: number) => {
    navigate(`/board/${boardId}`);
  };

  useEffect(() => {
    // Обновляем класс body при изменении темы
    document.body.className = theme;
  }, [theme]);

  return (
    <div className={`min-h-screen py-10`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Мои доски
          </h2>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
    ${
      theme === "dark"
        ? "bg-gray-800 text-yellow-400 focus:ring-yellow-500 hover:bg-gray-700"
        : "bg-gray-200 text-gray-800 focus:ring-gray-300 hover:bg-gray-300"
    }
  `}
          >
            {theme === "dark" ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm5.657 3.343a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM21 11a1 1 0 110 2h-1a1 1 0 110-2h1zM5.636 5.636a1 1 0 011.414 0l.707.707A1 1 0 116.343 7.757l-.707-.707a1 1 0 010-1.414zM4 12a1 1 0 110 2H3a1 1 0 110-2h1zm1.636 6.364a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM12 20a1 1 0 011-1v1a1 1 0 11-2 0v-1a1 1 0 011 1zm6.364-1.636a1 1 0 00-1.414 0l-.707.707a1 1 0 001.414 1.414l.707-.707a1 1 0 000-1.414z" />
                </svg>
                Светлая тема
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21.64 13.36A9 9 0 0110.64 2.36 7 7 0 1021.64 13.36z" />
                </svg>
                Тёмная тема
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`rounded-xl border shadow-md hover:shadow-lg transition duration-200 ease-in-out cursor-pointer p-5 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-gray-800"
              }`}
              onClick={() => handleBoardClick(board.id)}
            >
              <h3 className="text-xl font-semibold mb-2 truncate">
                {board.title}
              </h3>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } text-sm`}
              >
                Перейти к доске
              </p>
            </div>
          ))}
          {boards.length === 0 && (
            <div className="col-span-full text-center py-6 text-gray-500">
              У вас пока нет созданных досок.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardsList;
