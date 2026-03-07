import { useState } from "react";

type Status = "todo" | "doing" | "done";

type Task = {
  id: string;
  title: string;
  status: Status;
};

function App() {
  const [tasks] = useState<Task[]>([
    { id: "1", title: "React Projekt starten", status: "todo" },
    { id: "2", title: "Kanban Board bauen", status: "doing" },
    { id: "3", title: "GitHub Repo erstellen", status: "done" },
    { id: "4", title: "Portfolio vorbereiten", status: "todo" }
  ]);

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
                borderRadius: "6px"
              }}
            >
              {task.title}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Kanban Task Manager</h1>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {renderColumn("todo", "Todo")}
        {renderColumn("doing", "Doing")}
        {renderColumn("done", "Done")}
      </div>
    </div>
  );
}

export default App;