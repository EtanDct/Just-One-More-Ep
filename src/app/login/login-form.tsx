"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-muted-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-full"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs text-muted-foreground">
          Mot de passe
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-full"
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" size="lg" className="mt-1 w-full rounded-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-primary">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
