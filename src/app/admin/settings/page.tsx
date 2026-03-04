import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Globe,
  Key,
  Puzzle,
  Shield,
  Database,
  Server,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cloud,
  Bot,
  FileText,
  Zap,
} from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-serif">System Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings and integrations</p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="font-serif">General</CardTitle>
          </div>
          <CardDescription>
            Core platform configuration settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-sm">Organization Name</Label>
              <Input
                id="orgName"
                defaultValue="Parr Brown Gee & Loveless"
                disabled
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurisdiction" className="text-sm">Default Jurisdiction</Label>
              <Input
                id="jurisdiction"
                defaultValue="Utah"
                disabled
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCases" className="text-sm">Max Cases per User</Label>
              <Input
                id="maxCases"
                defaultValue="50"
                disabled
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDocs" className="text-sm">Max Document Size (MB)</Label>
              <Input
                id="maxDocs"
                defaultValue="25"
                disabled
                className="bg-muted/50"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Feature Flags</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { name: 'AI Predictions', enabled: true, icon: Bot },
                { name: 'Blind Testing', enabled: true, icon: Eye },
                { name: 'Document Analysis', enabled: true, icon: FileText },
                { name: 'Hearing Simulations', enabled: true, icon: Zap },
                { name: 'Mediation Simulations', enabled: false, icon: Zap },
                { name: 'Comparative Analysis', enabled: false, icon: Zap },
              ].map((flag) => (
                <div key={flag.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <flag.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{flag.name}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={flag.enabled
                      ? 'bg-green-500/10 text-green-500 text-xs'
                      : 'bg-muted text-muted-foreground text-xs'}
                  >
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle className="font-serif">API Keys</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <Lock className="h-3 w-3" />
              Encrypted
            </Badge>
          </div>
          <CardDescription>
            Manage API keys for external service integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'OpenAI API Key', env: 'OPENAI_API_KEY', status: 'configured', icon: Bot },
            { name: 'Anthropic API Key', env: 'ANTHROPIC_API_KEY', status: 'configured', icon: Bot },
            { name: 'Supabase Service Key', env: 'SUPABASE_SERVICE_KEY', status: 'configured', icon: Database },
            { name: 'Clerk Secret Key', env: 'CLERK_SECRET_KEY', status: 'configured', icon: Shield },
          ].map((key) => (
            <div key={key.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <key.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{key.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{key.env}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-xs text-green-500 capitalize">{key.status}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <EyeOff className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
            <p className="text-xs text-orange-500">
              API keys are stored as encrypted environment variables. Changes require a server restart.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Puzzle className="h-5 w-5 text-primary" />
            <CardTitle className="font-serif">Integrations</CardTitle>
          </div>
          <CardDescription>
            External service connections and third-party integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              name: 'Supabase',
              description: 'PostgreSQL database and authentication',
              status: 'connected',
              icon: Database,
              color: 'text-green-500',
            },
            {
              name: 'Clerk',
              description: 'User authentication and management',
              status: 'connected',
              icon: Shield,
              color: 'text-green-500',
            },
            {
              name: 'OpenAI',
              description: 'GPT models for AI analysis and predictions',
              status: 'connected',
              icon: Bot,
              color: 'text-green-500',
            },
            {
              name: 'Anthropic',
              description: 'Claude models for advanced reasoning',
              status: 'connected',
              icon: Bot,
              color: 'text-green-500',
            },
            {
              name: 'Westlaw / LexisNexis',
              description: 'Legal research database integration',
              status: 'not_configured',
              icon: Server,
              color: 'text-muted-foreground',
            },
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <integration.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {integration.status === 'connected' ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-xs text-green-500">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Not Configured</span>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled>
                  <ExternalLink className="h-3 w-3" />
                  Configure
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Platform</p>
              <p className="text-sm font-medium">CaseBrake.ai v1.0</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Framework</p>
              <p className="text-sm font-medium">Next.js 15 (App Router)</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Environment</p>
              <p className="text-sm font-medium">Production</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
