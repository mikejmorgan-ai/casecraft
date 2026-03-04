'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, FileText, Scale, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ImportBlindTestProps {
  onSuccess?: (caseId: string) => void
}

export function ImportBlindTest({ onSuccess }: ImportBlindTestProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'info' | 'ruling' | 'documents'>('info')
  const [caseId, setCaseId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    caseNumber: '',
    caseType: 'civil',
    jurisdiction: '',
    plaintiffName: '',
    defendantName: '',
    summary: '',
    // Hidden ruling info
    actualRuling: 'plaintiff',
    actualRulingDate: '',
    actualRulingSummary: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const createCase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          case_number: formData.caseNumber || null,
          case_type: formData.caseType,
          jurisdiction: formData.jurisdiction || null,
          plaintiff_name: formData.plaintiffName || null,
          defendant_name: formData.defendantName || null,
          summary: formData.summary || null,
          status: 'active',
          is_blind_test: true,
          actual_ruling: formData.actualRuling,
          actual_ruling_date: formData.actualRulingDate || null,
          actual_ruling_summary: formData.actualRulingSummary || null,
          ruling_revealed: false,
        }),
      })

      if (!response.ok) throw new Error('Failed to create case')

      const data = await response.json()
      setCaseId(data.id)
      setStep('documents')
    } catch (err) {
      console.error(err)
      alert('Failed to create case')
    } finally {
      setLoading(false)
    }
  }

  const goToCase = () => {
    if (caseId) {
      onSuccess?.(caseId)
      router.push(`/case/${caseId}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <div className={`flex items-center gap-2 ${step === 'info' ? 'text-[#1a365d] font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'info' ? 'bg-[#1a365d] text-white' : 'bg-gray-200'}`}>1</div>
          Case Info
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
        <div className={`flex items-center gap-2 ${step === 'ruling' ? 'text-[#1a365d] font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'ruling' ? 'bg-[#1a365d] text-white' : 'bg-gray-200'}`}>2</div>
          Actual Ruling
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
        <div className={`flex items-center gap-2 ${step === 'documents' ? 'text-[#1a365d] font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'documents' ? 'bg-[#1a365d] text-white' : 'bg-gray-200'}`}>3</div>
          Documents
        </div>
      </div>

      {/* Step 1: Case Info */}
      {step === 'info' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-6 w-6 text-[#1a365d]" />
            <h2 className="text-xl font-semibold text-[#1a365d]">Import Adjudicated Case</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Case Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Mathews v. Tooele County"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                placeholder="e.g., 2024-CV-001234"
                value={formData.caseNumber}
                onChange={(e) => handleChange('caseNumber', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="caseType">Case Type</Label>
              <Select value={formData.caseType} onValueChange={(v) => handleChange('caseType', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="constitutional">Constitutional</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="tort">Tort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="plaintiffName">Plaintiff</Label>
              <Input
                id="plaintiffName"
                placeholder="Plaintiff name"
                value={formData.plaintiffName}
                onChange={(e) => handleChange('plaintiffName', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="defendantName">Defendant</Label>
              <Input
                id="defendantName"
                placeholder="Defendant name"
                value={formData.defendantName}
                onChange={(e) => handleChange('defendantName', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                placeholder="e.g., Utah Third District Court"
                value={formData.jurisdiction}
                onChange={(e) => handleChange('jurisdiction', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="summary">Case Summary</Label>
              <Textarea
                id="summary"
                placeholder="Brief description of the case..."
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={() => setStep('ruling')}
            disabled={!formData.name}
            className="w-full bg-[#1a365d] hover:bg-[#2d4a7c]"
          >
            Next: Enter Actual Ruling
          </Button>
        </Card>
      )}

      {/* Step 2: Actual Ruling (Hidden) */}
      {step === 'ruling' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-[#1a365d]">Actual Ruling (Hidden)</h2>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>Note:</strong> This information will be hidden during prediction and only revealed after you compare results.
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="actualRuling">Ruling Outcome *</Label>
              <Select value={formData.actualRuling} onValueChange={(v) => handleChange('actualRuling', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plaintiff">Plaintiff Prevails</SelectItem>
                  <SelectItem value="defendant">Defendant Prevails</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                  <SelectItem value="moot">Moot</SelectItem>
                  <SelectItem value="settled">Settled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="actualRulingDate">Ruling Date</Label>
              <Input
                id="actualRulingDate"
                type="date"
                value={formData.actualRulingDate}
                onChange={(e) => handleChange('actualRulingDate', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="actualRulingSummary">Ruling Summary</Label>
              <Textarea
                id="actualRulingSummary"
                placeholder="Summary of the court's actual ruling..."
                value={formData.actualRulingSummary}
                onChange={(e) => handleChange('actualRulingSummary', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
              Back
            </Button>
            <Button
              onClick={createCase}
              disabled={loading || !formData.actualRuling}
              className="flex-1 bg-[#1a365d] hover:bg-[#2d4a7c]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Case & Continue'
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Documents */}
      {step === 'documents' && caseId && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-[#1a365d]">Case Created!</h2>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            Your blind test case has been created. Now upload the case documents (motions, briefs, etc.) that the AI will analyze to make its prediction.
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> For best results, upload:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Motion(s) for Summary Judgment</li>
              <li>Opposition briefs</li>
              <li>Reply briefs</li>
              <li>Key exhibits and evidence</li>
              <li>DO NOT upload the actual ruling (it&apos;s already stored separately)</li>
            </ul>
          </div>

          <Button
            onClick={goToCase}
            className="w-full bg-[#1a365d] hover:bg-[#2d4a7c]"
          >
            <Upload className="h-4 w-4 mr-2" />
            Go to Case to Upload Documents
          </Button>
        </Card>
      )}
    </div>
  )
}
