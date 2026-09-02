"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "./actions";
import type { AuthFormState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs text-muted-foreground">
          Nom
        </label>
        <Input id="name" name="name" type="text" autoComplete="name" className="rounded-full" />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded-full"
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" size="lg" className="mt-1 w-full rounded-full" disabled={pending}>
        {pending ? "Création…" : "Créer un compte"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
