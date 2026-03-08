import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Status = "todo" | "doing" | "done";
type Priority = "low" | "medium" | "high";
type Category = "work" | "personal" | "learning" | "other";
type FilterStatus = "all" | Status;
type Theme = "dark" | "light";

type Task = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  category: Category;
  dueDate: string;
  notes: string;
  createdAt: string;
};

const defaultTasks: Task[] = [
  {
    id: "1",
    title: "UI für das Dashboard finalisieren",
    status: "todo",
    priority: "high",
    category: "work",
    dueDate: "",
    notes: "Header, Stat Cards und bessere Spaltenoptik umsetzen.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Drag & Drop Verhalten testen",
    status: "doing",
    priority: "medium",
    category: "learning",
    dueDate: "",
    notes: "Drop-Zonen und Statuswechsel sauber prüfen.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Projekt auf GitHub veröffentlichen",
    status: "done",
    priority: "low",
    category: "work",
    dueDate: "",
    notes: "README und Screenshot ergänzen.",
    createdAt: new Date().toISOString(),
  },
];

const statusConfig: Record<
  Status,
  { title: string; emoji: string; description: string }
> = {
  todo: {
    title: "To Do",
    emoji: "📝",
    description: "Alles, was als Nächstes ansteht.",
  },
  doing: {
    title: "In Progress",
    emoji: "⚡",
    description: "Daran arbeitest du gerade aktiv.",
  },
  done: {
    title: "Done",
    emoji: "✅",
    description: "Erledigte Aufgaben und abgeschlossene Schritte.",
  },
};

const priorityLabel: Record<Priority, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
};

const categoryLabel: Record<Category, string> = {
  work: "Arbeit",
  personal: "Privat",
  learning: "Lernen",
  other: "Sonstiges",
};

const statusLabel: Record<Status, string> = {
  todo: "Offen",
  doing: "Läuft",
  done: "Erledigt",
};

