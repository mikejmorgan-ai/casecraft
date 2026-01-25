'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import type { CaseType } from '@/lib/types'

const CASE_TYPES: { value: CaseType; label: string }[] = [
  { value: 'civil', label: 'Civil' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'family', label: 'Family' },
  { value: 'contract', label: 'Contract' },
  { value: 'tort', label: 'Tort' },
  { value: 'property', label: 'Property' },
  { value: 'constitutional', label: 'Constitutional' },
  { value: 'administrative', label: 'Administrative' },
]

export function CreateCaseDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    case_type: 'civil' as CaseType,
    case_number: '',
    jurisdiction: '',
    plaintiff_name: '',
    defendant_name: '',
    summary: '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create case')
      }

      const newCase = await response.json()
      setOpen(false)
      router.push(`/case/${newCase.id}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to create case:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="btn-create-case">
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent id="create-case-dialog" className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
            <DialogDescription>
              Set up a new case simulation. Default agents will be created automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="input-case-name">Case Name *</Label>
              <Input
                id="input-case-name"
                placeholder="e.g., Smith v. Jones"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="select-case-type">Case Type *</Label>
                <Select
                  value={formData.case_type}
                  onValueChange={(value: CaseType) => setFormData({ ...formData, case_type: value })}
                >
                  <SelectTrigger id="select-case-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="input-case-number">Case Number</Label>
                <Input
                  id="input-case-number"
                  placeholder="e.g., 2024-CV-00123"
                  value={formData.case_number}
                  onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="input-jurisdiction">Jurisdiction</Label>
              <Input
                id="input-jurisdiction"
                placeholder="e.g., Federal - Northern District of California"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="input-plaintiff">Plaintiff</Label>
                <Input
                  id="input-plaintiff"
                  placeholder="Plaintiff name"
                  value={formData.plaintiff_name}
                  onChange={(e) => setFormData({ ...formData, plaintiff_name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="input-defendant">Defendant</Label>
                <Input
                  id="input-defendant"
                  placeholder="Defendant name"
                  value={formData.defendant_name}
                  onChange={(e) => setFormData({ ...formData, defendant_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="input-summary">Case Summary</Label>
              <Textarea
                id="input-summary"
                placeholder="Brief description of the case..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button id="btn-submit-case" type="submit" disabled={loading || !formData.name}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Case'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
