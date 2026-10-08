import type { Task } from "../../types/Task";

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Design landing page",
    description: "Create a modern landing page.",
    status: "todo",
    priority: "high",
    category: "Design",
    dueDate: "2026-10-18",
    position: 0,
    checklist: [
      {
        id: "check-1",
        text: "Create initial wireframe",
        completed: true,
      },
      {
        id: "check-2",
        text: "Build the header",
        completed: false,
      },
    ],
    comments: [],
  },
  {
    id: "task-2",
    title: "Implement drag and drop",
    description: "Move tasks between columns and save their order.",
    status: "in-progress",
    priority: "high",
    category: "Development",
    dueDate: "2026-10-12",
    position: 0,
    checklist: [],
    comments: [
      {
        id: "comment-1",
        author: "Philip",
        text: "Start with moving tasks between columns.",
        createdAt: "2026-10-07T16:00:00Z",
      },
    ],
  },
  {
    id: "task-3",
    title: "Set up React project",
    description: "Initialise the project with TypeScript.",
    status: "done",
    priority: "low",
    category: "Development",
    dueDate: null,
    position: 0,
    checklist: [
      {
        id: "check-3",
        text: "Create the project",
        completed: true,
      },
    ],
    comments: [],
  },
];

export default initialTasks;
