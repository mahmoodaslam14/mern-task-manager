import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';

export default function AuthPage() {
  const { authenticate } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await authenticate(mode, form);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isRegister = mode === 'register';

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{isRegister ? 'Create an account' : 'Welcome back'}</h2>
      {isRegister && (
        <>
          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={set('name')} required />
        </>
      )}
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={form.email} onChange={set('email')} required />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" value={form.password} onChange={set('password')} minLength={8} required />
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Sign up' : 'Log in'}</button>
      <p className="muted small">
        {isRegister ? 'Already have an account?' : 'New here?'}{' '}
        <button type="button" className="link" onClick={() => setMode(isRegister ? 'login' : 'register')}>
          {isRegister ? 'Log in' : 'Create an account'}
        </button>
      </p>
    </form>
  );
}
