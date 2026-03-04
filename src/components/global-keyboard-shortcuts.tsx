'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Global keyboard shortcuts component
 * Handles shortcuts that work across the entire dashboard
 */
export function GlobalKeyboardShortcuts() {
  const pathname = usePathname()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if user is typing in an input
    const target = e.target as HTMLElement
    const isInInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable

    if (isInInput) return

    // N: New case (only on dashboard)
    if (e.key === 'n' && pathname === '/dashboard') {
      e.preventDefault()
      // Trigger the create case dialog by clicking the button
      const createCaseButton = document.querySelector('[id="btn-create-case"]') as HTMLButtonElement
      if (createCaseButton) {
        createCaseButton.click()
      }
      return
    }

    // Escape: Close any open dialogs
    if (e.key === 'Escape') {
      // Check for any open Radix dialogs and close them
      const openDialog = document.querySelector('[data-state="open"][role="dialog"]')
      if (openDialog) {
        // Find the close button within the dialog
        const closeButton = openDialog.querySelector('[data-slot="dialog-close"]') as HTMLButtonElement
        if (closeButton) {
          e.preventDefault()
          closeButton.click()
        }
      }
      return
    }
  }, [pathname])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // This component doesn't render anything visible
  return null
}
