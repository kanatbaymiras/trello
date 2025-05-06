import axios from "axios";
import type { Card } from "../types/boards";

export const fetchCardById = async (id: number) => {
  try {
    const response = await axios.get(`http://localhost:3001/cards/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching card by ID:", error);
    throw error;
  }
};

export const fetchCardsByBoardAndColumnId = async (
  boardId: number,
  columnId: number
) => {
  try {
    const response = await axios.get(
      `http://localhost:3001/cards?boardId=${boardId}&columnId=${columnId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Ошибка при загрузке карточек для доски ${boardId} и колонки ${columnId}:`,
        error.message
      );
      throw new Error(`Не удалось загрузить карточки: ${error.message}`);
    } else {
      console.error(
        `Неожиданная ошибка при загрузке карточек для доски ${boardId} и колонки ${columnId}:`,
        error
      );
      throw new Error("Произошла неожиданная ошибка при загрузке карточек.");
    }
  }
};

export const addCardToColumn = async (card: Card) => {
  try {
    const response = await axios.post(`http://localhost:3001/cards`, card);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Ошибка при добавлении карточки:", error.message);
      throw new Error(`Не удалось добавить карточку: ${error.message}`);
    } else {
      console.error("Неожиданная ошибка при добавлении карточки:", error);
      throw new Error("Произошла неожиданная ошибка при добавлении карточки.");
    }
  }
};

export const updateCardDescription = async (
  id: number,
  newDescription: string
) => {
  try {
    const card: Card = await fetchCardById(id);

    card.description = newDescription;

    const response = await axios.put(`http://localhost:3001/cards/${id}`, card);
    const updatedCard = response.data["0"] || response.data;

    return updatedCard;
  } catch (error) {
    console.error("Error in updateCardDescription:", error);
    throw error; //
  }
};
