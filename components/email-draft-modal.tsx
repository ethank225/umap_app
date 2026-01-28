"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Copy, Download, CheckCircle, Mail, Send, X, Image, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import type { Violation } from "@/types/violation"
import JSZip from "jszip"

interface EmailDraftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  violations: Violation[]
}

interface ScreenshotData {
  token: string
  dataUrl: string
}

interface ExpandedScreenshot {
  token: string
  dataUrl: string
}

async function fetchScreenshot(token: string): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmtnbpuivcvebqlnevwm.supabase.co"
    const screenshotUrl = `${supabaseUrl}/storage/v1/object/public/images/screenshots/${token}.png`

    const response = await fetch(screenshotUrl)
    if (!response.ok) return null

    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error(`Error fetching screenshot for token ${token}:`, error)
    return null
  }
}

function generateEmailDraft(site: string, violations: Violation[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const violationsList = violations
    .map(
      (v) => {
        const rawDate = v.date || v.created_at
        const dateStr = rawDate
          ? new Date(rawDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })
          : "Date unavailable"

        return `- ${v.name || v.umap_cleaned_name}
  Observed Price: $${v.list_price.toFixed(2)}
  UMAP Price: $${v.umap_price.toFixed(2)}
  Link: ${v.product_link}
  Date Detected: ${dateStr}`
      }
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
  const [screenshots, setScreenshots] = useState<ScreenshotData[]>([])
  const [loadingScreenshots, setLoadingScreenshots] = useState(false)
  const [expandedScreenshot, setExpandedScreenshot] = useState<ExpandedScreenshot | null>(null)

  // Load screenshots when modal opens
  useEffect(() => {
    if (!open || violations.length === 0) {
      setScreenshots([])
      return
    }

    setLoadingScreenshots(true)
    const loadScreenshots = async () => {
      const screenshotPromises = violations
        .filter((v) => v.immersive_product_page_token)
        .map(async (v) => {
          const dataUrl = await fetchScreenshot(v.immersive_product_page_token!)
          return dataUrl ? { token: v.immersive_product_page_token!, dataUrl } : null
        })

      const results = await Promise.all(screenshotPromises)
      setScreenshots(results.filter((s) => s !== null) as ScreenshotData[])
      setLoadingScreenshots(false)
    }

    loadScreenshots()
  }, [open, violations])

  // Handle keyboard navigation for expanded images
  useEffect(() => {
    if (!expandedScreenshot) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault()
        const currentIndex = screenshots.findIndex((s) => s.token === expandedScreenshot.token)
        if (currentIndex === -1) return

        if (e.key === "ArrowLeft") {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : screenshots.length - 1
          setExpandedScreenshot(screenshots[prevIndex])
        } else {
          const nextIndex = currentIndex < screenshots.length - 1 ? currentIndex + 1 : 0
          setExpandedScreenshot(screenshots[nextIndex])
        }
      } else if (e.key === "Escape") {
        setExpandedScreenshot(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [expandedScreenshot, screenshots])

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
      setExpandedScreenshot(null)
    }
    onOpenChange(newOpen)
  }

  const sendEmail = () => {
    if (!draft) return
    const mailtoLink = `mailto:?subject=${encodeURIComponent(currentSubject)}&body=${encodeURIComponent(currentBody)}`
    window.location.href = mailtoLink
  }

  const downloadScreenshotsAsZip = async () => {
    if (screenshots.length === 0) return

    const zip = new JSZip()

    // Add each screenshot to the zip
    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i]
      const base64Data = screenshot.dataUrl.replace(/^data:image\/png;base64,/, "")
      zip.file(`screenshot-${i + 1}-${screenshot.token.substring(0, 8)}.png`, base64Data, {
        base64: true,
      })
    }

    // Generate the zip file
    const blob = await zip.generateAsync({ type: "blob" })

    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `screenshots-${new Date().toISOString().split("T")[0]}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm text-muted-foreground">
                  Screenshots ({screenshots.length} of {violations.length})
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadScreenshotsAsZip}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {screenshots.map((screenshot) => (
                  <div
                    key={screenshot.token}
                    className="border border-border rounded p-2 cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => setExpandedScreenshot(screenshot)}
                  >
                    <img
                      src={screenshot.dataUrl}
                      alt={`Screenshot for ${screenshot.token}`}
                      className="w-full h-auto rounded"
                    />
                    <p className="text-xs text-muted-foreground mt-1 truncate">{screenshot.token}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingScreenshots && (
            <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading screenshots...</span>
            </div>
          )}

          {!loadingScreenshots && screenshots.length < violations.length && violations.length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-3 mb-2">
                  <Image className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-800 font-medium">Products without screenshots:</p>
                    <div className="mt-2 space-y-1">
                      {violations
                        .filter((v) => !screenshots.find((s) => s.token === v.immersive_product_page_token))
                        .map((v) => (
                          <p key={`missing-${v.id}`} className="text-xs text-yellow-700">
                            • {v.name || v.umap_cleaned_name}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

        {/* Expanded Screenshot Modal */}
        {expandedScreenshot && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setExpandedScreenshot(null)}
          >
            <div className="relative max-w-5xl w-full max-h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button
                onClick={() => setExpandedScreenshot(null)}
                className="absolute -top-12 right-0 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Navigation arrows */}
              {screenshots.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const currentIndex = screenshots.findIndex((s) => s.token === expandedScreenshot.token)
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : screenshots.length - 1
                      setExpandedScreenshot(screenshots[prevIndex])
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => {
                      const currentIndex = screenshots.findIndex((s) => s.token === expandedScreenshot.token)
                      const nextIndex = currentIndex < screenshots.length - 1 ? currentIndex + 1 : 0
                      setExpandedScreenshot(screenshots[nextIndex])
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                <img
                  src={expandedScreenshot.dataUrl}
                  alt="Expanded screenshot"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm flex items-center justify-between">
                <p className="text-sm text-white/90 font-mono truncate flex-1">
                  {expandedScreenshot.token}
                </p>
                {screenshots.length > 1 && (
                  <p className="text-sm text-white/70 ml-4">
                    {screenshots.findIndex((s) => s.token === expandedScreenshot.token) + 1} / {screenshots.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
