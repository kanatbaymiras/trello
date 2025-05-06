import { useParams } from "react-router";
import { fetchBoardById } from "../api/Board";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchColumnsByBoardId } from "../api/Column";
import {
  fetchCardsByBoardAndColumnId,
  addCardToColumn,
  updateCardDescription,
} from "../api/Card";
import type { Board, Column, Card } from "../types/boards";
import { useTheme } from "../Theme/useTheme";
import ThemeToggleButton from "../Theme/ThemeToggleButton"; // Импортируем кнопку

const BoardPage = () => {
  const { id } = useParams();
  const boardId = Number(id);
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<{ [key: number]: Card[] }>({});
  const [newCardDetails, setNewCardDetails] = useState<{
    [key: number]: { title: string; description: string };
  }>({});
  const [showInputs, setShowInputs] = useState<{ [key: number]: boolean }>({});
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>("");

  const { theme } = useTheme(); // Получаем только 'theme'

  useEffect(() => {
    const getBoard = async () => {
      if (id) {
        const boardData = await fetchBoardById(boardId);
        setBoard(boardData);

        const columnsData = await fetchColumnsByBoardId(boardId);
        setColumns(columnsData);

        const allCards: { [key: number]: Card[] } = {};
        for (const column of columnsData) {
          const columnCards = await fetchCardsByBoardAndColumnId(
            boardId,
            column.id
          );
          allCards[column.id] = columnCards;
        }
        setCards(allCards);
      }
    };

    getBoard();
  }, [id, boardId]);

  const handleBackClick = () => {
    navigate("/");
  };

  const handleAddCard = async (columnId: number) => {
    const { title, description } = newCardDetails[columnId];
    if (title?.trim() && description?.trim()) {
      const newCard: Card = {
        id: Math.floor(Math.random() * 10000),
        title: title,
        description: description,
        columnId: columnId,
        boardId: board ? board.id : 0,
      };

      await addCardToColumn(newCard);

      setCards((prevCards) => {
        const updatedCards = { ...prevCards };
        updatedCards[columnId] = [...(updatedCards[columnId] || []), newCard];
        return updatedCards;
      });

      setNewCardDetails((prevDetails) => ({
        ...prevDetails,
        [columnId]: { title: "", description: "" },
      }));

      setShowInputs((prev) => ({
        ...prev,
        [columnId]: false,
      }));
    } else {
      alert("Введите название и описание карточки");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    columnId: number,
    field: "title" | "description"
  ) => {
    setNewCardDetails((prevDetails) => ({
      ...prevDetails,
      [columnId]: {
        ...prevDetails[columnId],
        [field]: e.target.value,
      },
    }));
  };

  const handleToggleInputVisibility = (columnId: number) => {
    setShowInputs((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const handleEditCardDescription = (
    cardId: number,
    currentDescription: string
  ) => {
    setEditingCardId(cardId);
    setEditingDescription(currentDescription);
  };

  const handleSaveDescription = async (cardId: number) => {
    if (editingDescription.trim()) {
      console.log("Editing description for cardId:", cardId); // Debug log

      const updatedCard = Object.values(cards)
        .flat()
        .find((card: Card) => card.id === cardId);

      if (updatedCard) {
        console.log("Card found, updating description:", updatedCard); // Debug log

        updatedCard.description = editingDescription;

        try {
          await updateCardDescription(cardId, editingDescription);

          setCards((prevCards) => {
            const updatedCards = { ...prevCards };
            updatedCards[updatedCard.columnId] = updatedCards[
              updatedCard.columnId
            ].map((card) => (card.id === cardId ? updatedCard : card));
            return updatedCards;
          });

          console.log("Description saved and state updated successfully."); // Debug log

          setEditingCardId(null);
          setEditingDescription("");
        } catch (error) {
          console.error("Error saving description:", error); // Error logging
        }
      } else {
        console.error("Card not found for id:", cardId); // Error logging
      }
    }
  };

  return (
    <div className={`min-h-screen py-10 ${theme}`}>
      {/* Применяем класс темы к корневому div */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          {/* Добавили justify-between */}
          <button
            onClick={handleBackClick}
            className={`inline-flex items-center rounded-xl border border-gray-200 p-2 shadow-md hover:shadow-lg transition duration-200 ease-in-out cursor-pointer text-gray-700 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white"
            }`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Назад
          </button>
          <h2
            className={`text-3xl font-bold ml-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {board?.title}
          </h2>
          <ThemeToggleButton /> {/* Используем импортированный компонент */}
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.length > 0 ? (
            columns.map((column) => (
              <div
                key={column.id}
                className={`flex-shrink-0 w-72 p-5 shadow-md rounded-xl border border-gray-200 ${
                  theme === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white"
                }`}
              >
                <h3
                  className={`text-xl font-semibold truncate mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  {column.title}
                </h3>

                <div className="mb-4">
                  <button
                    onClick={() => handleToggleInputVisibility(column.id)}
                    className={`inline-flex items-center text-sm py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition duration-150 ease-in-out ${
                      showInputs[column.id]
                        ? theme === "dark"
                          ? "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
                          : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500"
                        : theme === "dark"
                        ? "bg-blue-700 hover:bg-blue-800 text-white focus:ring-blue-700"
                        : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={
                          showInputs[column.id]
                            ? "M6 18L18 6M6 6l12 12"
                            : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                        }
                      />
                    </svg>
                    {showInputs[column.id] ? "Скрыть" : "Добавить карточку"}
                  </button>
                </div>

                {showInputs[column.id] && (
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      value={newCardDetails[column.id]?.title || ""}
                      onChange={(e) => handleInputChange(e, column.id, "title")}
                      placeholder="Заголовок"
                      className={`w-full border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white"
                      }`}
                    />
                    <textarea
                      value={newCardDetails[column.id]?.description || ""}
                      onChange={(e) =>
                        handleInputChange(e, column.id, "description")
                      }
                      placeholder="Описание"
                      rows={3}
                      className={`w-full border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white"
                      }`}
                    />
                    <button
                      onClick={() => handleAddCard(column.id)}
                      className={`inline-flex items-center text-sm py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition duration-150 ease-in-out ${
                        theme === "dark"
                          ? "bg-green-700 hover:bg-green-800 text-white focus:ring-green-700"
                          : "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500"
                      }`}
                    >
                      Добавить
                    </button>
                  </div>
                )}

                <div className="mt-4">
                  {cards[column.id] && cards[column.id].length > 0 ? (
                    cards[column.id].map((card) => (
                      <div
                        key={card.id}
                        className={`p-3 mb-2 shadow-sm cursor-grab hover:shadow-md transition duration-150 ease-in-out rounded-xl border border-gray-200 ${
                          theme === "dark"
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white"
                        }`}
                        onClick={() =>
                          handleEditCardDescription(card.id, card.description)
                        }
                      >
                        <h4
                          className={`font-semibold truncate text-sm ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {card.title}
                        </h4>
                        {card.description && (
                          <p
                            className={`mt-1 truncate text-xs ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {card.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div
                      className={`py-2 text-center text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Нет карточек
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              className={`p-6 text-center text-gray-600 rounded-xl border border-gray-200 ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white"
              }`}
            >
              В этой доске пока нет колонок
            </div>
          )}
        </div>
      </div>
      {editingCardId !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div
            className={`p-6 rounded-xl shadow-lg w-96 ${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
            }`}
          >
            <textarea
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              className={`w-full border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white"
              }`}
              rows={4}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setEditingCardId(null)}
                className={`py-2 px-3 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition duration-150 ease-in-out ${
                  theme === "dark"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                Отмена
              </button>
              <button
                onClick={() => handleSaveDescription(editingCardId)}
                className={`py-2 px-3 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition duration-150 ease-in-out ${
                  theme === "dark"
                    ? "bg-blue-700 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
