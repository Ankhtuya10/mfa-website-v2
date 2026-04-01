'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Filter {
  key: string
  label: string
  options: string[]
}

interface FilterBarProps {
  filters: Filter[]
  activeFilters: Record<string, string>
  onChange: (key: string, value: string) => void
  resultCount?: number
}

export function FilterBar({ filters, activeFilters, onChange, resultCount }: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const hasActiveFilters = Object.values(activeFilters).some(v => v && v !== 'All')

  return (
    <div className="sticky top-20 z-40 bg-[#F5F2ED]/95 backdrop-blur border-b border-[rgba(0,0,0,0.08)] py-5 px-6 md:px-24">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          {filters.map((filter) => (
            <div key={filter.key} className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === filter.key ? null : filter.key)}
                className={`font-sans text-[11px] tracking-[2px] uppercase flex items-center gap-2 transition-colors ${
                  activeFilters[filter.key] && activeFilters[filter.key] !== 'All'
                    ? 'text-[#2A2522]'
                    : 'text-[#B7AEA9] hover:text-[#2A2522]'
                }`}
              >
                {filter.label}
                <span className="text-[10px]">{openDropdown === filter.key ? '↑' : '↓'}</span>
              </button>

              <AnimatePresence>
                {openDropdown === filter.key && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-white border border-[rgba(0,0,0,0.08)] py-2 min-w-[150px] shadow-lg"
                  >
                    {filter.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          onChange(filter.key, option)
                          setOpenDropdown(null)
                        }}
                        className={`w-full text-left px-4 py-2 font-sans text-[11px] tracking-[2px] uppercase transition-colors ${
                          activeFilters[filter.key] === option
                            ? 'bg-[#F5F2ED] text-[#2A2522]'
                            : 'text-[#7A7470] hover:bg-[#F5F2ED] hover:text-[#2A2522]'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {resultCount !== undefined && (
            <span className="font-sans text-[11px] tracking-[2px] uppercase text-[#9B9590]">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </span>
          )}
          {hasActiveFilters && (
            <button
              onClick={() => filters.forEach(f => onChange(f.key, 'All'))}
              className="font-sans text-[11px] tracking-[2px] uppercase text-[#B7AEA9] hover:text-[#2A2522] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-4 max-w-7xl mx-auto">
          {filters.map((filter) => (
            activeFilters[filter.key] && activeFilters[filter.key] !== 'All' && (
              <span
                key={filter.key}
                className="inline-flex items-center gap-2 px-3 py-1 bg-[#2A2522] text-white font-sans text-[10px] tracking-[2px] uppercase"
              >
                {activeFilters[filter.key]}
                <button
                  onClick={() => onChange(filter.key, 'All')}
                  className="hover:text-[#B7AEA9] transition-colors"
                >
                  ×
                </button>
              </span>
            )
          ))}
        </div>
      )}
    </div>
  )
}
