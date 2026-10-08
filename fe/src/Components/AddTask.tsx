import { useEffect, useRef, useState } from "react";
import type { Task } from "../types/Task";

export type NewTaskData = Pick<
  Task,
  "title" | "status" | "priority" | "description"
> & {
  dueDate: string;
  checklist: { id: string; text: string; completed: boolean }[];
};

interface AddTaskProps {
  onClose: () => void;
  onCreate: (task: NewTaskData) => void;
}

function AddTask({ onClose, onCreate }: AddTaskProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [checklistText, setChecklistText] = useState("");
  const [checklist, setChecklist] = useState<NewTaskData["checklist"]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    dialog.showModal();

    return () => dialog.close();
  }, []);

  function addChecklistItem() {
    const text = checklistText.trim();

    if (!text) return;

    setChecklist((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
      },
    ]);

    setChecklistText("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Enter a task title.");
      return;
    }

    onCreate({
      title: title.trim(),
      status,
      priority,
      dueDate,
      description: description.trim(),
      checklist,
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="add-task-dialog"
      aria-labelledby="add-task-heading"
      onCancel={onClose}
    >
      <div className="add-task-header">
        <div>
          <h2 id="add-task-heading">Add new task</h2>
          <p>Create a task and add it to your board.</p>
        </div>

        <button
          type="button"
          className="close-task-button"
          onClick={onClose}
          aria-label="Close popup"
        >
          ×
        </button>
      </div>

      <form className="add-task-form" onSubmit={handleSubmit}>
        <div className="task-form-field">
          <label htmlFor="task-title">Task title *</label>
          <input
            id="task-title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError("");
            }}
            placeholder="e.g. Design landing page"
            required
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "task-title-error" : undefined}
          />

          {error && (
            <p id="task-title-error" className="task-form-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="task-form-row">
          <div className="task-form-field">
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as Task["status"])
              }
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="task-form-field">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as Task["priority"])
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="task-form-field">
            <label htmlFor="task-due-date">Due date</label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
        </div>

        <div className="task-form-field">
          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What needs to be done?"
            rows={4}
          />
        </div>

        <div className="task-form-checklist">
          <label htmlFor="checklist-item">
            Checklist <span>Optional</span>
          </label>

          <div className="checklist-input-row">
            <input
              id="checklist-item"
              value={checklistText}
              onChange={(event) => setChecklistText(event.target.value)}
              placeholder="Add a checklist item"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addChecklistItem();
                }
              }}
            />

            <button
              type="button"
              onClick={addChecklistItem}
              disabled={!checklistText.trim()}
              aria-label="Add checklist item"
            >
              +
            </button>
          </div>

          <ul className="new-task-checklist">
            {checklist.map((item) => (
              <li key={item.id}>
                <span>{item.text}</span>
                <button
                  type="button"
                  aria-label={`Remove ${item.text}`}
                  onClick={() =>
                    setChecklist((previous) =>
                      previous.filter((entry) => entry.id !== item.id),
                    )
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="task-form-footer">
          <span>* Required</span>

          <div className="task-form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-task-button">
              Create task
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

export default AddTask;
