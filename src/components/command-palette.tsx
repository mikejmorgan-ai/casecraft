'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  FileText,
  Home,
  Keyboard,
  Plus,
  Scale,
  Search,
  Settings,
  User,
  Zap,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

interface Case {
  id: string
  name: string
  case_number: string | null
  status: string
}

interface CommandPaletteProps {
  cases?: Case[]
}

export function CommandPalette({ cases = [] }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard'))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Go to Dashboard</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              // Trigger new case dialog
              const event = new CustomEvent('open-new-case-dialog')
              window.dispatchEvent(event)
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Case</span>
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              const event = new CustomEvent('open-keyboard-shortcuts')
              window.dispatchEvent(event)
            })}
          >
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
            <CommandShortcut>?</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {cases.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Cases">
              {cases.slice(0, 5).map((caseItem) => (
                <CommandItem
                  key={caseItem.id}
                  onSelect={() => runCommand(() => router.push(`/case/${caseItem.id}`))}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>{caseItem.name}</span>
                  {caseItem.case_number && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      #{caseItem.case_number}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard'))}
          >
            <Scale className="mr-2 h-4 w-4" />
            <span>All Cases</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              // Navigate to active case's documents if available
              if (cases[0]) {
                router.push(`/case/${cases[0].id}?tab=documents`)
              }
            })}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Documents</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Tools">
          <CommandItem
            onSelect={() => runCommand(() => {
              if (cases[0]) {
                router.push(`/case/${cases[0].id}?tab=hearing`)
              }
            })}
          >
            <Zap className="mr-2 h-4 w-4" />
            <span>Run Turbo Simulator</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              // Open search
              const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
              searchInput?.focus()
            })}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search Cases</span>
            <CommandShortcut>/</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
