'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Keyboard, Globe, MessageSquare, Navigation, Gavel } from 'lucide-react'
import { GLOBAL_SHORTCUTS } from '@/lib/hooks/use-keyboard-shortcuts'

interface ShortcutGroup {
  category: string
  label: string
  icon: React.ElementType
  shortcuts: typeof GLOBAL_SHORTCUTS
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  global: { label: 'Global', icon: Globe },
  navigation: { label: 'Navigation', icon: Navigation },
  chat: { label: 'Chat', icon: MessageSquare },
  hearing: { label: 'Hearing', icon: Gavel },
}

function groupShortcuts(): ShortcutGroup[] {
  const groups: Record<string, typeof GLOBAL_SHORTCUTS> = {}

  for (const shortcut of GLOBAL_SHORTCUTS) {
    if (!groups[shortcut.category]) {
      groups[shortcut.category] = []
    }
    groups[shortcut.category].push(shortcut)
  }

  return Object.entries(groups).map(([category, shortcuts]) => ({
    category,
    label: CATEGORY_CONFIG[category]?.label || category,
    icon: CATEGORY_CONFIG[category]?.icon || Keyboard,
    shortcuts,
  }))
}

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if user is typing in an input
    const target = e.target as HTMLElement
    const isInInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable

    // Open with "?" key (Shift + /)
    if (e.key === '?' && !isInInput) {
      e.preventDefault()
      setIsOpen(true)
      return
    }

    // Close with Escape
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault()
      setIsOpen(false)
      return
    }
  }, [isOpen])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const shortcutGroups = groupShortcuts()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent id="keyboard-shortcuts-dialog" className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and interact with CaseBrake.ai more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => {
            const Icon = group.icon
            return (
              <div key={group.category}>
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4" />
                  {group.label}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={`${group.category}-${index}`}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <ShortcutBadge shortcut={shortcut} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">?</kbd> to toggle this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutBadge({ shortcut }: { shortcut: typeof GLOBAL_SHORTCUTS[number] }) {
  // Check if we're on a Mac for displaying appropriate modifier key names
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')

  const parts: string[] = []

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
    default:
      keyDisplay = shortcut.key.toUpperCase()
  }

  parts.push(keyDisplay)

  return (
    <div className="flex items-center gap-1">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono font-medium">
            {part}
          </kbd>
          {i < parts.length - 1 && (
            <span className="text-muted-foreground text-xs">+</span>
          )}
        </span>
      ))}
    </div>
  )
}
