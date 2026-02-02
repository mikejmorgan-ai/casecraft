'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scale, Plus, FileText, Users, MessageSquare } from 'lucide-react'

export default function DemoPage() {
  const [cases] = useState([
    { id: '1', title: 'Smith v. Johnson', type: 'Civil Litigation', status: 'Active' },
    { id: '2', title: 'State v. Williams', type: 'Criminal Defense', status: 'Discovery' },
    { id: '3', title: 'Acme Corp Merger', type: 'Corporate', status: 'Review' },
  ])

  return (
    <div className="dark min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6" />
            <span className="text-xl font-serif font-semibold">CaseCraft</span>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            Demo Mode (No Auth Required)
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold">Your Cases</h1>
            <p className="text-muted-foreground">Manage your legal simulations</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseItem) => (
            <Card key={caseItem.id} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {caseItem.title}
                </CardTitle>
                <CardDescription>{caseItem.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status: {caseItem.status}</span>
                  <div className="flex gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 border border-dashed border-yellow-500 bg-yellow-500/5">
          <h3 className="font-semibold text-yellow-500 mb-2">Supabase Setup Required</h3>
          <p className="text-sm text-muted-foreground mb-2">
            To enable full functionality with signup/login, you need to fix a database trigger in Supabase:
          </p>
          <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
            <li>Go to your Supabase Dashboard → SQL Editor</li>
            <li>Check if there&apos;s a trigger on auth.users that creates a profile</li>
            <li>Make sure the profiles table exists and the trigger function works</li>
            <li>Or disable any failing triggers temporarily</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
