# Anoce System Diagrams (A42-Style Structure)

This pack mirrors the same diagram style progression found in `A42.pdf`:
1. Use Case Diagram
2. Analysis Class Diagram
3. Sequence Diagrams
4. Activity Diagram
5. System Architecture Diagram
6. Design Class Diagram (Boundary-Control-Entity)
7. ERD Diagram
8. UI Screen Flow Diagram

## 1) Use Case Diagram
```mermaid
usecaseDiagram
actor Visitor as V
actor User as U
actor Admin as A

rectangle "Anoce Web System" {
  (Browse Archive) as UC1
  (Browse Editorial) as UC2
  (Browse Designers) as UC3
  (Open Global Search) as UC4
  (View Item Details) as UC5

  (Sign Up / Sign In) as UC6
  (Manage Profile) as UC7
  (Save Bookmark) as UC8
  (Review Saved Content) as UC9

  (Admin Login) as UC10
  (Manage Articles) as UC11
  (Manage Collections) as UC12
  (Manage Designers) as UC13
  (Manage Users & Roles) as UC14
  (Upload/Manage Assets) as UC15
}

V --> UC1
V --> UC2
V --> UC3
V --> UC4
V --> UC5
V --> UC6

U --> UC1
U --> UC2
U --> UC3
U --> UC4
U --> UC5
U --> UC7
U --> UC8
U --> UC9

A --> UC10
A --> UC11
A --> UC12
A --> UC13
A --> UC14
A --> UC15

UC8 ..> UC6 : <<include>>
UC7 ..> UC6 : <<include>>
UC11 ..> UC10 : <<include>>
UC12 ..> UC10 : <<include>>
UC13 ..> UC10 : <<include>>
UC14 ..> UC10 : <<include>>
UC15 ..> UC10 : <<include>>
```

## 2) Analysis Class Diagram
```mermaid
classDiagram
class Profile {
  +uuid id
  +string name
  +string role
  +json notifications
  +string avatar_url
}

class Article {
  +uuid id
  +string slug
  +string title
  +string category
  +string status
  +string author_name
  +datetime published_at
}

class Designer {
  +uuid id
  +string slug
  +string name
  +string tier
}

class Collection {
  +uuid id
  +string slug
  +string title
  +string season
  +int year
  +string designer_slug
}

class Look {
  +uuid id
  +uuid collection_id
  +int number
  +string image
  +string[] materials
}

class Bookmark {
  +uuid id
  +uuid user_id
  +string content_id
  +string content_type
}

class AuthService {
  +signIn(email, password)
  +signUp(email, password, name)
  +signOut()
  +getUser()
}

class SearchEngine {
  +buildSearchIndex()
  +rankResults(query, season)
  +groupRankedResults(items)
}

class SearchOverlayUI {
  +open()
  +close()
  +renderResults()
}

class AdminContentService {
  +createArticle()
  +updateArticle()
  +deleteArticle()
  +createCollection()
}

Profile "1" --> "*" Bookmark
Collection "1" --> "*" Look
Designer "1" --> "*" Collection
AuthService ..> Profile
SearchEngine ..> Article
SearchEngine ..> Collection
SearchEngine ..> Designer
SearchOverlayUI ..> SearchEngine
AdminContentService ..> Article
AdminContentService ..> Collection
```

## 3) Sequence Diagram - Global Search
```mermaid
sequenceDiagram
actor User
participant Navbar as StickyNavbar
participant Overlay as SearchOverlay
participant Hook as useGlobalSearch
participant Engine as searchEngine
participant Index as SEARCH_INDEX
participant Router

User->>Navbar: Click Search (or /, Cmd/Ctrl+K)
Navbar->>Overlay: isOpen = true
Overlay->>Hook: setQuery(input)
Hook->>Hook: debounce 300ms
Hook->>Engine: rankResults(query, seasonFilter)
Engine->>Index: score + filter + sort
Index-->>Engine: ranked items
Engine-->>Hook: grouped results
Hook-->>Overlay: render live cards
User->>Overlay: Click result card
Overlay->>Router: navigate(href)
Overlay-->>Navbar: onClose()
```

## 4) Sequence Diagram - Login + Role Gate
```mermaid
sequenceDiagram
actor User
participant LoginUI as Login Page
participant SupaAuth as Supabase Auth
participant Profiles as profiles table
participant MW as middleware/admin layout
participant AdminUI as Admin Dashboard

User->>LoginUI: Submit email/password
LoginUI->>SupaAuth: signInWithPassword()
SupaAuth-->>LoginUI: session user
LoginUI->>Profiles: fetch role by user.id
Profiles-->>LoginUI: role

alt role = viewer and /admin/login
  LoginUI->>SupaAuth: signOut()
  LoginUI-->>User: show "no permission"
else role = admin/editor
  LoginUI->>MW: request /admin/*
  MW->>SupaAuth: getUser()
  MW->>Profiles: role check
  MW-->>AdminUI: allow
end
```

## 5) Sequence Diagram - Admin Article Publish
```mermaid
sequenceDiagram
actor Admin
participant Editor as NewArticlePage
participant Storage as Supabase Storage(media)
participant Articles as articles table
participant CMS as ArticlesTable

Admin->>Editor: Enter title/body/tags
Admin->>Editor: Upload cover image
Editor->>Storage: upload(file)
Storage-->>Editor: publicUrl (or fallback image)
Admin->>Editor: Click Publish
Editor->>Articles: insert(articleData status=published)
Articles-->>Editor: success + article id
Editor->>CMS: redirect /admin/articles
CMS-->>Admin: row appears with Published badge
```

