"use client";

import type { ReactNode } from "react";
import { ErrorState, ErrorSummary, LoadingState, PageTitle, SaveBar } from "@/components/ui/layout";
import type { useDocument } from "@/lib/hooks";

/** Title, loading and error states, problem list and save bar around a document editor. */
export function DocumentPage<T>({
  doc,
  title,
  description,
  actions,
  children,
}: {
  doc: ReturnType<typeof useDocument<T>>;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: (draft: T, change: (fn: (d: T) => T) => void) => ReactNode;
}) {
  return (
    <>
      <PageTitle title={title} description={description} actions={actions} />
      {doc.state.status === "error" ? (
        <ErrorState message={doc.state.message} onRetry={doc.reload} />
      ) : doc.draft === null ? (
        <LoadingState />
      ) : (
        <>
          <ErrorSummary errors={doc.errors} />
          {children(doc.draft, doc.change)}
          <SaveBar dirty={doc.dirty} saving={doc.saving} onSave={doc.save} onDiscard={doc.discard} />
        </>
      )}
    </>
  );
}