const emptyForm = {
  title: "",
  priority: "medium" as Priority,
  category: "work" as Category,
  dueDate: "",
  notes: "",
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("kanban-final-tasks");
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("kanban-final-theme") as Theme | null;
    return savedTheme ?? "dark";
  });

  const [form, setForm] = useState(emptyForm);
  const [searchValue, setSearchValue] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<FilterStatus>("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | Category>("all");
  const [sortMode, setSortMode] = useState<"newest" | "oldest" | "priority" | "dueDate">(
    "newest"
  );
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem("kanban-final-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("kanban-final-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const stats = useMemo(() => {
    const todo = tasks.filter((task) => task.status === "todo").length;
    const doing = tasks.filter((task) => task.status === "doing").length;
    const done = tasks.filter((task) => task.status === "done").length;
    const overdue = tasks.filter((task) => isOverdue(task)).length;

    return {
      total: tasks.length,
      todo,
      doing,
      done,
      overdue,
      progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    };
  }, [tasks]);

  function isOverdue(task: Task) {
    if (!task.dueDate || task.status === "done") return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
  }

  function formatDate(dateString: string) {
    if (!dateString) return "Kein Datum";

    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  }

  function getPriorityRank(priority: Priority) {
    if (priority === "high") return 3;
    if (priority === "medium") return 2;
    return 1;
  }

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateEditForm<K extends keyof typeof editForm>(
    key: K,
    value: (typeof editForm)[K]
  ) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTask() {
    if (!form.title.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      status: "todo",
      priority: form.priority,
      category: form.category,
      dueDate: form.dueDate,
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setForm(emptyForm);
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function updateTaskStatus(id: string, newStatus: Status) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: newStatus } : task))
    );
  }

  function startEditing(task: Task) {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title,
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate,
      notes: task.notes,
    });
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditForm(emptyForm);
  }

  function saveEditing() {
    if (!editingTaskId || !editForm.title.trim()) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              title: editForm.title.trim(),
              priority: editForm.priority,
              category: editForm.category,
              dueDate: editForm.dueDate,
              notes: editForm.notes.trim(),
            }
          : task
      )
    );

    cancelEditing();
  }

  function getVisibleTasks(status: Status) {
    return tasks
      .filter((task) => task.status === status)
      .filter((task) =>
        activeStatusFilter === "all" ? true : task.status === activeStatusFilter
      )
      .filter((task) =>
        activeCategoryFilter === "all" ? true : task.category === activeCategoryFilter
      )
      .filter((task) => {
        const query = searchValue.toLowerCase().trim();
        if (!query) return true;
        return (
          task.title.toLowerCase().includes(query) ||
          task.notes.toLowerCase().includes(query) ||
          categoryLabel[task.category].toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortMode === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        if (sortMode === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }

        if (sortMode === "priority") {
          return getPriorityRank(b.priority) - getPriorityRank(a.priority);
        }

        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      });
  }

  function handleDragStart(taskId: string) {
    setDraggedTaskId(taskId);
  }

  function handleDrop(newStatus: Status) {
    if (!draggedTaskId) return;
    updateTaskStatus(draggedTaskId, newStatus);
    setDraggedTaskId(null);
  }

  function renderColumn(status: Status) {
    const visibleTasks = getVisibleTasks(status);
    const config = statusConfig[status];

    return (
      <section
        className={`column column-${status}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => handleDrop(status)}
      >
        <div className="column-top">
          <div>
            <div className="column-label">
              <span className="column-emoji">{config.emoji}</span>
              <h2 className="column-title">{config.title}</h2>
            </div>
            <p className="column-description">{config.description}</p>
          </div>
          <span className="task-count">{visibleTasks.length}</span>
        </div>

        <div className="column-content">
          {visibleTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <p>Keine passenden Aufgaben in dieser Spalte.</p>
            </div>
          ) : (
            visibleTasks.map((task) => (
              <article
                key={task.id}
                className={`task-card ${draggedTaskId === task.id ? "task-card-dragging" : ""} ${
                  isOverdue(task) ? "task-card-overdue" : ""
                }`}
                draggable={editingTaskId !== task.id}
                onDragStart={() => handleDragStart(task.id)}
                onDragEnd={() => setDraggedTaskId(null)}
              >
                {editingTaskId === task.id ? (
                  <>
                    <input
                      className="task-input"
                      type="text"
                      value={editForm.title}
                      onChange={(event) => updateEditForm("title", event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveEditing();
                        if (event.key === "Escape") cancelEditing();
                      }}
                      autoFocus
                    />

                    <div className="task-form-grid compact">
                      <select
                        className="task-select"
                        value={editForm.priority}
                        onChange={(event) =>
                          updateEditForm("priority", event.target.value as Priority)
                        }
                      >
                        <option value="low">Priorität: Niedrig</option>
                        <option value="medium">Priorität: Mittel</option>
                        <option value="high">Priorität: Hoch</option>
                      </select>

                      <select
                        className="task-select"
                        value={editForm.category}
                        onChange={(event) =>
                          updateEditForm("category", event.target.value as Category)
                        }
                      >
                        <option value="work">Kategorie: Arbeit</option>
                        <option value="personal">Kategorie: Privat</option>
                        <option value="learning">Kategorie: Lernen</option>
                        <option value="other">Kategorie: Sonstiges</option>
                      </select>

                      <input
                        className="task-input"
                        type="date"
                        value={editForm.dueDate}
                        onChange={(event) => updateEditForm("dueDate", event.target.value)}
                      />

                      <select
                        className="task-select"
                        value={task.status}
                        onChange={(event) =>
                          updateTaskStatus(task.id, event.target.value as Status)
                        }
                      >
                        <option value="todo">To Do</option>
                        <option value="doing">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>

                    <textarea
                      className="task-textarea"
                      value={editForm.notes}
                      onChange={(event) => updateEditForm("notes", event.target.value)}
                      placeholder="Notizen zur Aufgabe..."
                      rows={3}
                    />

                    <div className="task-actions">
                      <button className="action-button save-button" onClick={saveEditing}>
                        Speichern
                      </button>
                      <button className="action-button cancel-button" onClick={cancelEditing}>
                        Abbrechen
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="task-card-header">
                      <span className={`badge status-${task.status}`}>{statusLabel[task.status]}</span>
                      <span className={`badge priority-${task.priority}`}>
                        {priorityLabel[task.priority]}
                      </span>
                    </div>

                    <h3 className="task-title">{task.title}</h3>

                    <div className="task-meta-row">
                      <span className="meta-chip">{categoryLabel[task.category]}</span>
                      <span className={`meta-chip ${isOverdue(task) ? "meta-chip-danger" : ""}`}>
                        {task.dueDate ? `Fällig: ${formatDate(task.dueDate)}` : "Kein Fälligkeitsdatum"}
                      </span>
                    </div>

                    {task.notes ? <p className="task-notes">{task.notes}</p> : null}

                    <div className="task-footer">
                      <span className="created-at">Erstellt: {formatDate(task.createdAt)}</span>

                      <select
                        className="task-select"
                        value={task.status}
                        onChange={(event) =>
                          updateTaskStatus(task.id, event.target.value as Status)
                        }
                      >
                        <option value="todo">To Do</option>
                        <option value="doing">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>

                    <div className="task-actions">
                      <button className="action-button edit-button" onClick={() => startEditing(task)}>
                        Bearbeiten
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => deleteTask(task.id)}
                      >
                        Löschen
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-1" />
      <div className="background-orb background-orb-2" />

      <main className="app">
        <header className="hero">
          <div className="hero-copy card">
            <div className="hero-topbar">
              <span className="hero-kicker">Produktivität · Übersicht · Fokus</span>
              <button
                className="theme-toggle"
                onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                type="button"
              >
                {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>

            <h1 className="app-title">Kanban Task Manager</h1>
            <p className="hero-text">
              Eine moderne Kanban-App mit Prioritäten, Kategorien, Fälligkeitsdatum,
              Suche, Filtern und lokalem Speichern. Genau die Art Projekt, die im
              Portfolio sauber und fertig wirkt.
            </p>

            <div className="progress-card">
              <div>
                <span className="progress-label">Fortschritt</span>
                <strong className="progress-value">{stats.progress}% abgeschlossen</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${stats.progress}%` }} />
              </div>
            </div>
          </div>

          <div className="stats-grid card">
            <div className="stat-card">
              <span className="stat-label">Gesamt</span>
              <strong className="stat-value">{stats.total}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">To Do</span>
              <strong className="stat-value">{stats.todo}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">In Progress</span>
              <strong className="stat-value">{stats.doing}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Done</span>
              <strong className="stat-value">{stats.done}</strong>
            </div>
            <div className="stat-card stat-card-alert">
              <span className="stat-label">Überfällig</span>
              <strong className="stat-value">{stats.overdue}</strong>
            </div>
            <div className="stat-card stat-card-accent">
              <span className="stat-label">Status</span>
              <strong className="stat-value">Board aktiv</strong>
            </div>
          </div>
        </header>

        <section className="toolbar card">
          <div className="toolbar-heading">
            <div>
              <h2>Neue Aufgabe</h2>
              <p>Erfasse Aufgaben direkt mit Priorität, Kategorie und Fälligkeitsdatum.</p>
            </div>
          </div>

          <div className="task-form-grid">
            <input
              className="task-input wide"
              type="text"
              placeholder="Titel der Aufgabe"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addTask();
              }}
            />

            <select
              className="task-select"
              value={form.priority}
              onChange={(event) => updateForm("priority", event.target.value as Priority)}
            >
              <option value="low">Priorität: Niedrig</option>
              <option value="medium">Priorität: Mittel</option>
              <option value="high">Priorität: Hoch</option>
            </select>

            <select
              className="task-select"
              value={form.category}
              onChange={(event) => updateForm("category", event.target.value as Category)}
            >
              <option value="work">Kategorie: Arbeit</option>
              <option value="personal">Kategorie: Privat</option>
              <option value="learning">Kategorie: Lernen</option>
              <option value="other">Kategorie: Sonstiges</option>
            </select>

            <input
              className="task-input"
              type="date"
              value={form.dueDate}
              onChange={(event) => updateForm("dueDate", event.target.value)}
            />

            <textarea
              className="task-textarea wide"
              placeholder="Kurze Notiz oder Beschreibung"
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
              rows={3}
            />

            <button className="add-button" onClick={addTask} type="button">
              + Aufgabe hinzufügen
            </button>
          </div>

          <div className="toolbar-bottom">
            <div className="filter-group">
              <button
                className={`filter-button ${activeStatusFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveStatusFilter("all")}
              >
                Alle
              </button>
              <button
                className={`filter-button ${activeStatusFilter === "todo" ? "active" : ""}`}
                onClick={() => setActiveStatusFilter("todo")}
              >
                To Do
              </button>
              <button
                className={`filter-button ${activeStatusFilter === "doing" ? "active" : ""}`}
                onClick={() => setActiveStatusFilter("doing")}
              >
                In Progress
              </button>
              <button
                className={`filter-button ${activeStatusFilter === "done" ? "active" : ""}`}
                onClick={() => setActiveStatusFilter("done")}
              >
                Done
              </button>
            </div>

            <div className="toolbar-controls">
              <select
                className="task-select toolbar-select"
                value={activeCategoryFilter}
                onChange={(event) =>
                  setActiveCategoryFilter(event.target.value as "all" | Category)
                }
              >
                <option value="all">Alle Kategorien</option>
                <option value="work">Arbeit</option>
                <option value="personal">Privat</option>
                <option value="learning">Lernen</option>
                <option value="other">Sonstiges</option>
              </select>

              <select
                className="task-select toolbar-select"
                value={sortMode}
                onChange={(event) =>
                  setSortMode(
                    event.target.value as "newest" | "oldest" | "priority" | "dueDate"
                  )
                }
              >
                <option value="newest">Sortierung: Neueste</option>
                <option value="oldest">Sortierung: Älteste</option>
                <option value="priority">Sortierung: Priorität</option>
                <option value="dueDate">Sortierung: Fälligkeitsdatum</option>
              </select>

              <input
                className="task-input toolbar-search"
                type="text"
                placeholder="Suche nach Aufgabe, Notiz oder Kategorie"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="board">
          {renderColumn("todo")}
          {renderColumn("doing")}
          {renderColumn("done")}
        </section>
      </main>
    </div>
  );
}

export default App;