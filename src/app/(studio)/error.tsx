"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-dim">
        {error.message.includes("cannot reach") || error.message.includes("no answer")
          ? "GoHead isn't answering. Is it running, and is GOHEAD_URL right?"
          : error.message.includes("404")
            ? "GoHead doesn't know this content type: run npm run gohead:push."
            : "The error was logged on the server."}
      </p>
      <button onClick={reset} className="mt-6 rounded-md border border-line-strong px-3 py-1.5 text-sm hover:bg-raised">
        Try again
      </button>
    </div>
  );
}
