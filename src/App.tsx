import { useState } from "react";

type Status = "todo" | "doing" | "done";

type Task = {
  id: string;
  title: string;
  status: Status;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "React Projekt starten", status: "todo" },
    { id: "2", title: "Kanban Board bauen", status: "doing" },
    { id: "3", title: "GitHub Repo erstellen", status: "done" },
    { id: "4", title: "Portfolio vorbereiten", status: "todo" },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      status: "todo",
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setNewTaskTitle("");
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const renderColumn = (status: Status, title: string) => {
    return (
      <div style={{ width: "30%" }}>
        <h2>{title}</h2>

        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <div
              key={task.id}
              style={{
                padding: "10px",
                marginBottom: "10px",
                background: "#f3f3f3",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>{task.title}</span>

              <button
                onClick={() => deleteTask(task.id)}
                style={{
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Löschen
              </button>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Kanban Task Manager</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Neue Aufgabe eingeben"
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          style={{
            padding: "10px",
            marginRight: "10px",
            width: "300px",
          }}
        />
        <button
          onClick={addTask}
          style={{
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          Aufgabe hinzufügen
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {renderColumn("todo", "Todo")}
        {renderColumn("doing", "Doing")}
        {renderColumn("done", "Done")}
      </div>
    </div>
  );
}

export default App;