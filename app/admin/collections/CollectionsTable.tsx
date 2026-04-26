'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Pencil, Eye, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Collection {
  id: string
  slug: string
  title: string
  designer_name: string | null
  season: string | null
  year: number | null
  cover_image: string | null
}

interface CollectionsTableProps {
  initialCollections: Collection[]
  lookCounts: Record<string, number>
}

export function CollectionsTable({ initialCollections, lookCounts }: CollectionsTableProps) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)
  const [filter, setFilter] = useState<'all' | 'FW' | 'SS'>('all')

  const filteredCollections = collections.filter(c => 
    filter === 'all' ? true : c.season === filter
  )

  async function deleteCollection(id: string) {
    if (!confirm('Delete this collection? All looks will also be deleted.')) return
    const supabase = createClient()
    await supabase.from('collections').delete().eq('id', id)
    setCollections(collections.filter(c => c.id !== id))
  }

  return (
    <>
      <div className="flex gap-4 mb-6">
        {(['all', 'FW', 'SS'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 font-sans text-[11px] tracking-[2px] uppercase border transition-colors ${
              s === 'all' 
                ? 'bg-[#111111] text-white border-[#111111]' 
                : 'border-[rgba(0,0,0,0.15)] text-[#9B9590] hover:border-[#111111]'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.1)] bg-[#F5F2ED]">
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-16">Cover</th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590]">Title</th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-40">Designer</th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-28">Season</th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-20 text-center">Looks</th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollections.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#9B9590] font-sans text-sm">
                  No collections found
                </td>
              </tr>
            ) : (
              filteredCollections.map((col) => (
                <tr key={col.id} className="border-b border-[rgba(0,0,0,0.06)] hover:bg-[#FAFAF9]">
                  <td className="py-4 px-5">
                    <div className="relative w-12 h-16 overflow-hidden bg-[#EAEAEA]">
                      {col.cover_image ? (
                        <Image src={col.cover_image} alt={col.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 font-inter text-[13px] text-[#111111] font-medium">{col.title}</td>
                  <td className="py-4 px-5 font-inter text-[13px] text-[#555555]">{col.designer_name || '-'}</td>
                  <td className="py-4 px-5 font-inter text-[13px] text-[#555555] uppercase">
                    {col.season && col.year ? `${col.season} ${col.year}` : '-'}
                  </td>
                  <td className="py-4 px-5 font-serif text-xl text-[#111111] text-center">
                    {lookCounts[col.id] || 0}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/collections/${col.id}/edit`}
                        className="text-[#9B9590] hover:text-[#111111] transition-colors p-1"
                        title="Edit collection"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <Link href={`/archive/${col.slug}`} target="_blank" className="text-[#9B9590] hover:text-[#111111] transition-colors p-1">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => deleteCollection(col.id)} className="text-[#9B9590] hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
