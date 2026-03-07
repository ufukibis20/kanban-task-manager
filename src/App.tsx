import { useEffect, useState } from "react";
import "./App.css";

type Status = "todo" | "doing" | "done";

type Task = {
  id: string;
  title: string;
  status: Status;
};

const defaultTasks: Task[] = [
  { id: "1", title: "React Projekt starten", status: "todo" },
  { id: "2", title: "Kanban Board bauen", status: "doing" },
  { id: "3", title: "GitHub Repo erstellen", status: "done" },
  { id: "4", title: "Portfolio vorbereiten", status: "todo" },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
      return JSON.parse(savedTasks);
    }

    return defaultTasks;
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      status: "todo",
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setNewTaskTitle("");
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const updateTaskStatus = (id: string, newStatus: Status) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = (newStatus: Status) => {
    if (!draggedTaskId) return;

    updateTaskStatus(draggedTaskId, newStatus);
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const renderColumn = (status: Status, title: string) => {
    const filteredTasks = tasks.filter((task) => task.status === status);

    return (
      <div
        className="column"
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => handleDrop(status)}
      >
        <h2 className="column-title">{title}</h2>

        {filteredTasks.length === 0 ? (
          <p className="empty-state">Noch keine Aufgaben in dieser Spalte.</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-card ${
                draggedTaskId === task.id ? "task-card-dragging" : ""
              }`}
              draggable
              onDragStart={() => handleDragStart(task.id)}
              onDragEnd={handleDragEnd}
            >
              <span className="task-title">{task.title}</span>

              <select
                className="task-select"
                value={task.status}
                onChange={(event) =>
                  updateTaskStatus(task.id, event.target.value as Status)
                }
              >
                <option value="todo">Todo</option>
                <option value="doing">Doing</option>
                <option value="done">Done</option>
              </select>

              <button
                className="delete-button"
                onClick={() => deleteTask(task.id)}
              >
                Löschen
              </button>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="app">
      <h1 className="app-title">Kanban Task Manager</h1>

      <div className="task-form">
        <input
          className="task-input"
          type="text"
          placeholder="Neue Aufgabe eingeben"
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              addTask();
            }
          }}
        />
        <button className="add-button" onClick={addTask}>
          Aufgabe hinzufügen
        </button>
      </div>

      <div className="board">
        {renderColumn("todo", "Todo")}
        {renderColumn("doing", "Doing")}
        {renderColumn("done", "Done")}
      </div>
    </div>
  );
}

export default App;