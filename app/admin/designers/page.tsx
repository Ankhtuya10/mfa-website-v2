import { createClient } from '@/lib/supabase/server'
import { DesignersTable } from './DesignersTable'

export default async function DesignersAdminPage() {
  const supabase = await createClient()

  const { data: designers } = await supabase
    .from('designers')
    .select('id, slug, name, tier, founded, profile_image, active_seasons')
    .order('name')

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8 w-full">
        <h1 className="font-serif text-2xl text-[#111111]">Designers</h1>
        <button className="bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors">
          Add Designer
        </button>
      </header>

      <DesignersTable initialDesigners={designers || []} />
    </div>
  )
}