## 6) Activity Diagram - End-to-End User Flow
```mermaid
flowchart TD
  A([Start]) --> B[Open site]
  B --> C{Needs search?}
  C -- Yes --> D[Open Global Search]
  D --> E[Type query]
  E --> F[See grouped live results]
  F --> G[Open result page]
  C -- No --> H[Browse Archive/Editorial/Designers]
  H --> G
  G --> I{Logged in?}
  I -- No --> J[Login/Signup]
  J --> K[Authenticated Session]
  I -- Yes --> K
  K --> L[Bookmark article/look/designer]
  L --> M[Open Profile]
  M --> N[Review saved items + settings]
  N --> O([End])
```

## 7) System Architecture Diagram
```mermaid
flowchart LR
  subgraph Client[Browser Client]
    UI[Next.js App Router UI\nStickyNavbar, SearchOverlay, Pages]
  end

  subgraph NextRuntime[Next.js Runtime]
    MW[middleware.ts\nadmin route checks]
    ServerComp[Server Components\nadmin pages]
    ClientComp[Client Components\nsearch/profile/editor]
    APIFlow[Supabase SDK calls]
  end

  subgraph Supabase[Supabase Platform]
    Auth[(Auth)]
    DB[(Postgres Tables)]
    Storage[(Storage Buckets: media/covers/videos)]
    RLS[RLS Policies]
  end

  UI --> MW
  UI --> ServerComp
  UI --> ClientComp
  ServerComp --> APIFlow
  ClientComp --> APIFlow
  APIFlow --> Auth
  APIFlow --> DB
  APIFlow --> Storage
  DB --- RLS
```

## 8) Design Class Diagram (Boundary-Control-Entity)
```mermaid
classDiagram
class RoleType {
  <<enumeration>>
  admin
  editor
  viewer
}

class StickyNavbarUI {
  <<boundary>>
}
class SearchOverlayUI {
  <<boundary>>
}
class LoginUI {
  <<boundary>>
}
class ProfileUI {
  <<boundary>>
}
class AdminArticlesUI {
  <<boundary>>
}
class AdminUsersUI {
  <<boundary>>
}

class AuthController {
  <<control>>
  +handleLogin()
  +handleSignup()
  +handleOAuth()
}
class SearchController {
  <<control>>
  +executeSearch()
  +applySeasonFilter()
}
class BookmarkController {
  <<control>>
  +toggleBookmark()
}
class AdminContentController {
  <<control>>
  +createUpdateDelete()
}

class Profile {
  <<entity>>
}
class Article {
  <<entity>>
}
class Collection {
  <<entity>>
}
class Designer {
  <<entity>>
}
class Look {
  <<entity>>
}
class Bookmark {
  <<entity>>
}

AuthController --> Profile
SearchController --> Article
SearchController --> Collection
SearchController --> Designer
BookmarkController --> Bookmark
AdminContentController --> Article
AdminContentController --> Collection
AdminContentController --> Designer
Collection --> Look
Profile --> Bookmark
Profile --> RoleType

StickyNavbarUI --> SearchOverlayUI
SearchOverlayUI --> SearchController
LoginUI --> AuthController
ProfileUI --> BookmarkController
AdminArticlesUI --> AdminContentController
AdminUsersUI --> AuthController
```

## 9) ERD Diagram (Current Database Model)
```mermaid
erDiagram
  profiles {
    uuid id PK
    text name
    text avatar_url
    text role
    json notifications
    timestamptz created_at
  }

  designers {
    uuid id PK
    text slug UK
    text name
    text tier
    text bio
    text short_bio
    text profile_image
    text cover_image
    int founded
    timestamptz created_at
  }

  collections {
    uuid id PK
    text slug UK
    uuid designer_id FK
    text designer_name
    text designer_slug
    text title
    text season
    int year
    text description
    text cover_image
    timestamptz created_at
  }

  looks {
    uuid id PK
    uuid collection_id FK
    int number
    text image
    text description
    text[] materials
    text[] tags
    timestamptz created_at
  }

  articles {
    uuid id PK
    text slug UK
    uuid author_id FK
    text author_name
    text title
    text subtitle
    text category
    text body
    text status
    text designer_slug
    text[] tags
    int read_time
    timestamptz published_at
    timestamptz created_at
    timestamptz updated_at
  }

  bookmarks {
    uuid id PK
    uuid user_id FK
    text content_id
    text content_type
    timestamptz created_at
  }

  profiles ||--o{ bookmarks : has
  designers ||--o{ collections : owns
  collections ||--o{ looks : contains
  profiles ||--o{ articles : authors
```

## 10) UI Screen Flow (Prototype-Level)
```mermaid
flowchart LR
  H[Home]
  AR[Archive List]
  AD[Archive Detail]
  EDL[Editorial List]
  EDD[Editorial Detail]
  DS[Designers List]
  DD[Designer Detail]
  EX[Explore]
  PR[Profile]
  LG[Login]
  AS[Global Search Overlay]

  ADM[Admin Dashboard]
  AAR[Admin Articles]
  AAN[New Article]
  AAE[Edit Article]
  ACL[Admin Collections]
  ACN[New Collection]
  ADS[Admin Designers]
  AUS[Admin Users]
  AAS[Admin Assets]
  ACA[Admin Calendar]

  H --> AR
  H --> EDL
  H --> DS
  H --> EX
  H --> AS

  AS --> AD
  AS --> EDD
  AS --> DD

  AR --> AD
  EDL --> EDD
  DS --> DD

  H --> LG
  LG --> PR

  LG --> ADM
  ADM --> AAR
  AAR --> AAN
  AAR --> AAE
  ADM --> ACL
  ACL --> ACN
  ADM --> ADS
  ADM --> AUS
  ADM --> AAS
  ADM --> ACA
```
