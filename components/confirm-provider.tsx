"use client"

import React, { createContext, useCallback, useContext, useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"

type ConfirmOptions = {
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
}

type ConfirmContextType = {
  confirm: (opts?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({})
  const resolveRef = useRef<(v: boolean) => void | null>(null)

  const DEFAULTS: ConfirmOptions = {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
  }

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    if (open) return Promise.resolve(false)

    setOptions({ ...DEFAULTS, ...opts })
    setOpen(true)

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [open])

  const handleConfirm = () => {
    setOpen(false)
    resolveRef.current?.(true)
    resolveRef.current = null
  }

  const handleCancel = () => {
    setOpen(false)
    resolveRef.current?.(false)
    resolveRef.current = null
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AlertDialog
        open={open}
        onOpenChange={(val) => {
          if (!val && open) handleCancel()
          setOpen(val)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>

            {/* FIXED — PROPER CANCEL BUTTON */}
            <AlertDialogCancel asChild>
              <button onClick={handleCancel}>
                {options.cancelLabel}
              </button>
            </AlertDialogCancel>

            {/* FIXED — PROPER CONFIRM BUTTON */}
            <AlertDialogAction asChild>
              <button onClick={handleConfirm}>
                {options.confirmLabel}
              </button>
            </AlertDialogAction>

          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider")
  return ctx.confirm
}

export default ConfirmProvider
