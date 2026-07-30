"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="section-pad">
      <div className="tembea-container dashboard-card stack-md p-8 text-center">
        <h1 className="text-4xl font-black">Something went wrong</h1>
        <p className="text-muted">Refresh the Tembea experience and try again.</p>
        <Button className="mx-auto" variant="dark" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
