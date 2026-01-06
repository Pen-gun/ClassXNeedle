import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthMutations } from '../hooks/useAuth';

// Icons
const Icons = {
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  EyeOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ),
  Person: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
};

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { redirectTo?: string })?.redirectTo || '/';

  const { loginMutation, registerMutation } = useAuthMutations();
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'login') {
      loginMutation.mutate(
        { username: form.username || undefined, email: form.email || undefined, password: form.password },
        {
          onSuccess: () => navigate(redirectTo, { replace: true }),
          onError: (err: Error & { response?: { data?: { message?: string } } }) => setError(err?.response?.data?.message || 'Login failed. Please try again.')
        }
      );
    } else {
      registerMutation.mutate(
        {
          username: form.username,
          fullName: form.fullName || form.username,
          email: form.email || undefined,
          password: form.password
        },
        {
          onSuccess: () => navigate(redirectTo, { replace: true }),
          onError: (err: Error & { response?: { data?: { message?: string } } }) => setError(err?.response?.data?.message || 'Registration failed. Please try again.')
        }
      );
    }
  };

  const benefits = [
    'Track your orders in real-time',
    'Save items to your wishlist',
    'Exclusive member discounts',
    'Early access to new arrivals',
  ];

  return (
    <div className="min-h-screen bg-accent-cream dark:bg-[#0f0f0f] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo / Brand */}
          <Link to="/" className="inline-block mb-8">
            <h1 className="text-2xl font-bold font-display text-accent-charcoal dark:text-accent-cream">
              ClassX<span className="text-accent-gold">Needle</span>
            </h1>
          </Link>

          {/* Mode Toggle */}
          <div className="flex rounded-xl bg-stone-100 dark:bg-white/5 p-1 mb-8">
            <button
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === 'login' 
                  ? 'bg-white dark:bg-accent-charcoal text-accent-charcoal dark:text-accent-cream shadow-sm' 
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === 'register' 
                  ? 'bg-white dark:bg-accent-charcoal text-accent-charcoal dark:text-accent-cream shadow-sm' 
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-display font-semibold text-accent-charcoal dark:text-accent-cream">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2">
              {mode === 'login' 
                ? 'Sign in to access your account and continue shopping.' 
                : 'Join us for exclusive benefits and a personalized experience.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-red-700 dark:text-red-300">
              <Icons.AlertCircle />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-accent-charcoal dark:text-accent-cream mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input w-full pl-11"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                    <Icons.Person />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-accent-charcoal dark:text-accent-cream mb-2 block">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="input w-full pl-11"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Icons.User />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-accent-charcoal dark:text-accent-cream mb-2 block">
                Email {mode === 'login' && <span className="text-stone-400 font-normal">(optional)</span>}
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="input w-full pl-11"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Icons.Mail />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-accent-charcoal dark:text-accent-cream mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full pl-11 pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Icons.Lock />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
              {mode === 'login' && (
                <div className="mt-2 text-right">
                  <button type="button" className="text-sm text-accent-gold hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 border-t border-stone-200 dark:border-stone-700" />
            <span className="text-sm text-stone-400">or continue with</span>
            <div className="flex-1 border-t border-stone-200 dark:border-stone-700" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-ghost flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="btn-ghost flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-stone-500 dark:text-stone-400 mt-8">
            By continuing, you agree to our{' '}
            <Link to="#" className="text-accent-gold hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="#" className="text-accent-gold hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Benefits (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent-charcoal dark:bg-stone-950 text-white p-12 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative z-10 max-w-md">
          {/* Decorative element */}
          <div className="w-16 h-1 bg-accent-gold mb-8" />
          
          <h2 className="text-3xl lg:text-4xl font-display font-semibold mb-6">
            Experience the Art of
            <span className="block text-accent-gold">Premium Fashion</span>
          </h2>
          
          <p className="text-stone-300 mb-10 leading-relaxed">
            Join thousands of fashion enthusiasts who trust ClassXNeedle for their wardrobe essentials. 
            Quality craftsmanship meets contemporary design.
          </p>

          {/* Benefits List */}
          <ul className="space-y-4">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
                  <Icons.Check />
                </span>
                <span className="text-stone-200">{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-stone-300 italic mb-4">
              "The quality exceeded my expectations. ClassXNeedle has become my go-to for all fashion needs."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-semibold">
                JD
              </div>
              <div>
                <p className="font-medium text-sm">Jane Doe</p>
                <p className="text-xs text-stone-400">Verified Customer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
