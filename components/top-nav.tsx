"use client"

import { HelpCircle } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function TopNav() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      <header className="border-b border-border bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
        <div className="flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-4">

            <div className="flex flex-col">
              <span className="text-base font-bold text-white">UMAP Monitor</span>
              <span className="text-sm text-slate-300">Price Compliance Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors text-white font-medium text-sm shadow-lg hover:shadow-orange-500/50"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </button>

            <div className="text-sm text-slate-300 flex flex-col items-end">
              <span>Created by Ethan Kawahara</span>
              <a
                href="mailto:ethan.kawahara@brooksrunning.com"
                className="text-orange-300 hover:text-orange-200 transition-colors"
              >
                Send feedback
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
          </DialogHeader>
          <DialogDescription className="space-y-4 text-foreground">
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
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  )
}
