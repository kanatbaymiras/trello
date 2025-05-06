export interface Board {
  id: string;
  title: string;
}

export interface BoardDTO {
  title: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
  boardId: string;
}

export interface CardDTO {
  title: string;
  description: string;
  columnId: string;
  boardId: string;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
}

export interface ColumnDTO {
  title: string;
  boardId: string;
}
