-- Indexes only. The anoce_rag_documents table is created manually in Supabase.

create extension if not exists pg_trgm;

create index if not exists anoce_rag_documents_title_trgm_idx
  on public.anoce_rag_documents using gin (title gin_trgm_ops);

create index if not exists anoce_rag_documents_content_trgm_idx
  on public.anoce_rag_documents using gin (content gin_trgm_ops);

create index if not exists anoce_rag_documents_brand_slug_trgm_idx
  on public.anoce_rag_documents using gin (brand_slug gin_trgm_ops);

create index if not exists anoce_rag_documents_category_trgm_idx
  on public.anoce_rag_documents using gin (category gin_trgm_ops);

create index if not exists anoce_rag_documents_tags_gin_idx
  on public.anoce_rag_documents using gin (tags);
