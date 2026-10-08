import type { Task } from "../types/Task";
import type { DragEvent } from "react";

interface TaskCardProps {
  task: Task;
  onSelect: (taskId: string) => void;
  onDragStart: (event: DragEvent<HTMLLIElement>, taskId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  disabled: boolean;
}

function TaskCard({
  task,
  onSelect,
  onDragStart,
  onDragEnd,
  isDragging,
  disabled,
}: TaskCardProps) {
  const completedCount = task.checklist.filter((item) => item.completed).length;

  const checklistCount = task.checklist.length;

  return (
    <li
      className={`task-card ${isDragging ? "task-card--dragging" : ""}`}
      draggable={!disabled}
      onDragStart={(event) => onDragStart(event, task.id)}
      onDragEnd={onDragEnd}
    >
      <h4 className="task-card-title">
        <button
          type="button"
          className="task-title-button"
          disabled={disabled}
          onClick={() => onSelect(task.id)}
        >
          {task.title}
        </button>
      </h4>

      <div className="task-tags">
        <span className={`task-badge priority--${task.priority}`}>
          {task.priority}
        </span>
      </div>

      <p className="task-description">{task.description}</p>

      {checklistCount > 0 && (
        <div className="task-checklist">
          <svg
            className="task-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="m7 12 3 3 7-7" />
          </svg>

          <span
            aria-label={`${completedCount} of ${checklistCount} items completed`}
          >
            {completedCount}/{checklistCount}
          </span>

          <progress
            className={`task-progress ${
              task.status === "done" ? "task-progress--done" : ""
            }`}
            value={completedCount}
            max={checklistCount}
            aria-label={`${task.title} checklist progress`}
          />
        </div>
      )}

      <div className="task-footer">
        {task.dueDate && (
          <div className="task-meta">
            <svg
              className="task-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>

            <time dateTime={task.dueDate}>
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              }).format(new Date(task.dueDate))}
            </time>
          </div>
        )}

        <div
          className="task-meta task-comments"
          aria-label={`${task.comments.length} comments`}
        >
          <svg
            className="task-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M21 14a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z" />
          </svg>

          <span>{task.comments.length}</span>
        </div>
      </div>
    </li>
  );
}

export default TaskCard;
