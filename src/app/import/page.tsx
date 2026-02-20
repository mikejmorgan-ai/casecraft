import { ImportWizard } from '@/components/import/import-wizard'

export const metadata = {
  title: 'Import Case | CaseCraft',
  description: 'Import a new case with documents, claims, and AI agents',
}

export default function ImportPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Case Import Wizard</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Import a new case with documents, configure claims, and set up AI agents
            for comprehensive legal analysis.
          </p>
        </div>
        <ImportWizard />
      </div>
    </div>
  )
}
