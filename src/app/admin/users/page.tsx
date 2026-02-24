import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserPlus,
  Shield,
  Scale,
  Briefcase,
  Eye,
  Search,
  MoreHorizontal,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function AdminUsersPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">User Management</h1>
            <p className="text-muted-foreground">Manage team members, roles, and permissions</p>
          </div>
        </div>
        <Button className="gap-2" disabled>
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attorneys</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                <Scale className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paralegals</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-500">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-serif">Team Members</CardTitle>
              <CardDescription>View and manage all users in the organization</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                disabled
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Last Active</div>
              <div className="col-span-1"></div>
            </div>

            {/* Placeholder Rows */}
            {[
              { name: 'John Anderson', email: 'j.anderson@parrbrown.com', role: 'Admin', roleColor: 'bg-purple-500/10 text-purple-500', active: '2 hours ago' },
              { name: 'Sarah Mitchell', email: 's.mitchell@parrbrown.com', role: 'Attorney', roleColor: 'bg-blue-500/10 text-blue-500', active: '5 hours ago' },
              { name: 'David Chen', email: 'd.chen@parrbrown.com', role: 'Attorney', roleColor: 'bg-blue-500/10 text-blue-500', active: '1 day ago' },
              { name: 'Emily Torres', email: 'e.torres@parrbrown.com', role: 'Paralegal', roleColor: 'bg-green-500/10 text-green-500', active: '3 hours ago' },
              { name: 'Michael Park', email: 'm.park@parrbrown.com', role: 'Attorney', roleColor: 'bg-blue-500/10 text-blue-500', active: '1 hour ago' },
            ].map((user, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 p-3 items-center border-b last:border-0 hover:bg-muted/30 transition-colors">
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-muted-foreground truncate">{user.email}</div>
                <div className="col-span-2">
                  <Badge variant="secondary" className={`text-xs ${user.roleColor}`}>
                    {user.role}
                  </Badge>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">{user.active}</div>
                <div className="col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">User Management Features Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Full user management capabilities including invitations, role assignment, permission
                customization, and activity monitoring are currently in development. User
                authentication is managed through Clerk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
