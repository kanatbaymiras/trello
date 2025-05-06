import axios from "axios";

export const fetchColumnsByBoardId = async (id: string) => {
  const response = await axios.get(
    `http://localhost:3001/columns?boardId=${id}`
  );
  return response.data;
};

import type { ColumnDTO, Column, Card } from "../types/boards";

export const addColumnToBoard = async (
  columnDTO: ColumnDTO
): Promise<Column> => {
  const response = await axios.post(`http://localhost:3001/columns`, columnDTO);
  return response.data;
};

export const deleteColumn = async (columnId: string) => {
  try {
    const { data: cards } = await axios.get(
      `http://localhost:3001/cards?columnId=${columnId}`
    );

    await Promise.all(
      cards.map((card: Card) =>
        axios.delete(`http://localhost:3001/cards/${card.id}`)
      )
    );

    const response = await axios.delete(
      `http://localhost:3001/columns/${columnId}`
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при удалении колонки и карточек:", error);
    throw error;
  }
};

export const updateColumn = async (id: string, columnDTO: ColumnDTO) => {
  const response = await axios.put(
    `http://localhost:3001/columns/${id}`,
    columnDTO
  );
  return response.data;
};
