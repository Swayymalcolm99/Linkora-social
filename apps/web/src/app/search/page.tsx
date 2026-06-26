import { Suspense, type ReactNode } from "react";
import { SearchPageClient } from "./SearchPageClient";

type BoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

const SuspenseBoundary = Suspense as unknown as (props: BoundaryProps) => ReactNode;

export default function SearchPage() {
  return (
    <SuspenseBoundary
      fallback={<div className="mx-auto max-w-5xl px-4 py-10">Loading search...</div>}
    >
      <SearchPageClient />
    </SuspenseBoundary>
  );
}
