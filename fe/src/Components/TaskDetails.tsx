import { useEffect, useRef } from "react";
import type { Task } from "../types/Task";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

function TaskDetails({ task, onClose }: TaskDetailsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    dialog.showModal();

    return () => {
      dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="task-details"
      aria-labelledby="task-details-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button
        type="button"
        className="task-details-close"
        aria-label="Close task details"
        onClick={onClose}
        autoFocus
      >
        ×
      </button>

      <h2 id="task-details-title">{task.title}</h2>

      <dl className="task-details-fields">
        <div>
          <dt>Status</dt>
          <dd>{statusLabels[task.status]}</dd>
        </div>

        <div>
          <dt>Priority</dt>
          <dd className="task-details-priority">{task.priority}</dd>
        </div>

        <div>
          <dt>Due date</dt>
          <dd>
            {task.dueDate ? (
              <time dateTime={task.dueDate}>{task.dueDate}</time>
            ) : (
              "No due date"
            )}
          </dd>
        </div>
      </dl>

      <section className="task-details-section">
        <h3>Description</h3>
        <p>{task.description}</p>
      </section>

      <section className="task-details-section">
        <h3>Checklist</h3>

        {task.checklist.length === 0 ? (
          <p>No checklist items.</p>
        ) : (
          <ul className="task-details-checklist">
            {task.checklist.map((item) => (
              <li key={item.id}>
                <span>{item.completed ? "✓" : "○"}</span>
                {item.text}
                <span className="checklist-status">
                  {item.completed ? "Completed" : "Incomplete"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="task-details-section">
        <h3>Comments ({task.comments.length})</h3>

        {task.comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          task.comments.map((comment) => (
            <div key={comment.id} className="task-details-comment">
              <strong>{comment.author}</strong>
              <p>{comment.text}</p>
            </div>
          ))
        )}
      </section>
    </dialog>
  );
}

export default TaskDetails;
