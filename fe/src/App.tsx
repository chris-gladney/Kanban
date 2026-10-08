import { useState, useEffect, useRef } from "react";
import type { DragEvent } from "react";
import type { Task, TaskStatus } from "./types/Task.ts";
import "./App.css";

import TaskCard from "./Components/TaskCard.tsx";
import TaskDetails from "./Components/TaskDetails.tsx";
import AddTask, { type NewTaskData } from "./Components/AddTask.tsx";

const TASKS_API = "http://localhost:3001/api/tasks";

const columns: {
  status: TaskStatus;
  label: string;
  dotClass: string;
}[] = [
  { status: "todo", label: "To Do", dotClass: "status-dot--todo" },
  {
    status: "in-progress",
    label: "In Progress",
    dotClass: "status-dot--progress",
  },
  { status: "done", label: "Done", dotClass: "status-dot--done" },
];

function App() {
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [createError, setCreateError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const [moveError, setMoveError] = useState("");

  const moveInFlight = useRef(false);

  const filteredTasks = tasksList.filter((task) =>
    task.title.toLowerCase().includes(appliedSearch.trim().toLowerCase()),
  );

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
        const errorBody = await response.json();

        throw new Error(errorBody.message || "Failed to create task");
      }

      const createdTask: Task = await response.json();

      setTasksList((previousTasks) => [...previousTasks, createdTask]);

      setIsAddingTask(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not create the task. Please try again.";

      console.error("Task creation failed:", error);
      setCreateError(message);
    }
  }

  function startTaskDrag(event: DragEvent<HTMLLIElement>, taskId: string) {
    if (moveInFlight.current) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";

    setDraggedTaskId(taskId);
    setMoveError("");
  }

  function endTaskDrag() {
    setDraggedTaskId(null);
    setOverColumn(null);
  }

  function dragOverColumn(event: DragEvent<HTMLElement>, status: TaskStatus) {
    // Ignore files or content dragged in from outside the board.
    if (!draggedTaskId || moveInFlight.current) return;

    // Required: without this, the browser won't allow a drop.
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    setOverColumn(status);
  }

  async function dropTask(
    event: DragEvent<HTMLElement>,
    newStatus: TaskStatus,
  ): Promise<void> {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("text/plain");

    if (!draggedTaskId || taskId !== draggedTaskId) return;

    endTaskDrag();

    if (moveInFlight.current) return;

    const originalTask = tasksList.find((task) => task.id === taskId);

    if (!originalTask || originalTask.status === newStatus) return;

    const previousStatus = originalTask.status;

    moveInFlight.current = true;
    setIsMovingTask(true);
    setMoveError("");

    setTasksList((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    try {
      const response = await fetch(`${TASKS_API}/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to move task");
      }

      const savedTask: Task = await response.json();

      setTasksList((previousTasks) =>
        previousTasks.map((task) =>
          task.id === savedTask.id ? savedTask : task,
        ),
      );
    } catch {
      setTasksList((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId ? { ...task, status: previousStatus } : task,
        ),
      );

      setMoveError("Could not save the move. Please try again.");
    } finally {
      moveInFlight.current = false;
      setIsMovingTask(false);
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
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="filter-button"
            onClick={() => setAppliedSearch(searchInput)}
          >
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

        <div className="board-columns" aria-busy={isMovingTask}>
          {columns.map((column) => (
            <section
              key={column.status}
              aria-labelledby={`${column.status}-heading`}
              className={
                overColumn === column.status ? "board-column--over" : undefined
              }
              onDragOver={(event) => dragOverColumn(event, column.status)}
              onDragLeave={(event) => {
                const nextTarget = event.relatedTarget;

                if (
                  !(nextTarget instanceof Node) ||
                  !event.currentTarget.contains(nextTarget)
                ) {
                  setOverColumn((current) =>
                    current === column.status ? null : current,
                  );
                }
              }}
              onDrop={(event) => {
                void dropTask(event, column.status);
              }}
            >
              <h3 id={`${column.status}-heading`} className="column-heading">
                <span
                  className={`status-dot ${column.dotClass}`}
                  aria-hidden="true"
                />
                {column.label}
              </h3>

              <ul className="task-list">
                {filteredTasks
                  .filter((task) => task.status === column.status)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onSelect={setSelectedTaskId}
                      onDragStart={startTaskDrag}
                      onDragEnd={endTaskDrag}
                      isDragging={draggedTaskId === task.id}
                      disabled={isMovingTask}
                    />
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      {isMovingTask && <p role="status">Saving task move…</p>}
      {moveError && <p role="alert">{moveError}</p>}

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
