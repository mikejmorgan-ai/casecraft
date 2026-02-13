'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import {
  Share2,
  Mail,
  Users,
  Trash2,
  Loader2,
  Eye,
  MessageSquare,
  Edit,
  Shield,
  Clock,
  AlertCircle,
  Check,
  Copy,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CaseShare {
  id: string
  case_id: string
  shared_with_email: string
  shared_with_user_id: string | null
  permission_level: 'view' | 'comment' | 'edit' | 'admin'
  expires_at: string | null
  accepted_at: string | null
  created_at: string
  shared_user?: {
    id: string
    email: string
  } | null
}

interface CaseSharingProps {
  caseId: string
  caseName: string
  isOwner: boolean
}

const PERMISSION_LEVELS = [
  { value: 'view', label: 'View', description: 'Can view case details and documents', icon: Eye },
  { value: 'comment', label: 'Comment', description: 'Can view and add comments', icon: MessageSquare },
  { value: 'edit', label: 'Edit', description: 'Can edit case details and documents', icon: Edit },
  { value: 'admin', label: 'Admin', description: 'Full access including sharing', icon: Shield },
] as const

const PERMISSION_COLORS = {
  view: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  comment: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  edit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

export function CaseSharing({ caseId, caseName, isOwner }: CaseSharingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shares, setShares] = useState<CaseShare[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'comment' | 'edit' | 'admin'>('view')

  const fetchShares = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/shares`)
      if (response.ok) {
        const data = await response.json()
        setShares(data)
      }
    } catch (err) {
      console.error('Error fetching shares:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && isOwner) {
      fetchShares()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isOwner, caseId])

  const handleShare = async () => {
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          permission_level: permissionLevel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to share case')
      }

      setSuccess(`Case shared with ${email}`)
      setEmail('')
      setPermissionLevel('view')
      fetchShares()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share case')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePermission = async (shareId: string, newPermission: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/shares`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          permission_level: newPermission,
        }),
      })

      if (response.ok) {
        fetchShares()
      }
    } catch (err) {
      console.error('Error updating permission:', err)
    }
  }

  const handleRemoveShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/shares?shareId=${shareId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setShares(shares.filter(s => s.id !== shareId))
      }
    } catch (err) {
      console.error('Error removing share:', err)
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/case/${caseId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOwner) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Case
          </DialogTitle>
          <DialogDescription>
            Share &quot;{caseName}&quot; with team members or clients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share by Email */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                  />
                </div>
                <Select value={permissionLevel} onValueChange={(v: 'view' | 'comment' | 'edit' | 'admin') => setPermissionLevel(v)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERMISSION_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <level.icon className="h-4 w-4" />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {PERMISSION_LEVELS.find(l => l.value === permissionLevel)?.description}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {success}
              </div>
            )}

            <Button onClick={handleShare} disabled={isSubmitting} className="w-full gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </div>

          {/* Current Shares */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                People with access ({shares.length})
              </Label>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : shares.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  This case hasn&apos;t been shared with anyone yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {share.shared_with_email}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {share.accepted_at ? (
                            <span className="text-green-600">Accepted</span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                          {share.expires_at && (
                            <span>
                              Expires {new Date(share.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={share.permission_level}
                        onValueChange={(v) => handleUpdatePermission(share.id, v)}
                      >
                        <SelectTrigger className="h-8 w-[100px]">
                          <Badge variant="secondary" className={cn('text-xs', PERMISSION_COLORS[share.permission_level])}>
                            {share.permission_level}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {PERMISSION_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveShare(share.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Copy Link */}
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={copyLink} className="w-full gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Case Link
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Link only works for people you&apos;ve shared with
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
