import type { FormEvent } from 'react';
import { useState } from 'react';
import { useAuthMutations } from '../hooks/useAuth';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: ''
  });

  const { loginMutation, registerMutation } = useAuthMutations();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      loginMutation.mutate({ username: form.username || undefined, email: form.email || undefined, password: form.password });
    } else {
      registerMutation.mutate({
        username: form.username,
        fullName: form.fullName || form.username,
        email: form.email || undefined,
        password: form.password
      });
    }
  };

  return (
    <section className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          className={`px-4 py-2 rounded-full ${mode === 'login' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'glass'}`}
          onClick={() => setMode('login')}
          type="button"
        >
          Login
        </button>
        <button
          className={`px-4 py-2 rounded-full ${mode === 'register' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'glass'}`}
          onClick={() => setMode('register')}
          type="button"
        >
          Register
        </button>
      </div>

      <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4">
        {mode === 'register' && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Full name</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium">Username</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white hover:bg-brand-700"
        >
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
    </section>
  );
};

export default Auth;
