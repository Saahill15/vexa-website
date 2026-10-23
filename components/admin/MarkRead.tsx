"use client";

import { useEffect } from "react";
import { markReadAction } from "@/app/admin/actions";

/** Marks the open inbox item as read, once, a moment after it is shown. */
export function MarkRead({ itemKey, unread }: { itemKey: string; unread: boolean }) {
  useEffect(() => {
    if (!unread) return;
    const t = setTimeout(() => void markReadAction(itemKey), 600);
    return () => clearTimeout(t);
  }, [itemKey, unread]);
  return null;
}
