'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Upload, X, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Asset {
  name: string
  url: string
  size?: number
  created_at?: string | null
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useState(() => {
    async function fetchAssets() {
      try {
        const { data, error } = await supabase.storage.from('covers').list('', { limit: 50 })
        
        if (error || !data || data.length === 0) {
          setAssets([])
        } else {
          const assetsWithUrls = data.map(file => ({
            name: file.name,
            url: supabase.storage.from('covers').getPublicUrl(file.name).data.publicUrl,
            size: file.metadata?.size,
            created_at: file.created_at,
          }))
          setAssets(assetsWithUrls)
        }
      } catch (err) {
        console.error('Error fetching assets:', err)
        setAssets([])
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
  })

  const copyUrl = () => {
    if (selectedAsset) {
      navigator.clipboard.writeText(selectedAsset.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const filename = `${Date.now()}-${file.name}`
      await supabase.storage.from('covers').upload(filename, file)
      
      const newAsset: Asset = {
        name: filename,
        url: supabase.storage.from('covers').getPublicUrl(filename).data.publicUrl,
        size: file.size,
        created_at: new Date().toISOString(),
      }
      setAssets([newAsset, ...assets])
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <header className="flex justify-between items-center mb-8 w-full">
          <h1 className="font-serif text-2xl text-[#111111]">Asset Library</h1>
        </header>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-[#EAEAEA] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8 w-full">
        <h1 className="font-serif text-2xl text-[#111111]">Asset Library</h1>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </header>

      <div className="flex gap-6">
        <div className="flex-1">
          {assets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-[#EAEAEA] rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-[#9B9590]" />
              </div>
              <h3 className="font-serif text-xl text-[#111111] mb-2">No assets uploaded yet</h3>
              <p className="font-sans text-[#9B9590] mb-6">Upload images to build your media library</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors"
              >
                Upload Assets
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <motion.div
                  key={asset.name}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedAsset(asset)}
                  className="relative aspect-square cursor-pointer group overflow-hidden bg-[#EAEAEA]"
                >
                  <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-3 opacity-0 group-hover:opacity-100">
                    <p className="font-sans text-[10px] text-white truncate">{asset.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedAsset && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 bg-white border border-[rgba(0,0,0,0.08)] overflow-y-auto relative"
            >
              <div className="p-6">
                <div className="relative aspect-square mb-6">
                  <Image src={selectedAsset.url} alt={selectedAsset.name} fill className="object-cover" />
                </div>
                
                <h3 className="font-inter text-[13px] text-[#111111] mb-4 truncate">{selectedAsset.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590]">Size</span>
                    <span className="font-inter text-[12px] text-[#555555]">
                      {selectedAsset.size ? `${Math.round(selectedAsset.size / 1024)}KB` : '-'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={copyUrl}
                  className="w-full border border-[rgba(0,0,0,0.15)] py-2 font-sans text-[11px] tracking-[2px] uppercase text-[#111111] hover:bg-[#F5F2ED] transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                className="absolute top-4 right-4 p-1 bg-white hover:bg-[#F5F2ED] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
