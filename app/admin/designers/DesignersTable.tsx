'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Pencil, Eye, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Designer {
  id: string
  slug: string
  name: string
  tier: string | null
  founded: number | null
  profile_image: string | null
  active_seasons: number | null
}

interface DesignersTableProps {
  initialDesigners: Designer[]
}

const tierStyles: Record<string, string> = {
  'high-end': 'bg-[#111111] text-white',
  'contemporary': 'bg-[#F5F2ED] text-[#111111] border border-[rgba(0,0,0,0.15)]',
  'emerging': 'border border-[#B7AEA9] text-[#B7AEA9]',
}

export function DesignersTable({ initialDesigners }: DesignersTableProps) {
  const [designers, setDesigners] = useState<Designer[]>(initialDesigners)

  async function deleteDesigner(id: string) {
    if (!confirm('Delete this designer?')) return
    const supabase = createClient()
    await supabase.from('designers').delete().eq('id', id)
    setDesigners(designers.filter(d => d.id !== id))
  }

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[rgba(0,0,0,0.1)] bg-[#F5F2ED]">
            <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-12">Photo</th>
            <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590]">Name</th>
            <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-36">Tier</th>
            <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-24">Founded</th>
            <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-24 text-center">Seasons</th>
            <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-24">Actions</th>
          </tr>
        </thead>
        <tbody>
          {designers.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-[#9B9590] font-sans text-sm">
                No designers found
              </td>
            </tr>
          ) : (
            designers.map((d) => (
              <tr key={d.id} className="border-b border-[rgba(0,0,0,0.06)] hover:bg-[#FAFAF9]">
                <td className="py-4 px-5">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#EAEAEA]">
                    {d.profile_image ? (
                      <Image src={d.profile_image} alt={d.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                </td>
                <td className="py-4 px-5 font-inter text-[13px] text-[#111111] font-medium">{d.name}</td>
                <td className="py-4 px-5">
                  <span className={`font-sans text-[10px] tracking-[2px] uppercase px-2 py-1 ${tierStyles[d.tier || ''] || tierStyles['emerging']}`}>
                    {d.tier || 'emerging'}
                  </span>
                </td>
                <td className="py-4 px-5 font-inter text-[13px] text-[#555555]">{d.founded || '-'}</td>
                <td className="py-4 px-5 font-inter text-[13px] text-[#555555] text-center">{d.active_seasons || 0}</td>
                <td className="py-4 px-5">
                  <div className="flex gap-2">
                    <button className="text-[#9B9590] hover:text-[#111111] transition-colors p-1">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <Link href={`/designers/${d.slug}`} target="_blank" className="text-[#9B9590] hover:text-[#111111] transition-colors p-1">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => deleteDesigner(d.id)} className="text-[#9B9590] hover:text-red-500 transition-colors p-1">
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
  )
}
