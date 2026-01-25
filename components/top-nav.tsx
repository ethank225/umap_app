"use client"

import { HelpCircle } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function TopNav() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      <header className="border-b border-border bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
        <div className="flex min-h-[60px] sm:h-20 items-center justify-between px-3 sm:px-8 py-3 gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 sm:gap-4">

            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold text-white">UMAP Monitor</span>
              <span className="text-xs sm:text-sm text-slate-300">Price Compliance Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors text-white font-medium text-xs sm:text-sm shadow-lg hover:shadow-orange-500/50"
            >
              <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Help</span>
            </button>

            <div className="text-xs sm:text-sm text-slate-300 flex flex-col items-end">
              <span className="hidden sm:inline">Created by Ethan Kawahara</span>
              <a
                href="mailto:ethan.kawahara@brooksrunning.com"
                className="text-orange-300 hover:text-orange-200 transition-colors"
              >
                <span className="hidden sm:inline">Send feedback</span>
                <span className="sm:hidden">Feedback</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-orange-500" />
              How to Use UMAP Monitor
            </DialogTitle>
            <DialogDescription>Guide to using the UMAP price compliance dashboard</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-foreground">
            <div>
              <h3 className="font-semibold text-base mb-2">📊 Dashboard Overview</h3>
              <p className="text-sm">View price compliance metrics and identify violations across all retailers.</p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">🔍 Filtering</h3>
              <p className="text-sm">Use the filters to narrow down by product name, retailer site, gender category, or show only violations.</p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">✓ Selecting Violations</h3>
              <p className="text-sm">Click the checkboxes to select violations, then use the email composer to draft communications.</p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">💰 Price Difference</h3>
              <p className="text-sm"><span className="text-green-600 font-medium">Green</span> = Price compliant (≥UMAP), <span className="text-red-600 font-medium">Red</span> = Price violation (&lt;UMAP)</p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">📧 Email Draft</h3>
              <p className="text-sm">Select violations and click "Draft Email" to generate a message template for retailer outreach.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
