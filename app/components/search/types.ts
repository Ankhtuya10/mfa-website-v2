export type SearchCategory = 'articles' | 'collections' | 'designers' | 'brands'
export type SeasonFilter = 'all' | 'current' | 'archive'

export type SearchResultItem = {
  id: string
  slug: string
  title: string
  subtitle: string
  image: string
  href: string
  category: SearchCategory
  meta: string
  searchText: string
  tags: string[]
  seasonLabel?: string
}

export type SearchGroups = Record<SearchCategory, SearchResultItem[]>
