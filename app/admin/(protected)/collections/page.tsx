import Link from 'next/link'
import { CollectionsTable } from './CollectionsTable'
import { createContentRepository } from '@/lib/couchdb/repository'

export const dynamic = 'force-dynamic'

export default async function CollectionsPage() {
  let collections: any[] = []

  try {
    collections = await createContentRepository().getCollections()
  } catch {
    collections = []
  }

  const countMap = collections.reduce<Record<string, number>>((acc, collection) => {
    acc[collection.id] = Array.isArray(collection.looks) ? collection.looks.length : 0
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
