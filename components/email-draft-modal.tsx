"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, Download, CheckCircle, Mail, Send } from "lucide-react"
import type { Violation } from "@/types/violation"

interface EmailDraftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  violations: Violation[]
}

function generateEmailDraft(site: string, violations: Violation[]) {
  const violationsList = violations
    .map(
      (v) =>
        `- ${v.name || v.umap_cleaned_name}
  Observed Price: $${v.list_price.toFixed(2)}
  UMAP Price: $${v.umap_price.toFixed(2)}
  Link: ${v.product_link}
  Date Detected: ${new Date(v.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`
    )
    .join("\n\n")

  const subject = `UMAP Pricing Compliance Notice - ${violations.length} Product${violations.length > 1 ? "s" : ""} Requiring Attention`

  const body = `Dear ${site} Team,

We are reaching out regarding pricing compliance for products sold on your platform. Our monitoring system has identified the following product(s) being offered below the Unilateral Minimum Advertised Price (UMAP):

${violationsList}

As an authorized reseller, we kindly request that you adjust the advertised prices for these products to comply with our UMAP policy. This policy helps maintain brand integrity and ensures fair competition across all our retail partners.

Please review and correct these pricing discrepancies within 5 business days. If you have any questions about our UMAP policy or need clarification on specific products, please don't hesitate to reach out.

We value our partnership with ${site} and appreciate your prompt attention to this matter.

Best regards,
[Your Name]
Brand Compliance Team`

  return { site, subject, body, violations }
}

export function EmailDraftModal({ open, onOpenChange, violations }: EmailDraftModalProps) {
  const [copied, setCopied] = useState(false)
  const [editedSubject, setEditedSubject] = useState<string | null>(null)
  const [editedBody, setEditedBody] = useState<string | null>(null)

  // Since we only allow one site at a time, we can generate a single draft
  const draft = useMemo(() => {
    if (violations.length === 0) return null
    const site = violations[0].site
    return generateEmailDraft(site, violations)
  }, [violations])

  // Always show the draft content
  const currentSubject = editedSubject ?? draft?.subject ?? ""
  const currentBody = editedBody ?? draft?.body ?? ""

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset edited state when closing
      setEditedSubject(null)
      setEditedBody(null)
    }
    onOpenChange(newOpen)
  }

  const sendEmail = () => {
    if (!draft) return
    const mailtoLink = `mailto:?subject=${encodeURIComponent(currentSubject)}&body=${encodeURIComponent(currentBody)}`
    window.location.href = mailtoLink
  }

  const copyToClipboard = async () => {
    const text = `Subject: ${currentSubject}\n\n${currentBody}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsTxt = () => {
    if (!draft) return
    const text = `Subject: ${currentSubject}\n\n${currentBody}`
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `umap-notice-${draft.site.toLowerCase().replace(/\s+/g, "-")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!draft) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Draft Email</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No violations selected</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg">Email Draft for {draft.site}</DialogTitle>
              <Badge variant="secondary" className="text-xs">
                {violations.length} product{violations.length > 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm text-muted-foreground">
              Subject
            </Label>
            <Input
              id="subject"
              value={currentSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              className="bg-secondary border-border border-"

            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm text-muted-foreground">
              Body
            </Label>
            <Textarea
              id="body"
              value={currentBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="bg-secondary border-border min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Violations Summary */}
          <div className="pt-4 border-t border-border">
            <Label className="text-sm text-muted-foreground mb-2 block">
              Included Violations
            </Label>
            <div className="flex flex-wrap gap-2">
              {violations.map((v) => (
                <Badge key={v.id} variant="outline" className="text-xs">
                  {v.name || v.umap_cleaned_name} ({v.per_diff?.toFixed(1) || '0.0'}%)
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border shrink-0">
          <Button
            size="sm"
            onClick={sendEmail}
            className="gap-2 bg-orange-500 hover:bg-orange-800 text-white"
          >
            <Send className="h-4 w-4" />
            Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
