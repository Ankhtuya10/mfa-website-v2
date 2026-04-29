import { createAdminClient } from './lib/supabase/admin'

async function testRag() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('anoce_rag_documents').select('id, title, type').limit(5)
  console.log('Error:', error)
  console.log('Documents:', data?.length ?? 0)
  console.log('Sample:', JSON.stringify(data, null, 2))
}

testRag()