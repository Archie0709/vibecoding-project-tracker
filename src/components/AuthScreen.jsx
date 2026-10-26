import { useEffect, useId, useRef, useState } from 'react';
import { CircleAlert, Eye, EyeOff, Sparkles } from 'lucide-react';
import * as api from '../api';
import { useAuth } from '../hooks/useAuth';
import { btnPrimary, btnSecondary, focusRing, inputClass, labelClass } from '../lib/ui';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GITHUB_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

/**
 * 12c: Log in / Create account (FR-22, FR-23).
 * Accessibility: visible labels, autocomplete hints so password managers work
 * (WCAG 1.3.5), errors next to each field and linked with aria-describedby (WCAG 3.3.1),
 * a show/hide password toggle instead of a "confirm password" field, and focus moves to
 * the first problem on a failed submit.
 */
export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const headingRef = useRef(null);
  const isLogin = mode === 'login';

  useEffect(() => {
    document.title = `${isLogin ? 'Log in' : 'Create account'} · Vibecoding Project Tracker`;
  }, [isLogin]);

  function switchMode(next) {
    setMode(next);
    // Move focus to the new heading so screen-reader users know the form changed.
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold text-text-primary">
          <span aria-hidden="true" className="text-brand-primary">▍</span>
          Vibecoding Project Tracker
        </p>

        <DemoPanel />

        <div className="rounded-lg bg-surface-card p-6 ring-1 ring-border-subtle">
          <h1 ref={headingRef} tabIndex={-1} className="text-xl font-semibold focus:outline-none">
            {isLogin ? 'Log in' : 'Create an account'}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {isLogin
              ? 'Welcome back. Pick up where you left off.'
              : 'Everyone on your team gets their own account.'}
          </p>

          {isLogin ? <LoginForm key="login" /> : <RegisterForm key="register" />}
        </div>

        <p className="mt-4 text-center text-sm text-text-muted">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <button
            type="button"
            onClick={() => switchMode(isLogin ? 'register' : 'login')}
            className={`rounded font-medium text-brand-accent underline underline-offset-2 ${focusRing}`}
          >
            {isLogin ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </div>
    </main>
  );
}

/**
 * Showcase (FR-28): one click into a sample board, so visitors and markers don't have to
 * register. Only shown when the server has the demo switched on.
 */
function DemoPanel() {
  const { loginAsDemo } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.getDemoInfo().then((info) => !cancelled && setEnabled(Boolean(info?.enabled)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!enabled) return null;

  async function handleClick() {
    setBusy(true);
    setError('');
    try {
      await loginAsDemo();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="demo-heading"
      className="mb-4 rounded-lg border border-brand-primary/50 bg-brand-primary/5 p-4"
    >
      <h2 id="demo-heading" className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles aria-hidden="true" className="h-4 w-4 text-brand-primary" />
        Just looking?
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Explore a sample team board with example tasks. No account needed. The demo resets regularly.
      </p>
      <button type="button" onClick={handleClick} disabled={busy} className={`${btnSecondary} mt-3 w-full`}>
        {busy ? 'Opening the demo…' : 'Try the demo'}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-due-overdue">{error}</p>}
    </section>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const form = useAuthForm({ email: '', password: '' }, (v) => {
    const errors = {};
    if (!v.email.trim()) errors.email = 'Enter your email address.';
    if (!v.password) errors.password = 'Enter your password.';
    return errors;
  });

  return (
    <form noValidate onSubmit={form.submit(login)} className="mt-5 space-y-4">
      <FormAlert message={form.formError} />
      <Field form={form} name="email" label="Email" type="email" autoComplete="email" autoFocus />
      <PasswordField form={form} name="password" label="Password" autoComplete="current-password" />
      <button type="submit" className={`${btnPrimary} w-full`} disabled={form.submitting}>
        {form.submitting ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const form = useAuthForm({ name: '', email: '', githubHandle: '', password: '' }, (v) => {
    const errors = {};
    if (!v.name.trim()) errors.name = 'Enter your name.';
    if (!v.email.trim()) errors.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(v.email.trim())) errors.email = 'Enter a valid email address, like name@example.com.';
    if (v.githubHandle.trim() && !GITHUB_PATTERN.test(v.githubHandle.trim())) {
      errors.githubHandle = 'GitHub usernames use letters, numbers and single hyphens (max 39).';
    }
    if (v.password.length < 8) errors.password = 'Use at least 8 characters.';
    else if (v.password.length > 64) errors.password = 'Use 64 characters or fewer.';
    return errors;
  });

  return (
    <form noValidate onSubmit={form.submit(register)} className="mt-5 space-y-4">
      <FormAlert message={form.formError} />
      <Field form={form} name="name" label="Name" autoComplete="name" autoFocus />
      <Field form={form} name="email" label="Email" type="email" autoComplete="email" />
      <Field
        form={form}
        name="githubHandle"
        label="GitHub username"
        optional
        autoComplete="username"
        hint="Helps your team match tasks to commits."
      />
      <PasswordField
        form={form}
        name="password"
        label="Password"
        autoComplete="new-password"
        hint="At least 8 characters. A short phrase is easier to remember and harder to guess."
      />
      <button type="submit" className={`${btnPrimary} w-full`} disabled={form.submitting}>
        {form.submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}

/** Shared form state: values, client-side checks, server errors, and focus on the first problem. */
function useAuthForm(initial, validate) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const formId = useId();

  const fieldId = (name) => `${formId}-${name}`;

  function focusFirst(fieldErrors) {
    const first = Object.keys(initial).find((name) => fieldErrors[name]);
    if (first) document.getElementById(fieldId(first))?.focus();
  }

  const submit = (action) => async (e) => {
    e.preventDefault();
    setFormError('');
    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      focusFirst(clientErrors);
      return;
    }
    setSubmitting(true);
    try {
      await action({ ...values, email: values.email.trim(), name: values.name?.trim() });
      // On success the AuthProvider switches to the board, unmounting this form.
    } catch (err) {
      const serverErrors = err.fieldErrors ?? {};
      setErrors(serverErrors);
      setFormError(Object.keys(serverErrors).length ? '' : err.message);
      setSubmitting(false);
      focusFirst(serverErrors);
    }
  };

  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  return { values, errors, formError, submitting, submit, set, fieldId };
}

function FormAlert({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-md border border-due-overdue/50 px-3 py-2 text-sm text-due-overdue">
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

function Field({ form, name, label, type = 'text', hint, optional = false, autoComplete, autoFocus }) {
  const id = form.fieldId(name);
  const error = form.errors[name];
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label} {optional && <span className="font-normal text-text-muted">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={form.values[name]}
        onChange={form.set(name)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={inputClass}
      />
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-due-overdue">{error}</p>}
    </div>
  );
}

function PasswordField({ form, name, label, hint, autoComplete }) {
  const [visible, setVisible] = useState(false);
  const id = form.fieldId(name);
  const error = form.errors[name];
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const Icon = visible ? EyeOff : Eye;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={form.values[name]}
          onChange={form.set(name)}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={`${inputClass} pr-24`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-controls={id}
          className={`absolute inset-y-1 right-1 inline-flex items-center gap-1 rounded px-2 text-xs text-text-muted hover:text-text-primary ${focusRing}`}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
          {visible ? 'Hide' : 'Show'}
          <span className="sr-only"> password</span>
        </button>
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-due-overdue">{error}</p>}
    </div>
  );
}
