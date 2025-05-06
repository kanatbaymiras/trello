import axios from "axios";

export const fetchColumnsByBoardId = async (id: number) => {
  const response = await axios.get(
    `http://localhost:3001/columns?boardId=${id}`
  );
  return response.data;
};
