'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
  category: 'navigation' | 'chat' | 'hearing' | 'global'
  /** If true, the shortcut will work even when typing in an input */
  allowInInput?: boolean
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

/**
 * Check if the event target is an input element where typing should be allowed
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false

  const tagName = target.tagName.toLowerCase()
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select'
  const isContentEditable = target.isContentEditable

  return isInput || isContentEditable
}

/**
 * Check if a modifier key is pressed (Ctrl on Windows/Linux, Cmd on Mac)
 */
function isModifierPressed(e: KeyboardEvent): boolean {
  // On Mac, use metaKey (Cmd), on Windows/Linux use ctrlKey
  return e.metaKey || e.ctrlKey
}

/**
 * Normalize the key for comparison
 */
function normalizeKey(key: string): string {
  return key.toLowerCase()
}

/**
 * Custom hook for managing keyboard shortcuts
 * Prevents shortcuts from firing when user is typing in input fields
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts)

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return

    const isInInput = isInputElement(e.target)
    const pressedKey = normalizeKey(e.key)

    for (const shortcut of shortcutsRef.current) {
      const shortcutKey = normalizeKey(shortcut.key)

      // Skip if in input and shortcut doesn't allow it
      if (isInInput && !shortcut.allowInInput) {
        // Exception: Allow Escape to work in inputs for clearing/closing
        if (pressedKey !== 'escape') continue
      }

      // Check if the key matches
      if (pressedKey !== shortcutKey) continue

      // Check modifier keys
      const needsModifier = shortcut.ctrlKey || shortcut.metaKey
      const hasModifier = isModifierPressed(e)

      if (needsModifier && !hasModifier) continue
      if (!needsModifier && hasModifier) continue

      // Check shift key
      if (shortcut.shiftKey && !e.shiftKey) continue
      if (!shortcut.shiftKey && e.shiftKey && shortcutKey !== '?') continue

      // Check alt key
      if (shortcut.altKey && !e.altKey) continue
      if (!shortcut.altKey && e.altKey) continue

      // Execute the action
      e.preventDefault()
      shortcut.action()
      return
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

/**
 * Format a shortcut key combination for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? 'Cmd' : 'Ctrl')
  }
  if (shortcut.altKey) {
    parts.push(isMac ? 'Option' : 'Alt')
  }
  if (shortcut.shiftKey) {
    parts.push('Shift')
  }

  // Format special keys
  let keyDisplay = shortcut.key
  switch (shortcut.key.toLowerCase()) {
    case 'escape':
      keyDisplay = 'Esc'
      break
    case ' ':
      keyDisplay = 'Space'
      break
    case 'enter':
      keyDisplay = 'Enter'
      break
    case '/':
      keyDisplay = '/'
      break
    case '?':
      keyDisplay = '?'
      break
    default:
      keyDisplay = shortcut.key.toUpperCase()
  }

  parts.push(keyDisplay)
  return parts.join(' + ')
}

/**
 * Global shortcuts registry for the help dialog
 */
export const GLOBAL_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  // Global
  { key: '?', description: 'Show keyboard shortcuts help', category: 'global', shiftKey: true },
  { key: 'Escape', description: 'Close modals/dialogs', category: 'global', allowInInput: true },

  // Navigation
  { key: 'n', description: 'New case (on dashboard)', category: 'navigation' },

  // Chat
  { key: 'Enter', ctrlKey: true, description: 'Send message', category: 'chat', allowInInput: true },
  { key: 'Escape', description: 'Clear input', category: 'chat', allowInInput: true },
  { key: '/', ctrlKey: true, description: 'Focus message input', category: 'chat' },

  // Hearing
  { key: ' ', description: 'Start/Stop hearing', category: 'hearing' },
  { key: 'm', description: 'Toggle mute', category: 'hearing' },
  { key: 'd', description: 'Download transcript', category: 'hearing' },
  { key: 'p', description: 'Download PDF', category: 'hearing' },
]
