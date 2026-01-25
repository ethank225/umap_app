"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Violation } from "@/types/violation"

interface FiltersState {
  search: string
  site: string
  gender: string
  violationsOnly: boolean
}

interface ViolationsFiltersProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
  violations: Violation[]
}

export function ViolationsFilters({ filters, onFiltersChange, violations }: ViolationsFiltersProps) {
  // Extract unique sites and genders from violations data
  const sites = useMemo(() => {
    return Array.from(new Set(violations.map(v => v.site).filter(Boolean))).sort()
  }, [violations])

  const genders = useMemo(() => {
    return Array.from(new Set(violations.map(v => v.gender).filter(Boolean))).sort()
  }, [violations])

  const updateFilter = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
      search: "",
      site: "all",
      gender: "all",
      violationsOnly: true,
    })
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.site !== "all" ||
    filters.gender !== "all" ||
    !filters.violationsOnly

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="search" className="text-xs text-muted-foreground mb-1.5 block">
            Search Product
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by product name..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
        </div>

        {/* Site Filter */}
        <div className="w-[180px] min-w-[180px] shrink-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block">Site</Label>
          <Select value={filters.site} onValueChange={(v) => updateFilter("site", v)}>
            <SelectTrigger className="bg-secondary border-border w-full">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map((site) => (
                <SelectItem key={site} value={site}>
                  {site}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gender Filter */}
        <div className="w-[140px] min-w-[140px] shrink-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block">Gender</Label>
          <Select value={filters.gender} onValueChange={(v) => updateFilter("gender", v)}>
            <SelectTrigger className="bg-secondary border-border w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {genders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Violations Only Toggle */}
        <div className="shrink-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block">View</Label>
          <div className="flex gap-2">
            <Badge
              variant={filters.violationsOnly ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 h-10 flex items-center"
              onClick={() => updateFilter("violationsOnly", true)}
            >
              Violations Only
            </Badge>
            <Badge
              variant={!filters.violationsOnly ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 h-10 flex items-center"
              onClick={() => updateFilter("violationsOnly", false)}
            >
              All Listings
            </Badge>
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground mb-0.5"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
