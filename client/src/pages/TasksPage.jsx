import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];
const PRIORITIES = ['low', 'medium', 'high'];
const EMPTY = { title: '', description: '', priority: 'medium', dueDate: '' };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({ status: '', q: '' });
  const [draft, setDraft] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams(Object.entries(filter).filter(([, v]) => v));
    try {
      setTasks(await api(`/tasks?${params}`));
    } catch (err) {
      setError(err.message);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e) {
    e.preventDefault();
    try {
      const body = { ...draft, dueDate: draft.dueDate || undefined };
      const task = await api('/tasks', { method: 'POST', body });
      setTasks((prev) => [task, ...prev]);
      setDraft(EMPTY);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function update(id, changes) {
    try {
      const task = await api(`/tasks/${id}`, { method: 'PATCH', body: changes });
      setTasks((prev) => prev.map((t) => (t._id === id ? task : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    try {
      await api(`/tasks/${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const counts = Object.fromEntries(STATUSES.map((s) => [s.value, tasks.filter((t) => t.status === s.value).length]));

  return (
    <main className="layout">
      <form className="card new-task" onSubmit={create}>
        <h2>New task</h2>
        <label htmlFor="title">Title</label>
        <input id="title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
        <label htmlFor="desc">Description</label>
        <textarea id="desc" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <div className="two">
          <div>
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="due">Due date</label>
            <input id="due" type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
          </div>
        </div>
        <button type="submit">Add task</button>
      </form>

      <section className="list">
        <div className="toolbar">
          <label htmlFor="search" className="sr-only">Search tasks</label>
          <input id="search" placeholder="Search tasks" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} />
          <label htmlFor="status-filter" className="sr-only">Filter by status</label>
          <select id="status-filter" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <p className="muted small">
          {STATUSES.map((s) => `${s.label}: ${counts[s.value]}`).join(' · ')}
          {user.role === 'admin' && ' · Admin view: showing tasks from all users'}
        </p>
        {error && <p className="error" role="alert">{error}</p>}

        {tasks.length === 0 ? (
          <p className="card muted">No tasks yet. Add your first one.</p>
        ) : (
          <ul className="tasks">
            {tasks.map((t) => (
              <li key={t._id} className={`card task ${t.status}`}>
                <div className="task-head">
                  <h3>{t.title}</h3>
                  <span className={`badge ${t.priority}`}>{t.priority}</span>
                </div>
                {t.description && <p>{t.description}</p>}
                <div className="task-foot">
                  <label className="sr-only" htmlFor={`status-${t._id}`}>Status</label>
                  <select id={`status-${t._id}`} value={t.status} onChange={(e) => update(t._id, { status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <span className="muted small">
                    {t.dueDate && `Due ${new Date(t.dueDate).toLocaleDateString()}`}
                    {user.role === 'admin' && t.owner?.name && ` · ${t.owner.name}`}
                  </span>
                  <button type="button" className="ghost danger" onClick={() => remove(t._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
