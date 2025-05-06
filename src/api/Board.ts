import axios from "axios";
import type { BoardDTO, Card } from "../types/boards";

export const fetchBoards = async () => {
  try {
    const response = await axios.get("http://localhost:3001/boards");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Ошибка при загрузке досок:", error.message);
      throw new Error(`Не удалось загрузить доски: ${error.message}`);
    } else {
      console.error("Неожиданная ошибка при загрузке досок:", error);
      throw new Error("Произошла неожиданная ошибка при загрузке досок.");
    }
  }
};

export const fetchBoardById = async (id: string) => {
  try {
    const response = await axios.get(`http://localhost:3001/boards/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Ошибка при загрузке доски с ID ${id}:`, error.message);
      throw new Error(
        `Не удалось загрузить доску с ID ${id}: ${error.message}`
      );
    } else {
      console.error(`Неожиданная ошибка при загрузке доски с ID ${id}:`, error);
      throw new Error(
        `Произошла неожиданная ошибка при загрузке доски с ID ${id}.`
      );
    }
  }
};

export const addBoard = async (title: string) => {
  const response = await axios.post(`http://localhost:3001/boards`, { title });
  return response.data;
};

export const deleteBoardById = async (boardId: string) => {
  try {
    const { data: columns } = await axios.get(
      `http://localhost:3001/columns?boardId=${boardId}`
    );

    for (const column of columns) {
      const { data: cards } = await axios.get(
        `http://localhost:3001/cards?columnId=${column.id}`
      );

      await Promise.all(
        cards.map((card: Card) =>
          axios.delete(`http://localhost:3001/cards/${card.id}`)
        )
      );

      await axios.delete(`http://localhost:3001/columns/${column.id}`);
    }

    const response = await axios.delete(
      `http://localhost:3001/boards/${boardId}`
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при каскадном удалении доски:", error);
    throw error;
  }
};

export const updateBoard = async (id: string, board: BoardDTO) => {
  const response = await axios.put(`http://localhost:3001/boards/${id}`, board);
  return response.data;
};
