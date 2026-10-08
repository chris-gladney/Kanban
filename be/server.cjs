const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const app = express();
const databasePath = path.join(__dirname, "tasks.json");
const port = process.env.PORT || 3001;

app.use(
  cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }),
);
app.use(express.json({ limit: "1mb" }));

// Create the file only if it does not exist. Never reset existing tasks.
if (!fs.existsSync(databasePath)) fs.writeFileSync(databasePath, "[]\n");

function readTasks() {
  const tasks = JSON.parse(fs.readFileSync(databasePath, "utf8"));
  if (!Array.isArray(tasks))
    throw new Error("tasks.json must contain an array");
  return tasks;
}

function writeTasks(tasks) {
  // Write a temporary file, then replace the database file.
  const temporaryPath = `${databasePath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(tasks, null, 2) + "\n");
  fs.renameSync(temporaryPath, databasePath);
}

const fields = [
  "title",
  "description",
  "status",
  "priority",
  "category",
  "dueDate",
  "position",
  "checklist",
  "comments",
];

function getChanges(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw Object.assign(new Error("Send a JSON object"), { status: 400 });
  }
  const changes = {};
  for (const field of fields) {
    if (Object.hasOwn(body, field)) changes[field] = body[field];
  }
  return changes;
}

function validate(task) {
  let message;

  if (typeof task.title !== "string" || !task.title.trim()) {
    message = "Title is required";
  } else if (typeof task.description !== "string") {
    message = "Description must be text";
  } else if (!["todo", "in-progress", "done"].includes(task.status)) {
    message = "Invalid status";
  } else if (!["Low", "Medium", "High"].includes(task.priority)) {
    message = "Invalid priority";
  } else if (typeof task.category !== "string") {
    message = "Category must be text";
  } else if (task.dueDate !== null && typeof task.dueDate !== "string") {
    message = "dueDate must be a string or null";
  } else if (!Number.isFinite(task.position)) {
    message = "Position must be a number";
  } else if (!Array.isArray(task.checklist) || !Array.isArray(task.comments)) {
    message = "Checklist and comments must be arrays";
  }

  if (message) {
    throw Object.assign(new Error(message), { status: 400 });
  }
}

app.get("/api/tasks", (req, res) => {
  res.json(readTasks());
});

app.post("/api/tasks", (req, res) => {
  const task = {
    description: "",
    status: "todo",
    priority: "Medium",
    category: "Design",
    dueDate: null,
    position: 1,
    checklist: [],
    comments: [],
    ...getChanges(req.body),
    id: randomUUID(),
  };
  validate(task);
  const tasks = readTasks();
  tasks.push(task);
  writeTasks(tasks);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((task) => task.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Task not found" });
  const task = { ...tasks[index], ...getChanges(req.body) };
  validate(task);
  tasks[index] = task;
  writeTasks(tasks);
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  if (!tasks.some((task) => task.id === req.params.id)) {
    return res.status(404).json({ message: "Task not found" });
  }
  writeTasks(tasks.filter((task) => task.id !== req.params.id));
  res.sendStatus(204);
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((error, req, res, next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    message: status >= 500 ? "Unable to read or save tasks" : error.message,
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Kanban API running at http://localhost:${port}/api/tasks`);
});
