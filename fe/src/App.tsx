import { useState } from "react";
import "./App.css";
import initialTasks from "./assets/fakeDB/tasks.ts";
import type { Task } from "./types/Task.ts";
import TaskCard from "./Components/TaskCard.tsx";
import TaskDetails from "./Components/TaskDetails.tsx";

function App() {
  const [tasksList, setTasksList] = useState<Task[]>(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = tasksList.find((task) => task.id === selectedTaskId);

  const todoTasks = tasksList.filter((task) => task.status === "todo");
  const inProgressTasks = tasksList.filter(
    (task) => task.status === "in-progress",
  );
  const doneTasks = tasksList.filter((task) => task.status === "done");

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
          <button type="button" className="new-task-button">
            + New Task
          </button>
        </div>
      </header>
      <section className="tasks" aria-labelledby="tasks-heading">
        <h2>Tasks</h2>

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
              {todoTasks.map((task) => {
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelect={setSelectedTaskId}
                  />
                );
              })}
            </ul>
          </section>
          <section aria-labelledby="in-progress-heading">
            <h3 id="progress-heading" className="column-heading">
              <span
                className="status-dot status-dot--progress"
                aria-hidden="true"
              />
              In Progress
            </h3>
            <ul className="task-list">
              {inProgressTasks.map((task) => {
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelect={setSelectedTaskId}
                  />
                );
              })}
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
              {doneTasks.map((task) => {
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelect={setSelectedTaskId}
                  />
                );
              })}
            </ul>
          </section>
        </div>
      </section>
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </main>
  );
}

export default App;
