'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useState } from 'react'

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null
  fallbackSrc: string
}

export function SafeImage({ src, fallbackSrc, onError, ...props }: SafeImageProps) {
  const resolvedSrc = typeof src === 'string' && src.trim() ? src : fallbackSrc
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc)

  useEffect(() => {
    setCurrentSrc(resolvedSrc)
  }, [resolvedSrc])

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc)
        onError?.(event)
      }}
    />
  )
}
