import { useAuth } from './AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import TasksPage from './pages/TasksPage.jsx';

export default function App() {
  const { user, ready, logout } = useAuth();

  if (!ready) return <p className="center muted">Loading…</p>;

  return (
    <div className="app">
      <header className="topbar">
        <h1>Task Manager</h1>
        {user && (
          <div className="who">
            <span>
              {user.name} <span className={`role ${user.role}`}>{user.role}</span>
            </span>
            <button type="button" className="ghost" onClick={logout}>Log out</button>
          </div>
        )}
      </header>
      {user ? <TasksPage /> : <AuthPage />}
    </div>
  );
}
