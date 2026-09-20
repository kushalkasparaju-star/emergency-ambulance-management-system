import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@ems.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 bg-card text-card-foreground rounded-xl shadow-lg border border-border">
        <div className="flex justify-center mb-6 text-primary">
          <Activity size={48} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">EMS Dispatch Login</h1>
        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded-md">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-transparent" />
          </div>
          <button type="submit" className="w-full p-2 mt-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
