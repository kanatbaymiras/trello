import { useEffect, useState } from "react";
import {
  fetchBoards,
  addBoard,
  deleteBoardById,
  updateBoard,
} from "../api/Board";
import { useNavigate } from "react-router";
import { useTheme } from "../Theme/useTheme";
import type { Board } from "../types/boards";

const BoardsList = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState("");
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

  const handleBoardClick = (boardId: string) => {
    if (editingBoardId !== boardId) {
      navigate(`/board/${boardId}`);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;

    try {
      const newBoard = await addBoard(newBoardTitle);
      setBoards([...boards, newBoard]);
      setNewBoardTitle("");
      setIsCreating(false);
    } catch (error) {
      console.error("ошибка при создании доски", error);
    }
  };

  const handleStartEditing = (board: Board) => {
    setEditingBoardId(board.id);
    setEditingBoardTitle(board.title);
  };

  const handleSaveEdit = async (boardId: string) => {
    if (!editingBoardTitle.trim()) return;

    try {
      const updatedBoard = await updateBoard(boardId, {
        title: editingBoardTitle,
      });
      setBoards(
        boards.map((board) => (board.id === boardId ? updatedBoard : board))
      );
      setEditingBoardId(null);
    } catch (error) {
      console.error("ошибка при обновлении доски", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditingBoardTitle("");
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteBoardById(boardId);
      setBoards((prevBoards) => prevBoards.filter((b) => b.id !== boardId));
    } catch (err) {
      console.error("Ошибка при удалении доски", err);
    }
  };

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
              className={`relative rounded-xl border shadow-md transition duration-200 ease-in-out p-5 cursor-pointer group ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-gray-800"
              }`}
              onClick={() => handleBoardClick(board.id)}
            >
              {editingBoardId === board.id ? (
                <div className="mb-2">
                  <input
                    type="text"
                    value={editingBoardTitle}
                    onChange={(e) => setEditingBoardTitle(e.target.value)}
                    className={`w-full p-1 rounded border ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(board.id);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSaveEdit(board.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className={`px-2 py-1 rounded transition text-sm ${
                        theme === "dark"
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}

              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEditing(board);
                  }}
                  className={`p-1 rounded-full hover:bg-opacity-20 transition ${
                    theme === "dark"
                      ? "hover:bg-gray-600 text-gray-400 hover:text-white"
                      : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                  }`}
                  title="Редактировать название"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDeleteBoard(board.id, e)}
                  className={`p-1 rounded-full hover:bg-opacity-20 transition ${
                    theme === "dark"
                      ? "hover:bg-red-500 text-red-400"
                      : "hover:bg-red-500 text-red-600"
                  }`}
                  title="Удалить доску"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {isCreating ? (
            <div
              className={`rounded-xl border shadow-md p-5 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Название доски"
                className={`w-full mb-3 p-2 rounded border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateBoard}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Создать
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className={`px-4 py-2 rounded transition ${
                    theme === "dark"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className={`rounded-xl border-2 border-dashed p-5 flex items-center justify-center hover:border-solid transition ${
                theme === "dark"
                  ? "border-gray-600 hover:bg-gray-800 hover:border-gray-500 text-gray-400 hover:text-white"
                  : "border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="text-lg font-medium">+ Создать доску</span>
            </button>
          )}

          {boards.length === 0 && !isCreating && (
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
