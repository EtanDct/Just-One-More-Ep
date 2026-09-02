import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-elev-lg">
        <div className="mb-8 flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="font-heading text-lg">
            just one more ep<span className="text-primary">.</span>
          </span>
        </div>

        <h1 className="mb-1 text-2xl">Créer un compte</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Suivez vos séries, épisode par épisode.
        </p>

        <SignupForm />
      </div>
    </div>
  );
}
