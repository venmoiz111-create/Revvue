"use client";

import { useEffect, useMemo, useState } from "react";

// Two-step signup form for agencies.
//
// Step 1 (account): email, password, agency name, subdomain slug.
//   - Subdomain is auto-suggested from the agency name.
//   - Availability is checked on blur via /api/agencies/check-slug
//     (no — we just send the create POST and let the server be source of truth).
//     Actually: we do a lightweight HEAD-style check by hitting the create
//     endpoint with a `dryRun` flag. Simpler: do the check server-side at
//     submit time and surface the error.
//
// Step 2 (branding): logo URL (paste only, upload coming later), primary
// color, font (serif/sans).

const SUBDOMAIN_RE = /^[a-z0-9-]{3,32}$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

type Step = 1 | 2;

type FormState = {
  email: string;
  password: string;
  name: string;
  slug: string;
  slugTouched: boolean;
  logo_url: string;
  primary_color: string;
  font_family: "serif" | "sans-serif";
};

export default function SignupForm() {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    name: "",
    slug: "",
    slugTouched: false,
    logo_url: "",
    primary_color: "#1c1917",
    font_family: "serif",
  });

  // Auto-fill slug from name until the user has manually edited it.
  useEffect(() => {
    if (form.slugTouched) return;
    const next = slugify(form.name);
    setForm((f) => (f.slug === next ? f : { ...f, slug: next }));
  }, [form.name, form.slugTouched]);

  const slugValid = useMemo(() => SUBDOMAIN_RE.test(form.slug), [form.slug]);
  const step1Valid =
    form.email.includes("@") &&
    form.password.length >= 8 &&
    form.name.trim().length > 1 &&
    slugValid;

  async function handleSubmit() {
    setServerError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/agencies/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          slug: form.slug.trim(),
          logo_url: form.logo_url.trim() || null,
          primary_color: form.primary_color,
          font_family: form.font_family,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        redirectUrl?: string;
      };

      if (!res.ok || !data.success || !data.redirectUrl) {
        setServerError(data.error || "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      // Hard navigate to the agency's subdomain dashboard.
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error("signup failed:", err);
      setServerError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8">
      <Stepper step={step} />

      {step === 1 ? (
        <Step1
          form={form}
          setForm={setForm}
          slugValid={slugValid}
          onContinue={() => setStep(2)}
          step1Valid={step1Valid}
        />
      ) : (
        <Step2
          form={form}
          setForm={setForm}
          submitting={submitting}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          serverError={serverError}
        />
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-stone-500 mb-8">
      <span
        className={
          step === 1
            ? "text-stone-900 font-medium"
            : "text-stone-400"
        }
      >
        1. Account
      </span>
      <span aria-hidden className="text-stone-300">
        —
      </span>
      <span
        className={
          step === 2
            ? "text-stone-900 font-medium"
            : "text-stone-400"
        }
      >
        2. Branding
      </span>
    </div>
  );
}

function Step1({
  form,
  setForm,
  slugValid,
  onContinue,
  step1Valid,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  slugValid: boolean;
  onContinue: () => void;
  step1Valid: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (step1Valid) onContinue();
      }}
      className="space-y-5"
    >
      <h1 className="font-serif text-2xl tracking-tight">
        Create your account
      </h1>
      <p className="text-sm text-stone-500 -mt-2">
        Restaurant owner or marketing agency — same signup, same 14-day free trial.
      </p>
      <Field label="Email">
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputClass}
          autoComplete="email"
        />
      </Field>
      <Field
        label="Password"
        hint="At least 8 characters."
      >
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) =>
            setForm((f) => ({ ...f, password: e.target.value }))
          }
          className={inputClass}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Restaurant or agency name">
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
          placeholder="Mario's Pizzeria  or  Northwind Reviews"
        />
      </Field>
      <Field
        label="Your review portal URL"
        hint={
          slugValid
            ? `Your review pages will live at ${form.slug}.revvue.live`
            : "3–32 lowercase letters, numbers, or hyphens."
        }
      >
        <div className="flex items-stretch rounded-xl border border-stone-300 focus-within:border-stone-900 transition-colors overflow-hidden">
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                slug: slugify(e.target.value),
                slugTouched: true,
              }))
            }
            className="flex-1 px-3 py-3 outline-none bg-transparent text-stone-900"
            placeholder="northwind"
          />
          <span className="bg-stone-50 border-l border-stone-200 px-3 py-3 text-stone-500 text-sm flex items-center">
            .revvue.live
          </span>
        </div>
      </Field>
      <button
        type="submit"
        disabled={!step1Valid}
        className="w-full rounded-full bg-stone-900 text-stone-50 font-medium py-3 disabled:bg-stone-400 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
      >
        Continue
      </button>
    </form>
  );
}

