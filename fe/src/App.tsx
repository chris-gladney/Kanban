import { useState } from "react";
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

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
            <ul className="task-list"></ul>
          </section>
          <section aria-labelledby="in-progress-heading">
            <h3 id="progress-heading" className="column-heading">
              <span
                className="status-dot status-dot--progress"
                aria-hidden="true"
              />
              In Progress
            </h3>
            <ul className="task-list"></ul>
          </section>
          <section aria-labelledby="done-heading">
            <h3 id="done-heading" className="column-heading">
              <span
                className="status-dot status-dot--done"
                aria-hidden="true"
              />
              Done
            </h3>
            <ul className="task-list"></ul>
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;
