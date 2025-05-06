import { useParams } from "react-router";
import { fetchBoardById } from "../api/Board";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  addColumnToBoard,
  fetchColumnsByBoardId,
  deleteColumn,
  updateColumn,
} from "../api/Column";
import {
  fetchCardsByBoardAndColumnId,
  addCardToColumn,
  updateCardDescription,
  deleteCard,
} from "../api/Card";
import type { Board, Column, Card, CardDTO } from "../types/boards";
import { useTheme } from "../Theme/useTheme";
import ThemeToggleButton from "../Theme/ThemeToggleButton";

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<{ [key: string]: Card[] }>({});
  const [newCardDetails, setNewCardDetails] = useState<{
    [key: string]: { title: string; description: string };
  }>({});
  const [showInputs, setShowInputs] = useState<{ [key: string]: boolean }>({});
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>("");
  const [newColumnTitle, setNewColumnTitle] = useState<string>("");
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState<string>("");

  const { theme } = useTheme();

  useEffect(() => {
    const getBoard = async () => {
      if (id) {
        const boardData = await fetchBoardById(id);
        setBoard(boardData);

        const columnsData = await fetchColumnsByBoardId(id);
        setColumns(columnsData);

        const allCards: { [key: string]: Card[] } = {};
        for (const column of columnsData) {
          const columnCards = await fetchCardsByBoardAndColumnId(id, column.id);
          allCards[column.id] = columnCards;
        }
        setCards(allCards);
      }
    };

    getBoard();
  }, [id]);

  const handleBackClick = () => {
    navigate("/");
  };

  const handleAddCard = async (columnId: string) => {
    const { title, description } = newCardDetails[columnId] || {};
    if (title?.trim() && description?.trim()) {
      const newCard: CardDTO = {
        title: title,
        description: description,
        columnId: columnId,
        boardId: board ? board.id : "",
      };

      const newCardWithId = await addCardToColumn(newCard);

      setCards((prevCards) => {
        const updatedCards = { ...prevCards };
        updatedCards[columnId] = [
          ...(updatedCards[columnId] || []),
          newCardWithId,
        ];
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

  const handleDeleteCard = async (cardId: string, columnId: string) => {
    try {
      await deleteCard(cardId);
      setCards((prevCards) => {
        const updatedCards = { ...prevCards };
        updatedCards[columnId] = updatedCards[columnId].filter(
          (card) => card.id !== cardId
        );
        return updatedCards;
      });
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (
      window.confirm(
        "Вы уверены, что хотите удалить эту колонку? Все карточки в ней также будут удалены."
      )
    ) {
      try {
        await deleteColumn(columnId);
        setColumns((prevColumns) =>
          prevColumns.filter((col) => col.id !== columnId)
        );
        setCards((prevCards) => {
          const updatedCards = { ...prevCards };
          delete updatedCards[columnId];
          return updatedCards;
        });
      } catch (error) {
        console.error("Error deleting column:", error);
      }
    }
  };

  const handleStartEditingColumn = (column: Column) => {
    setEditingColumnId(column.id);
    setEditingColumnTitle(column.title);
  };

  const handleSaveColumnEdit = async (columnId: string) => {
    if (!editingColumnTitle.trim()) return;

    try {
      const updatedColumn = await updateColumn(columnId, {
        title: editingColumnTitle,
        boardId: String(id),
      });
      setColumns(
        columns.map((column) =>
          column.id === columnId ? updatedColumn : column
        )
      );
      setEditingColumnId(null);
    } catch (error) {
      console.error("Error updating column:", error);
    }
  };

  const handleCancelColumnEdit = () => {
    setEditingColumnId(null);
    setEditingColumnTitle("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    columnId: string,
    field: "title" | "description"
  ) => {
    setNewCardDetails((prevDetails) => ({
      ...prevDetails,
      [columnId]: {
        ...(prevDetails[columnId] || { title: "", description: "" }),
        [field]: e.target.value,
      },
    }));
  };

  const handleToggleInputVisibility = (columnId: string) => {
    setShowInputs((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const handleEditCardDescription = (
    cardId: string,
    currentDescription: string
  ) => {
    setEditingCardId(cardId);
    setEditingDescription(currentDescription);
  };

  const handleSaveDescription = async (cardId: string) => {
    if (editingDescription.trim()) {
      const updatedCard = Object.values(cards)
        .flat()
        .find((card: Card) => card.id === cardId);

      if (updatedCard) {
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

          setEditingCardId(null);
          setEditingDescription("");
        } catch (error) {
          console.error("Error saving description:", error);
        }
      } else {
        console.error("Card not found for id:", cardId);
      }
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim() || !board) {
      alert("Введите название колонки");
      return;
    }

    const columnDTO = { title: newColumnTitle, boardId: board.id };

    try {
      const createdColumn = await addColumnToBoard(columnDTO);
      setColumns((prev) => [...prev, createdColumn]);
      setCards((prev) => ({ ...prev, [createdColumn.id]: [] }));
      setNewColumnTitle("");
    } catch (error) {
      console.error("Ошибка при добавлении колонки:", error);
    }
  };

  return (
    <div className={`min-h-screen py-10 ${theme}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
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
          <ThemeToggleButton />
        </div>
        <div className="mb-6 flex items-center gap-4">
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="Новая колонка"
            className={`p-2 rounded border text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white border-gray-300"
            }`}
          />
          <button
            onClick={handleAddColumn}
            className={`px-4 py-2 text-sm rounded shadow hover:shadow-md transition ${
              theme === "dark"
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Добавить колонку
          </button>
        </div>
        <div className="flex flex-wrap gap-6 pb-6">
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
                <div className="flex justify-between items-center mb-4">
                  {editingColumnId === column.id ? (
                    <div className="flex-1 mr-2">
                      <input
                        type="text"
                        value={editingColumnTitle}
                        onChange={(e) => setEditingColumnTitle(e.target.value)}
                        className={`w-full p-1 rounded border ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-800"
                        }`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveColumnEdit(column.id);
                          if (e.key === "Escape") handleCancelColumnEdit();
                        }}
                      />
                    </div>
                  ) : (
                    <h3
                      className={`text-xl font-semibold truncate flex-1 ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {column.title}
                    </h3>
                  )}
                  <div className="flex gap-1">
                    {editingColumnId === column.id ? (
                      <>
                        <button
                          onClick={() => handleSaveColumnEdit(column.id)}
                          className={`p-1 rounded hover:bg-opacity-20 transition ${
                            theme === "dark"
                              ? "hover:bg-green-500 text-green-400"
                              : "hover:bg-green-500 text-green-600"
                          }`}
                          title="Сохранить"
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelColumnEdit}
                          className={`p-1 rounded hover:bg-opacity-20 transition ${
                            theme === "dark"
                              ? "hover:bg-gray-500 text-gray-400"
                              : "hover:bg-gray-500 text-gray-600"
                          }`}
                          title="Отмена"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEditingColumn(column)}
                          className={`p-1 rounded hover:bg-opacity-20 transition ${
                            theme === "dark"
                              ? "hover:bg-blue-500 text-blue-400"
                              : "hover:bg-blue-500 text-blue-600"
                          }`}
                          title="Редактировать"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          className={`p-1 rounded hover:bg-opacity-20 transition ${
                            theme === "dark"
                              ? "hover:bg-red-500 text-red-400"
                              : "hover:bg-red-500 text-red-600"
                          }`}
                          title="Удалить колонку"
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
                      </>
                    )}
                  </div>
                </div>

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
                        className={`group p-3 mb-2 shadow-sm cursor-grab hover:shadow-md transition duration-150 ease-in-out rounded-xl border border-gray-200 ${
                          theme === "dark"
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white"
                        }`}
                        onClick={() =>
                          handleEditCardDescription(card.id, card.description)
                        }
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4
                              className={`font-semibold truncate text-sm ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-800"
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCard(card.id, column.id);
                            }}
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-opacity-20 transition ${
                              theme === "dark"
                                ? "hover:bg-red-500 text-red-400"
                                : "hover:bg-red-500 text-red-600"
                            }`}
                            title="Удалить карточку"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
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
