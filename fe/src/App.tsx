import { useState, useEffect } from "react";
import "./App.css";

import type { Task } from "./types/Task.ts";
import TaskCard from "./Components/TaskCard.tsx";
import TaskDetails from "./Components/TaskDetails.tsx";
import AddTask, { type NewTaskData } from "./Components/AddTask.tsx";

const TASKS_API = "http://localhost:3001/api/tasks";

function App() {
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      try {
        const response = await fetch(TASKS_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        const tasks: Task[] = await response.json();
        setTasksList(tasks);
      } catch {
        if (!controller.signal.aborted) {
          setLoadError(
            "Could not load tasks. Check that the server is running.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTasks();

    return () => controller.abort();
  }, []);

  const selectedTask = tasksList.find((task) => task.id === selectedTaskId);

  const todoTasks = tasksList.filter((task) => task.status === "todo");
  const inProgressTasks = tasksList.filter(
    (task) => task.status === "in-progress",
  );
  const doneTasks = tasksList.filter((task) => task.status === "done");

  async function saveTask(updatedTask: Task): Promise<void> {
    const response = await fetch(`${TASKS_API}/${updatedTask.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });

    if (!response.ok) {
      throw new Error("Failed to save task");
    }

    const savedTask: Task = await response.json();

    setTasksList((previousTasks) =>
      previousTasks.map((task) =>
        task.id === savedTask.id ? savedTask : task,
      ),
    );
  }

  async function createTask(taskData: NewTaskData): Promise<void> {
    setCreateError("");

    const newTask: Omit<Task, "id"> = {
      ...taskData,
      comments: [],
      category: "Design",
      position: 1,
    };

    try {
      const response = await fetch(TASKS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask: Task = await response.json();

      setTasksList((previousTasks) => [...previousTasks, createdTask]);

      setIsAddingTask(false);
    } catch {
      setCreateError("Could not create the task. Please try again.");
    }
  }

  return (
    <main>
      <header>
        <div className="title-block">
          <h1>Kanban Board</h1>
          <p>A better experience, one task at a time.</p>
        </div>

        <div className="board-controls">
          <div className="search-field">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>

            <input
              type="search"
              aria-label="Search tasks"
              placeholder="Search tasks..."
            />
          </div>

          <button type="button" className="filter-button">
            Filter
          </button>

          <button
            type="button"
            className="new-task-button"
            disabled={isLoading || Boolean(loadError)}
            onClick={() => {
              setCreateError("");
              setIsAddingTask(true);
            }}
          >
            + New Task
          </button>
        </div>
      </header>

      {isLoading && <p role="status">Loading tasks…</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {createError && <p role="alert">{createError}</p>}

      <section className="tasks" aria-labelledby="tasks-heading">
        <h2 id="tasks-heading">Tasks</h2>

        <div className="board-columns">
          <section aria-labelledby="todo-heading">
            <h3 id="todo-heading" className="column-heading">
              <span
                className="status-dot status-dot--todo"
                aria-hidden="true"
              />
              To Do
            </h3>

            <ul className="task-list">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSelect={setSelectedTaskId}
                />
              ))}
            </ul>
          </section>

          <section aria-labelledby="in-progress-heading">
            <h3 id="in-progress-heading" className="column-heading">
              <span
                className="status-dot status-dot--progress"
                aria-hidden="true"
              />
              In Progress
            </h3>

            <ul className="task-list">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSelect={setSelectedTaskId}
                />
              ))}
            </ul>
          </section>

          <section aria-labelledby="done-heading">
            <h3 id="done-heading" className="column-heading">
              <span
                className="status-dot status-dot--done"
                aria-hidden="true"
              />
              Done
            </h3>

            <ul className="task-list">
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSelect={setSelectedTaskId}
                />
              ))}
            </ul>
          </section>
        </div>
      </section>

      {selectedTask && (
        <TaskDetails
          key={selectedTask.id}
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onSave={saveTask}
        />
      )}

      {isAddingTask && (
        <AddTask
          onClose={() => {
            setIsAddingTask(false);
            setCreateError("");
          }}
          onCreate={createTask}
        />
      )}
    </main>
  );
}

export default App;