function Step2({
  form,
  setForm,
  submitting,
  onBack,
  onSubmit,
  serverError,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  serverError: string;
}) {
  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl tracking-tight">Brand it</h1>
      <p className="text-stone-600 text-sm leading-relaxed">
        You can change all of this later from the dashboard.
      </p>
      <Field
        label="Logo URL"
        hint="Logo upload is coming soon — paste a URL for now (we recommend Imgur or Cloudinary)."
      >
        <input
          type="url"
          value={form.logo_url}
          onChange={(e) =>
            setForm((f) => ({ ...f, logo_url: e.target.value }))
          }
          className={inputClass}
          placeholder="https://i.imgur.com/yourlogo.png"
        />
      </Field>
      <Field label="Primary color">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.primary_color}
            onChange={(e) =>
              setForm((f) => ({ ...f, primary_color: e.target.value }))
            }
            className="h-12 w-16 rounded-md border border-stone-300 cursor-pointer bg-white"
            aria-label="Primary brand color"
          />
          <input
            type="text"
            value={form.primary_color}
            onChange={(e) =>
              setForm((f) => ({ ...f, primary_color: e.target.value }))
            }
            className={inputClass}
            pattern="^#[0-9a-fA-F]{6}$"
          />
        </div>
      </Field>
      <Field label="Font">
        <div className="flex gap-3">
          {(["serif", "sans-serif"] as const).map((opt) => {
            const active = form.font_family === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, font_family: opt }))
                }
                className={[
                  "flex-1 rounded-xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-stone-900 bg-stone-900 text-stone-50"
                    : "border-stone-300 bg-white hover:border-stone-500",
                ].join(" ")}
                style={{ fontFamily: opt }}
              >
                <div className="text-xs uppercase tracking-widest opacity-70">
                  {opt === "serif" ? "Serif" : "Sans"}
                </div>
                <div className="text-base">Your business name</div>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Live mini preview */}
      <Preview form={form} />

      {serverError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-3">
          {serverError}
        </div>
      ) : null}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="rounded-full px-5 py-3 text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 rounded-full bg-stone-900 text-stone-50 font-medium py-3 disabled:bg-stone-400 hover:bg-stone-800 transition-colors"
        >
          {submitting ? "Creating your portal…" : "Create my portal"}
        </button>
      </div>
      <p className="text-xs text-stone-500">
        By creating an account you agree to use Revvue responsibly. Trial is
        14 days, no credit card required.
      </p>
    </div>
  );
}

function Preview({ form }: { form: FormState }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <div className="text-xs uppercase tracking-widest text-stone-400 mb-3">
        Preview
      </div>
      <div className="rounded-xl bg-white border border-stone-200 p-6 text-center">
        {form.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.logo_url}
            alt={form.name || "Agency"}
            className="h-8 w-auto mx-auto object-contain"
          />
        ) : (
          <p className="text-sm tracking-widest uppercase text-stone-500">
            {form.name || "Your Agency"}
          </p>
        )}
        <h3
          className="mt-2 text-2xl text-stone-900 tracking-tight"
          style={{ fontFamily: form.font_family }}
        >
          Mario&apos;s Pizza
        </h3>
        <button
          type="button"
          tabIndex={-1}
          className="mt-4 rounded-full text-stone-50 px-4 py-2 text-sm cursor-default"
          style={{ backgroundColor: form.primary_color }}
        >
          Hold to speak
        </button>
        <p className="mt-4 text-[11px] tracking-widest uppercase text-stone-400">
          Powered by {form.name || "Your Agency"}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-stone-800">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-stone-500">{hint}</div> : null}
    </label>
  );
}

const inputClass =
  "mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 outline-none focus:border-stone-900 transition-colors bg-white text-stone-900";
