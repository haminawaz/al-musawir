"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { api, ApiError } from "./api";
import { useUnsavedChanges } from "./unsaved";

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready" };

const messageOf = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong.");

/** Loads one API path for display. */
export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    if (!path) return;
    setState({ status: "loading" });
    try {
      setData(await api.get<T>(path));
      setState({ status: "ready" });
    } catch (e) {
      setState({ status: "error", message: messageOf(e) });
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, state, reload: load, setData };
}

/**
 * Loads a document, keeps an editable draft, and saves it back with PUT.
 * `validate` runs before the request; the server validates again and its problems are shown the same way.
 */
export function useDocument<T>(path: string, options: { label: string; validate?: (draft: T) => string[] }) {
  const toast = useToast();
  const { data: saved, state, reload, setData: setSaved } = useResource<T>(path);
  const [draft, setDraft] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // A fresh load replaces the draft.
  useEffect(() => {
    setDraft(saved);
    setErrors([]);
  }, [saved]);

  const dirty = useMemo(
    () => saved !== null && draft !== null && JSON.stringify(saved) !== JSON.stringify(draft),
    [saved, draft],
  );
  useUnsavedChanges(dirty);

  const { label, validate } = options;
  const save = useCallback(async () => {
    if (draft === null) return false;
    const problems = validate?.(draft) ?? [];
    setErrors(problems);
    if (problems.length) {
      toast.error("Some fields need fixing. See the list at the top.");
      return false;
    }
    setSaving(true);
    try {
      setSaved(await api.put<T>(path, draft));
      toast.success(`${label} saved.`);
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.details.length) setErrors(e.details);
      toast.error(messageOf(e));
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft, validate, path, label, toast, setSaved]);

  const discard = useCallback(() => {
    setDraft(saved);
    setErrors([]);
  }, [saved]);

  /** Update the draft with a function, like setState. */
  const change = useCallback((fn: (d: T) => T) => setDraft((d) => (d === null ? d : fn(d))), []);

  return { saved, draft, change, setDraft, state, reload, dirty, saving, errors, save, discard };
}

/** Immutable helpers for list editors. */
export const listOps = {
  move<T>(list: T[], from: number, to: number) {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  },
  replace<T>(list: T[], index: number, item: T) {
    return list.map((x, i) => (i === index ? item : x));
  },
  remove<T>(list: T[], index: number) {
    return list.filter((_, i) => i !== index);
  },
  insert<T>(list: T[], index: number, item: T) {
    return [...list.slice(0, index), item, ...list.slice(index)];
  },
};
