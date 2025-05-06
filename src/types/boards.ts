export interface Board {
  id: number;
  title: string;
}

export interface Card {
  id: number;
  title: string;
  description: string;
  columnId: number;
  boardId: number;
}

export interface Column {
  id: number;
  title: string;
  boardId: number;
}
