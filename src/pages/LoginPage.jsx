import { useState } from 'react';
import {
  BookMarked,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, ownerEmail, ownerName } = useAuth();

  const [formData, setFormData] = useState({
    email: ownerEmail || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const validateForm = () => {
    const errors = {};
    const email = formData.email.trim();

    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      setServerError(error.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setSubmitting(true);
    setServerError('');

    try {
      await loginAsDemo();
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      setServerError(
        error.message || 'Unable to connect to demo session. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#141f3d] px-3 sm:px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r from-cyan-700 to-teal-600 flex items-center justify-center shadow-md mb-3 sm:mb-4">
            <BookMarked className="text-white" size={26} />
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Rana Zahid Hussain
          </h1>
          <p className="text-xs text-gray-400">Personal Diary & Business Manager</p>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-medium">
            <ShieldCheck size={13} className="text-cyan-600" />
            Single-User Owner Portal
          </div>
        </div>

        <div className="mb-5 text-center">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">Owner Sign In</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Sign in with your credentials to access your private diary.
          </p>
        </div>

        {serverError && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs font-medium text-rose-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Owner Email Address
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
                placeholder={ownerEmail || 'ranazahid@example.com'}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm outline-none transition focus:border-cyan-600 ${
                  fieldErrors.email ? 'border-rose-300' : 'border-gray-200'
                }`}
              />
            </div>

            {fieldErrors.email && (
              <p className="mt-1 text-[11px] font-medium text-rose-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Password
            </label>

            <div className="relative">
              <KeyRound
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Enter your password"
                className={`w-full pl-9 pr-9 py-2.5 border rounded-lg text-sm outline-none transition focus:border-cyan-600 ${
                  fieldErrors.password ? 'border-rose-300' : 'border-gray-200'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={submitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {fieldErrors.password && (
              <p className="mt-1 text-[11px] font-medium text-rose-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-700 to-teal-600 text-sm font-semibold text-white shadow-md hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
          >
            <ShieldCheck size={16} />
            {submitting ? 'Signing in...' : 'Sign In as Owner'}
          </button>
        </form>

        {/* Portfolio Recruiter / Reviewer Instant Demo Access */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold mb-2">
            <Briefcase size={13} className="text-amber-600" />
            Portfolio Reviewer / Recruiter Access
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Testing this project for hiring? Explore all features with 1 click:
          </p>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-cyan-600 bg-cyan-50/70 text-cyan-900 text-sm font-bold hover:bg-cyan-100 transition shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <Sparkles size={16} className="text-cyan-700" />
            {submitting ? 'Connecting...' : '🚀 1-Click Recruiter Demo Access'}
          </button>

          <p className="mt-2 text-[10px] text-gray-400">
            No password needed • Full interactive access for evaluation
          </p>
        </div>

        <p className="mt-5 text-center text-[10px] text-gray-400">
          Private single-user system. Reserved for Rana Zahid and verified reviewers.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
