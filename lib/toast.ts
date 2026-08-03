"use client";

import { create } from "zustand";

export type ToastTone = "default" | "success" | "error";
export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => {
      const id = Date.now() + Math.random();
      setTimeout(() => {
        set((x) => ({ toasts: x.toasts.filter((y) => y.id !== id) }));
      }, 3600);
      return { toasts: [...s.toasts, { ...t, id }] };
    }),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "success" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "error" }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "default" }),
};
