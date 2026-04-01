'use client'

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="py-4 px-6 md:px-24">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-[#B7AEA9]">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] hover:text-[#2A2522] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#2A2522]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
