import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Server,
  Shield
} from 'lucide-react';
import { useAuthMutations, useMe } from '../hooks/useAuth';

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: me } = useMe();
  const { loginMutation, logoutMutation } = useAuthMutations();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { redirectTo?: string })?.redirectTo || '/admin/dashboard';
  const isLoading = loginMutation.isPending;

  const statusCards = useMemo(
    () => [
      { title: 'Threat Monitor', value: 'Stable', note: '0 critical alerts', icon: Shield },
      { title: 'Audit Stream', value: 'Live', note: 'Last sync 12s ago', icon: Server },
      { title: 'Auth Layer', value: 'Armed', note: 'Biometric ready', icon: Fingerprint }
    ],
    []
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setError('Enter your admin email, username, or phone.');
      return;
    }

    const isEmail = trimmed.includes('@');
    const isPhone = /^\+?\d{6,}$/.test(trimmed);
    const payload = isEmail
      ? { email: trimmed, password }
      : isPhone
        ? { phone: trimmed, password }
        : { username: trimmed, password };

    loginMutation.mutate(payload, {
      onSuccess: (data: { user?: { role?: string } }) => {
        if (data?.user?.role !== 'admin') {
          setError('Admin access required. Please use an admin account.');
          logoutMutation.mutate();
          return;
        }
        setSuccess(true);
        navigate(redirectTo, { replace: true });
      },
      onError: (err: Error & { response?: { data?: { message?: string } } }) => {
        setError(err?.response?.data?.message || 'Login failed. Please try again.');
      }
    });
  };

  const alreadyAdmin = me?.role === 'admin';
  const signedInAsUser = me && me.role !== 'admin';

  useEffect(() => {
    if (alreadyAdmin) {
      navigate(redirectTo, { replace: true });
    }
  }, [alreadyAdmin, navigate, redirectTo]);

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,169,98,0.12),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(120,113,108,0.18),transparent_35%),radial-gradient(circle_at_60%_80%,rgba(26,26,26,0.6),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(12,12,16,0.96)_0%,rgba(15,17,22,0.94)_40%,rgba(22,24,32,0.92)_100%)]" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[minmax(0,520px),minmax(0,1fr)] gap-10 px-6 py-10 lg:px-16">
        <div className="flex flex-col justify-center">
          <Link to="/" className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-stone-400">
            <span className="w-10 h-px bg-accent-gold" />
            ClassXNeedle Admin
          </Link>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent-gold/20 text-accent-gold flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-display">Admin Command Center</h1>
                <p className="text-sm text-stone-400">
                  Secure access for operations, analytics, and fulfillment control.
                </p>
              </div>
            </div>

            {(alreadyAdmin || success) && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-200">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Admin session active.</p>
                  <p className="text-emerald-200/80">You are authenticated for elevated access.</p>
                </div>
              </div>
            )}

            {signedInAsUser && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-amber-100">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Signed in as a customer.</p>
                  <p className="text-amber-100/80">Switch to an admin account to continue.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!alreadyAdmin && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-stone-400">Admin ID</label>
                  <div className="relative mt-2">
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                      placeholder="username, email, or phone"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-stone-400">Passkey</label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                      placeholder="Enter secure passcode"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-stone-400">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-accent-gold focus:ring-accent-gold/40"
                    />
                    Remember this device
                  </label>
                  <button type="button" className="text-accent-gold hover:text-amber-300">
                    Request reset
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-accent-gold px-6 py-3 text-sm font-semibold text-black shadow-[0_20px_40px_rgba(201,169,98,0.25)] transition hover:-translate-y-0.5 hover:bg-amber-400 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoading ? 'Verifying access...' : 'Enter admin vault'}
                </button>
              </form>
            )}

            <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm text-stone-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Dual-factor enabled
                </span>
                <span className="text-stone-500">Policy v3.7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" />
                  Biometric ready
                </span>
                <span className="text-stone-500">ID verified</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
              <Link to="/" className="inline-flex items-center gap-2 text-stone-300 hover:text-white">
                Back to storefront
                <ArrowRight className="w-4 h-4" />
              </Link>
              {signedInAsUser && (
                <button
                  type="button"
                  onClick={() => logoutMutation.mutate()}
                  className="text-amber-200 hover:text-amber-100"
                >
                  Sign out and switch
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col justify-center gap-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-stone-500">Control Surface</p>
            <h2 className="text-4xl font-display">
              Precision ops for <span className="text-accent-gold">ClassXNeedle</span> leadership.
            </h2>
            <p className="text-stone-400 max-w-lg">
              Validate inventory, approve campaigns, and monitor the supply pulse with protected admin tools.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {statusCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <card.icon className="w-5 h-5 text-accent-gold" />
                <p className="mt-4 text-sm text-stone-400">{card.title}</p>
                <p className="text-lg font-semibold text-white">{card.value}</p>
                <p className="text-xs text-stone-500">{card.note}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
            <p className="text-sm text-stone-400">Live activity</p>
            <div className="mt-4 space-y-3 text-sm">
              {[
                'Order reconciliation completed',
                'Pricing update queued',
                'Inventory delta synced',
                'Fraud monitor heartbeat ok'
              ].map((item) => (
                <div key={item} className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-stone-300">{item}</span>
                  <span className="text-xs text-accent-gold">just now</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
