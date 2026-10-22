import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-xl font-semibold">Not here</h1>
      <p className="mt-2 text-sm text-dim">It may have been deleted, or the link is wrong.</p>
      <div className="mt-6">
        <ButtonLink href="/">Back to the overview</ButtonLink>
      </div>
    </div>
  );
}
