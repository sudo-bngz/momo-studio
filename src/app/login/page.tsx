import type { Metadata } from "next";

import { login } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Logo } from "@/components/logo";
import { Field, Input } from "@/components/ui";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  const { next, expired } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <Logo />
          <div>
            <div className="text-lg font-semibold">Studio</div>
            <div className="text-xs text-dim">Gear · cables · bookings</div>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-panel p-6">
          {expired ? <p className="mb-4 text-sm text-warn">Your session has expired: sign in again.</p> : null}
          <ActionForm action={login} submit="Sign in">
            <input type="hidden" name="next" value={next ?? ""} />
            <div className="space-y-4">
              <Field label="GoHead username">
                <Input name="username" autoComplete="username" required autoFocus />
              </Field>
              <Field label="Password">
                <Input name="password" type="password" autoComplete="current-password" required />
              </Field>
            </div>
          </ActionForm>
        </div>
        <p className="mt-4 text-xs text-faint">Use your GoHead account. Admins manage accounts in the GoHead admin.</p>
      </div>
    </main>
  );
}
