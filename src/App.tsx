import { useState } from "react";

function App() {
  const [tasks] = useState([
    { id: "1", title: "React Projekt starten", status: "todo" },
    { id: "2", title: "Kanban Board bauen", status: "doing" },
    { id: "3", title: "GitHub Repo erstellen", status: "done" },
  ]);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Kanban Task Manager</h1>

      <h2>Tasks</h2>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} ({task.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;