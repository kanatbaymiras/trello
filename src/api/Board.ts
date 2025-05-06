import axios from "axios";

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

export const fetchBoardById = async (id: number) => {
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
