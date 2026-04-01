export interface Designer {
  id: string
  slug: string
  name: string
  brand: string
  tier: 'high-end' | 'contemporary' | 'emerging'
  bio: string
  shortBio: string
  profileImage: string
  coverImage: string
  activeSeasons: number
  nationality: string
  founded: number
  socialLinks: { instagram?: string; website?: string }
}

export interface Look {
  id: string
  number: number
  image: string
  description: string
  materials: string[]
  tags: string[]
}

export interface Collection {
  id: string
  slug: string
  title: string
  designerId: string
  designerName: string
  designerSlug: string
  season: 'SS' | 'FW'
  year: number
  description: string
  coverImage: string
  looks: Look[]
}

export interface Article {
  id: string
  slug: string
  title: string
  subtitle: string
  category: 'features' | 'interviews' | 'news' | 'trends'
  author: string
  publishedAt: string
  coverImage: string
  designerSlug?: string
  tags: string[]
  readTime: number
  body: string
  status: 'draft' | 'review' | 'published'
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  avatar: string
  joinedAt: string
  savedArticles: string[]
  savedLooks: string[]
  followedBrands: string[]
}
