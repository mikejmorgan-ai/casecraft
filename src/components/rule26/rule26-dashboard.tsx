'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DiscoveryConfigForm } from './discovery-config-form'
import { DeadlineTracker } from './deadline-tracker'
import { DisclosureManager } from './disclosure-manager'
import { ExpertDisclosureManager } from './expert-disclosure-manager'
import { PrivilegeLogManager } from './privilege-log-manager'
import { WrittenDiscoveryManager } from './written-discovery-manager'
import type { DiscoveryConfig, DiscoveryDeadline } from '@/lib/types'
import {
  Scale,
  Clock,
  Users,
  FileText,
  Shield,
  ScrollText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Settings,
  Calendar,
  BookOpen,
} from 'lucide-react'

interface Rule26DashboardProps {
  caseId: string
  caseName: string
  jurisdiction?: string | null
}

interface DashboardData {
  config: DiscoveryConfig | null
  summary: {
    disclosures: number
    experts: number
    deadlines: number
    privilege_entries: number
    written_discovery: number
  }
  upcoming_deadlines: DiscoveryDeadline[]
}

export function Rule26Dashboard({ caseId, caseName, jurisdiction }: Rule26DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/rule26`)
      if (!response.ok) throw new Error('Failed to load discovery data')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Discovery Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => { setLoading(true); setError(null); fetchData() }}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasConfig = !!data?.config
  const overdueCount = data?.upcoming_deadlines?.filter(d => d.status === 'overdue').length || 0
  const dueSoonCount = data?.upcoming_deadlines?.filter(d => d.status === 'due_soon').length || 0

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={<Settings className="h-5 w-5" />}
          label="Config"
          value={hasConfig ? 'Active' : 'Setup'}
          variant={hasConfig ? 'success' : 'warning'}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Disclosures"
          value={data?.summary.disclosures || 0}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Experts"
          value={data?.summary.experts || 0}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Deadlines"
          value={data?.summary.deadlines || 0}
          alert={overdueCount > 0 ? `${overdueCount} overdue` : undefined}
        />
        <StatCard
          icon={<Shield className="h-5 w-5" />}
          label="Privilege Log"
          value={data?.summary.privilege_entries || 0}
        />
        <StatCard
          icon={<ScrollText className="h-5 w-5" />}
          label="Written Discovery"
          value={data?.summary.written_discovery || 0}
        />
      </div>

      {/* Overdue Alert Banner */}
      {overdueCount > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {overdueCount} overdue deadline{overdueCount !== 1 ? 's' : ''} require{overdueCount === 1 ? 's' : ''} immediate attention
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('deadlines')}>
                View Deadlines
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Due Soon Alert */}
      {dueSoonCount > 0 && overdueCount === 0 && (
        <Card className="border-amber-500 bg-amber-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700">
                  {dueSoonCount} deadline{dueSoonCount !== 1 ? 's' : ''} due soon
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('deadlines')}>
                View Deadlines
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border w-full overflow-x-auto flex justify-start sm:justify-center no-scrollbar">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
            <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="disclosures" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Disclosures
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Experts
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Deadlines
            {overdueCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">{overdueCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="privilege" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Privilege Log
          </TabsTrigger>
          <TabsTrigger value="written" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Written
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
                <CardDescription>Rule 26 obligation tracking for {caseName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ComplianceRow
                    label="Discovery Configuration"
                    status={hasConfig ? 'complete' : 'action_needed'}
                    detail={hasConfig ? `${data?.config?.jurisdiction_type === 'utah' ? `Utah Tier ${data?.config?.utah_tier}` : 'Federal'} rules applied` : 'Set up jurisdiction and tier'}
                  />
                  <ComplianceRow
                    label="Initial Disclosures (26(a)(1))"
                    status={(data?.summary.disclosures || 0) > 0 ? 'complete' : 'action_needed'}
                    detail={`${data?.summary.disclosures || 0} disclosure set${(data?.summary.disclosures || 0) !== 1 ? 's' : ''}`}
                  />
                  <ComplianceRow
                    label="Expert Disclosures (26(a)(2))"
                    status={(data?.summary.experts || 0) > 0 ? 'complete' : 'pending'}
                    detail={`${data?.summary.experts || 0} expert${(data?.summary.experts || 0) !== 1 ? 's' : ''} designated`}
                  />
                  <ComplianceRow
                    label="Privilege Log (26(b)(5))"
                    status={(data?.summary.privilege_entries || 0) > 0 ? 'complete' : 'pending'}
                    detail={`${data?.summary.privilege_entries || 0} entr${(data?.summary.privilege_entries || 0) !== 1 ? 'ies' : 'y'}`}
                  />
                  <ComplianceRow
                    label="Written Discovery"
                    status={(data?.summary.written_discovery || 0) > 0 ? 'complete' : 'pending'}
                    detail={`${data?.summary.written_discovery || 0} set${(data?.summary.written_discovery || 0) !== 1 ? 's' : ''}`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>Next 5 approaching deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.upcoming_deadlines && data.upcoming_deadlines.length > 0 ? (
                  <div className="space-y-3">
                    {data.upcoming_deadlines.map((deadline) => (
                      <DeadlinePreviewRow key={deadline.id} deadline={deadline} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No upcoming deadlines. Add dates in the Config tab to generate deadlines.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Jurisdiction Info */}
            {hasConfig && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Discovery Rules Applied
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <LimitCard
                      label="Interrogatories"
                      limit={data.config!.max_interrogatories}
                      rule={data.config!.jurisdiction_type === 'utah' ? 'URCP 33' : 'FRCP 33'}
                    />
                    <LimitCard
                      label="Requests for Admission"
                      limit={data.config!.max_rfas}
                      rule={data.config!.jurisdiction_type === 'utah' ? 'URCP 36' : 'FRCP 36'}
                    />
                    <LimitCard
                      label="Requests for Production"
                      limit={data.config!.max_rfps}
                      rule={data.config!.jurisdiction_type === 'utah' ? 'URCP 34' : 'FRCP 34'}
                    />
                    <LimitCard
                      label="Fact Depositions"
                      limit={data.config!.max_fact_depositions}
                      hours={data.config!.max_fact_depo_hours}
                      rule={data.config!.jurisdiction_type === 'utah' ? 'URCP 30' : 'FRCP 30'}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Disclosures Tab */}
        <TabsContent value="disclosures">
          <DisclosureManager caseId={caseId} onUpdate={fetchData} />
        </TabsContent>

        {/* Experts Tab */}
        <TabsContent value="experts">
          <ExpertDisclosureManager caseId={caseId} onUpdate={fetchData} />
        </TabsContent>

        {/* Deadlines Tab */}
        <TabsContent value="deadlines">
          <DeadlineTracker caseId={caseId} onUpdate={fetchData} />
        </TabsContent>

        {/* Privilege Log Tab */}
        <TabsContent value="privilege">
          <PrivilegeLogManager caseId={caseId} onUpdate={fetchData} />
        </TabsContent>

        {/* Written Discovery Tab */}
        <TabsContent value="written">
          <WrittenDiscoveryManager caseId={caseId} onUpdate={fetchData} />
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config">
          <DiscoveryConfigForm
            caseId={caseId}
            existingConfig={data?.config || undefined}
            jurisdiction={jurisdiction}
            onSave={fetchData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function StatCard({
  icon,
  label,
  value,
  variant,
  alert,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  variant?: 'success' | 'warning'
  alert?: string
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 text-center">
        <div className="flex justify-center mb-2 text-primary">{icon}</div>
        <p className={`text-2xl font-bold ${
          variant === 'success' ? 'text-green-600' :
          variant === 'warning' ? 'text-amber-600' :
          'text-primary'
        }`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {alert && (
          <Badge variant="destructive" className="text-[10px] mt-1">{alert}</Badge>
        )}
      </CardContent>
    </Card>
  )
}

function ComplianceRow({
  label,
  status,
  detail,
}: {
  label: string
  status: 'complete' | 'action_needed' | 'pending'
  detail: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <Badge
        variant={status === 'complete' ? 'default' : 'outline'}
        className={
          status === 'complete' ? 'bg-green-100 text-green-800 border-green-200' :
          status === 'action_needed' ? 'bg-amber-100 text-amber-800 border-amber-200' :
          'bg-gray-100 text-gray-600'
        }
      >
        {status === 'complete' ? 'Done' : status === 'action_needed' ? 'Action Needed' : 'Pending'}
      </Badge>
    </div>
  )
}

function DeadlinePreviewRow({ deadline }: { deadline: DiscoveryDeadline }) {
  const dueDate = new Date(deadline.due_date)
  const now = new Date()
  const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysUntil < 0
  const isDueSoon = daysUntil >= 0 && daysUntil <= 7

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{deadline.title}</p>
        <p className="text-xs text-muted-foreground">
          {deadline.rule_reference && `${deadline.rule_reference} · `}
          {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <Badge
        variant="outline"
        className={
          isOverdue ? 'bg-red-100 text-red-800 border-red-200' :
          isDueSoon ? 'bg-amber-100 text-amber-800 border-amber-200' :
          'bg-blue-100 text-blue-800 border-blue-200'
        }
      >
        {isOverdue ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Today' : `${daysUntil}d`}
      </Badge>
    </div>
  )
}

function LimitCard({
  label,
  limit,
  hours,
  rule,
}: {
  label: string
  limit: number
  hours?: number
  rule: string
}) {
  return (
    <div className="p-4 bg-primary/5 rounded-lg text-center">
      <p className="text-2xl font-bold text-primary">{limit}</p>
      <p className="text-sm font-medium">{label}</p>
      {hours && <p className="text-xs text-muted-foreground">{hours} hrs each max</p>}
      <p className="text-xs text-muted-foreground mt-1">{rule}</p>
    </div>
  )
}
