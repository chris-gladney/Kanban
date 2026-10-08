export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string | null;
  position: number;
  checklist: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  comments: {
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }[];
}
