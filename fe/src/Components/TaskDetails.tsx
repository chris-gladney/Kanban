import { useEffect, useRef, useState } from "react";
import type { Task } from "../types/Task";

type TaskDetailsChanges = Partial<
  Pick<Task, "status" | "priority" | "dueDate">
>;
interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => Promise<void>;
}

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

function TaskDetails({ task, onClose, onSave }: TaskDetailsProps) {
  const [draftTask, setDraftTask] = useState<Task>(task);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    dialog.showModal();

    return () => {
      dialog.close();
    };
  }, []);

  const completedCount = draftTask.checklist.filter(
    (item) => item.completed,
  ).length;

  const formattedDueDate = draftTask.dueDate
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(new Date(draftTask.dueDate))
    : "No due date";

  function updateDraft(
    changes: Partial<Pick<Task, "status" | "priority" | "dueDate">>,
  ) {
    setDraftTask((previous) => ({
      ...previous,
      ...changes,
    }));
  }

  function toggleChecklist(itemId: string) {
    setDraftTask((previous) => ({
      ...previous,
      checklist: previous.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      ),
    }));
  }

  function addDraftComment() {
    const text = commentText.trim();
    const author = commentAuthor.trim();

    if (!text || !author) return;

    const comment: Task["comments"][number] = {
      id: crypto.randomUUID(),
      author,
      text,
      createdAt: new Date().toISOString(),
    };

    setDraftTask((previous) => ({
      ...previous,
      comments: [...previous.comments, comment],
    }));

    setCommentText("");
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(draftTask);
      onClose();
    } catch {
      setSaveError("Could not save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="task-details"
      aria-labelledby="task-details-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!isSaving) onClose();
      }}
    >
      <button
        type="button"
        className="task-details-close"
        aria-label="Close task details"
        onClick={onClose}
        autoFocus
      >
        x
      </button>

      <h2 id="task-details-title">{task.title}</h2>
      <fieldset className="task-edit-fields" disabled={isSaving}>
        <dl className="task-details-fields">
          <div>
            <dt>
              <label htmlFor="task-status">Status</label>
            </dt>
            <dd>
              <select
                id="task-status"
                className="details-control"
                value={task.status}
                onChange={(event) =>
                  updateDraft({ status: event.target.value as Task["status"] })
                }
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </dd>
          </div>

          <div>
            <dt>
              <label htmlFor="task-priority">Priority</label>
            </dt>
            <dd>
              <select
                id="task-priority"
                className="details-control"
                value={task.priority}
                onChange={(event) =>
                  updateDraft({
                    priority: event.target.value as Task["priority"],
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </dd>
          </div>

          <div>
            <dt>
              <label htmlFor="task-due-date">Due date</label>
            </dt>
            <dd>
              <input
                id="task-due-date"
                className="details-control"
                type="date"
                value={task.dueDate ?? ""}
                onChange={(event) =>
                  updateDraft({ dueDate: event.target.value || null })
                }
              />
            </dd>
          </div>
        </dl>

        <section className="task-details-section">
          <h3>Description</h3>
          <p>{task.description}</p>
        </section>

        <section className="task-details-section">
          <div className="details-section-heading">
            <h3>Checklist</h3>
            <span>
              {completedCount} / {task.checklist.length}
            </span>
          </div>

          <ul className="task-details-checklist">
            {draftTask.checklist.map((item) => (
              <li key={item.id}>
                <label className="checklist-label">
                  <input
                    type="checkbox"
                    className="checklist-input"
                    checked={item.completed}
                    onChange={() => toggleChecklist(item.id)}
                  />
                  <span>{item.text}</span>
                </label>
              </li>
            ))}
          </ul>

          {task.checklist.length === 0 && <p>No checklist items.</p>}
        </section>

        <section className="task-details-section">
          <div className="details-section-heading">
            <h3>Comments</h3>

            <span className="details-comment-count">
              <svg
                className="details-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M21 14a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z" />
              </svg>
              {draftTask.comments.length}
            </span>
          </div>

          {draftTask.comments.map((comment) => (
            <div key={comment.id} className="task-details-comment">
              <strong>{comment.author}</strong>
              <p>{comment.text}</p>
            </div>
          ))}
          <form
            className="comment-form"
            onSubmit={(event) => {
              event.preventDefault();
              addDraftComment();
            }}
          >
            <label htmlFor="comment-author">Author</label>

            <input
              id="comment-author"
              className="details-control"
              type="text"
              value={commentAuthor}
              onChange={(event) => setCommentAuthor(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />
            <label htmlFor="new-comment">Add a comment</label>

            <textarea
              id="new-comment"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment…"
              rows={3}
              required
            />

            <button
              type="submit"
              className="comment-submit"
              disabled={!commentText.trim() || !commentAuthor.trim()}
            >
              Add comment
            </button>
          </form>
        </section>
      </fieldset>
      {saveError && (
        <p className="save-error" role="alert">
          {saveError}
        </p>
      )}

      <button
        type="button"
        className="details-save-button"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving…" : "Save changes"}
      </button>
    </dialog>
  );
}

export default TaskDetails;
