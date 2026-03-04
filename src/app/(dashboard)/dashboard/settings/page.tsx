import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  Scale,
  Mail,
  Building2,
  MapPin,
  BookOpen,
  Monitor,
  Moon,
  Sun,
  Globe,
  Clock,
  FileText,
  Lock,
  Eye,
  Briefcase,
  Volume2,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  ExternalLink,
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-serif">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and application settings</p>
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="font-serif">Profile</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <Lock className="h-3 w-3" />
              Managed by Clerk
            </Badge>
          </div>
          <CardDescription>
            Your profile information is managed through Clerk authentication. Contact your
            administrator to update these fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Managed by Clerk</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Managed by Clerk</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@parrbrown.com"
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Managed by Clerk</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2 text-sm">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                Role
              </Label>
              <Input
                id="role"
                placeholder="Attorney"
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Assigned by administrator</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="barNumber" className="flex items-center gap-2 text-sm">
                <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                Bar Number
              </Label>
              <Input
                id="barNumber"
                placeholder="UT-12345"
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Utah State Bar registration number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurisdiction" className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Primary Jurisdiction
              </Label>
              <Input
                id="jurisdiction"
                placeholder="Utah"
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Primary practice jurisdiction</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firm" className="flex items-center gap-2 text-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Firm
              </Label>
              <Input
                id="firm"
                placeholder="Parr Brown Gee & Loveless"
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Organization affiliation</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="practiceArea" className="flex items-center gap-2 text-sm">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                Practice Area
              </Label>
              <Input
                id="practiceArea"
                placeholder="Commercial Litigation"
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Primary practice area</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <ExternalLink className="h-4 w-4 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-500">
              To update your name, email, or password, visit your Clerk profile settings or contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="font-serif">Preferences</CardTitle>
          </div>
          <CardDescription>
            Customize your CaseBrake.ai experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Monitor className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button variant="ghost" size="sm" className="h-8 px-3 gap-1.5 rounded-md">
                <Sun className="h-3.5 w-3.5" />
                <span className="text-xs">Light</span>
              </Button>
              <Button variant="secondary" size="sm" className="h-8 px-3 gap-1.5 rounded-md">
                <Moon className="h-3.5 w-3.5" />
                <span className="text-xs">Dark</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Default Case View */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Default Case View</p>
                <p className="text-xs text-muted-foreground">How cases are displayed in the list</p>
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button variant="secondary" size="sm" className="h-8 px-3 rounded-md">
                <span className="text-xs">Cards</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 rounded-md">
                <span className="text-xs">Table</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 rounded-md">
                <span className="text-xs">List</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Language</p>
                <p className="text-xs text-muted-foreground">Display language for the interface</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">English (US)</Badge>
          </div>

          <Separator />

          {/* Timezone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Timezone</p>
                <p className="text-xs text-muted-foreground">Used for deadlines and scheduling</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">America/Denver (MT)</Badge>
          </div>

          <Separator />

          {/* Default AI Model */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Analysis Detail Level</p>
                <p className="text-xs text-muted-foreground">Controls the depth of AI-generated analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button variant="ghost" size="sm" className="h-8 px-3 rounded-md">
                <span className="text-xs">Concise</span>
              </Button>
              <Button variant="secondary" size="sm" className="h-8 px-3 rounded-md">
                <span className="text-xs">Standard</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 rounded-md">
                <span className="text-xs">Detailed</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="font-serif">Notifications</CardTitle>
          </div>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification Rows */}
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Case Updates</p>
                <p className="text-xs text-muted-foreground">When a case status changes or new analysis is ready</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Mail className="h-3 w-3" />
                Email
              </Button>
              <Button variant="secondary" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Smartphone className="h-3 w-3" />
                Push
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Eye className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Prediction Results</p>
                <p className="text-xs text-muted-foreground">When AI predictions are complete</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Mail className="h-3 w-3" />
                Email
              </Button>
              <Button variant="secondary" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Smartphone className="h-3 w-3" />
                Push
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Deadline Reminders</p>
                <p className="text-xs text-muted-foreground">Upcoming case deadlines and filing dates</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Mail className="h-3 w-3" />
                Email
              </Button>
              <Button variant="secondary" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Smartphone className="h-3 w-3" />
                Push
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Team Messages</p>
                <p className="text-xs text-muted-foreground">When team members share cases or send messages</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Mail className="h-3 w-3" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Smartphone className="h-3 w-3" />
                Push
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Volume2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">System Announcements</p>
                <p className="text-xs text-muted-foreground">Platform updates, maintenance windows, and new features</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Mail className="h-3 w-3" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 gap-1 text-xs">
                <Smartphone className="h-3 w-3" />
                Push
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="font-serif">Security</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <Lock className="h-3 w-3" />
              Managed by Clerk
            </Badge>
          </div>
          <CardDescription>
            Authentication and security settings are managed through Clerk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Last changed: Unknown</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs" disabled>
              Change via Clerk
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs" disabled>
              Configure via Clerk
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Active Sessions</p>
                <p className="text-xs text-muted-foreground">Manage your active login sessions</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs" disabled>
              View via Clerk
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          CaseBrake.ai v1.0 &middot; Parr Brown Gee &amp; Loveless &middot; All settings are saved automatically
        </p>
      </div>
    </div>
  )
}
