"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

interface MenuApi {
  open: boolean;
  /** Open or close. `immediate` skips the animation (used when a navigation completes under the curtain). */
  setOpen: (open: boolean, opts?: { immediate?: boolean }) => void;
  toggle: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  /** Read once by the overlay when `open` changes. */
  immediateRef: RefObject<boolean>;
}

const Ctx = createContext<MenuApi | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const immediateRef = useRef(false);

  const setOpen = useCallback((v: boolean, opts?: { immediate?: boolean }) => {
    immediateRef.current = !!opts?.immediate;
    setOpenState(v);
  }, []);
  const toggle = useCallback(() => {
    immediateRef.current = false;
    setOpenState((o) => !o);
  }, []);

  const value = useMemo(() => ({ open, setOpen, toggle, buttonRef, immediateRef }), [open, setOpen, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Open/close the full-screen menu from anywhere. */
export function useMenu(): MenuApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMenu must be used inside <MenuProvider>");
  return v;
}
