import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CollectionsTable } from './CollectionsTable'

export default async function CollectionsPage() {
  const supabase = await createClient()

  const [{ data: collections }, { data: looks }] = await Promise.all([
    supabase
      .from('collections')
      .select('id, slug, title, designer_name, season, year, cover_image')
      .order('year', { ascending: false }),
    supabase.from('looks').select('collection_id'),
  ])

  const countMap = (looks || []).reduce<Record<string, number>>((acc, l) => {
    if (l.collection_id) {
      acc[l.collection_id] = (acc[l.collection_id] || 0) + 1
    }
    return acc
  }, {})

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8 w-full">
        <h1 className="font-serif text-2xl text-[#111111]">Collections</h1>
        <Link href="/admin/collections/new" className="bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors">
          Add Collection
        </Link>
      </header>

      <CollectionsTable 
        initialCollections={collections || []} 
        lookCounts={countMap} 
      />
    </div>
  )
}
