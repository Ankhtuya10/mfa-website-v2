/**
 * Seed real content using the images already uploaded to the asset library.
 * Run with:  npx tsx scripts/seed-content.ts
 */

import { createContentRepository } from "../lib/couchdb/repository";

// ─── Asset URLs (built from the uploaded files) ───────────────────────────────
const a = (id: string, name: string) =>
  `/api/content/assets/${encodeURIComponent(id)}/${encodeURIComponent(name)}`;

const img = {
  1:  a("asset:assets-1777504173739-7516687b57003367ae474b4071b66a6e-jpg",  "1777504173739-7516687b57003367ae474b4071b66a6e.jpg"),
  2:  a("asset:assets-1777505462459-6eabf912db0f56d82d447bdb2ca77b05-jpg",  "1777505462459-6eabf912db0f56d82d447bdb2ca77b05.jpg"),
  3:  a("asset:assets-1777505462462-7e01f974989563f521123becd6137378-jpg",  "1777505462462-7e01f974989563f521123becd6137378.jpg"),
  4:  a("asset:assets-1777505462464-00bce4b63fa65eb9013550e583953af9-jpg",  "1777505462464-00bce4b63fa65eb9013550e583953af9.jpg"),
  5:  a("asset:assets-1777505462492-1d7aab06f06a47989d500acd388a1fb5-jpg",  "1777505462492-1d7aab06f06a47989d500acd388a1fb5.jpg"),
  6:  a("asset:assets-1777505462594-6ff8c3adb80ec3cf9c44bf4897441cc0-jpg",  "1777505462594-6ff8c3adb80ec3cf9c44bf4897441cc0.jpg"),
  7:  a("asset:assets-1777505462595-7c760a2403b08602152623e7be29c9df-jpg",  "1777505462595-7c760a2403b08602152623e7be29c9df.jpg"),
  8:  a("asset:assets-1777505463039-1494e9bc9c0801565fcd822932c5ff40-jpg",  "1777505463039-1494e9bc9c0801565fcd822932c5ff40.jpg"),
  9:  a("asset:assets-1777505463047-9bc1bede70f2afb17c5d55a5642a167d-jpg",  "1777505463047-9bc1bede70f2afb17c5d55a5642a167d.jpg"),
  10: a("asset:assets-1777505463054-83efb2e2174a212f17e46344cbf8eb94-jpg",  "1777505463054-83efb2e2174a212f17e46344cbf8eb94.jpg"),
  11: a("asset:assets-1777505463056-923e06863332163a947eaf04716b1388-jpg",  "1777505463056-923e06863332163a947eaf04716b1388.jpg"),
  12: a("asset:assets-1777505463144-5684b654e9f07fda8b1d83609298ad46-jpg",  "1777505463144-5684b654e9f07fda8b1d83609298ad46.jpg"),
  13: a("asset:assets-1777505463195-9816efce4bab68577cd35a22fe49e1b4-jpg",  "1777505463195-9816efce4bab68577cd35a22fe49e1b4.jpg"),
  14: a("asset:assets-1777505463558-ad5ccce95c4e86edfff8af10a3295780-webp", "1777505463558-ad5ccce95c4e86edfff8af10a3295780.webp"),
  15: a("asset:assets-1777505463573-ba67a0daa6a279d8085098f9a0a1d4bb-jpg",  "1777505463573-ba67a0daa6a279d8085098f9a0a1d4bb.jpg"),
  16: a("asset:assets-1777505463587-7516687b57003367ae474b4071b66a6e-jpg",  "1777505463587-7516687b57003367ae474b4071b66a6e.jpg"),
  17: a("asset:assets-1777505463688-d903f0d506b9e5ee5d5a2bce6a69b0f3-jpg",  "1777505463688-d903f0d506b9e5ee5d5a2bce6a69b0f3.jpg"),
  18: a("asset:assets-1777505463691-d2b01cf2d7af4317997bf5cacc4c6629-webp", "1777505463691-d2b01cf2d7af4317997bf5cacc4c6629.webp"),
  19: a("asset:assets-1777505463718-f54d0b498b92510348b5ae7b7dc0a9c5-jpg",  "1777505463718-f54d0b498b92510348b5ae7b7dc0a9c5.jpg"),
  20: a("asset:assets-1777505464085-fe3b0fa9bd6c70a4dbb6325931c2253e-jpg",  "1777505464085-fe3b0fa9bd6c70a4dbb6325931c2253e.jpg"),
};

// ─── Designers ────────────────────────────────────────────────────────────────
const designers = [
  {
    slug: "gobi-cashmere",
    name: "Gobi Cashmere",
    brand: "Gobi",
    tier: "high-end",
    nationality: "Mongolian",
    founded: 1981,
    active_seasons: 12,
    short_bio: "Mongolia's most celebrated cashmere house, weaving the finest fibers of the Gobi Desert into timeless luxury.",
    bio: "Founded in 1981, Gobi Cashmere is the pinnacle of Mongolian textile heritage. Drawing from the vast Gobi Desert — home to the world's finest cashmere goats — the house has spent over four decades refining the art of transforming raw fiber into sculptural garments. Each collection is a meditation on restraint, warmth, and the quiet drama of natural materials. Gobi's ateliers combine ancestral knowledge with precision cutting, producing silhouettes that feel simultaneously ancient and sharply modern.",
    profile_image: img[1],
    cover_image: img[2],
    social_links: { instagram: "@gobicashmere", website: "https://gobicashmere.com" },
  },
  {
    slug: "goyol-studio",
    name: "Goyol Studio",
    brand: "Goyol",
    tier: "contemporary",
    nationality: "Mongolian",
    founded: 2014,
    active_seasons: 8,
    short_bio: "A Ulaanbaatar-based design studio pushing Mongolian textile traditions into the language of contemporary fashion.",
    bio: "Established in 2014 by designer Enkhjargal Gantulga, Goyol Studio emerged from the vibrant underground arts scene of Ulaanbaatar. The studio approaches each collection as an excavation — unearthing motifs from nomadic culture and recontextualizing them through experimental draping and unconventional material pairings. Goyol's work sits at the intersection of heritage and provocation, worn by a generation that refuses to choose between the two.",
    profile_image: img[3],
    cover_image: img[4],
    social_links: { instagram: "@goyolstudio" },
  },
  {
    slug: "nomin-d",
    name: "Nomin D",
    brand: "Nomin D",
    tier: "emerging",
    nationality: "Mongolian",
    founded: 2021,
    active_seasons: 3,
    short_bio: "An emerging voice reimagining the del through a feminist and futurist lens.",
    bio: "Nomin Davaadorj launched her eponymous label in 2021 after graduating from the National University of Arts in Ulaanbaatar. Her collections dismantle the traditional Mongolian del — reconstructing it with asymmetric closures, industrial hardware, and textiles sourced from local cooperatives. Nomin D has quickly become a symbol for the next generation of Mongolian designers: globally literate, deeply rooted, and uncompromisingly original.",
    profile_image: img[5],
    cover_image: img[6],
    social_links: { instagram: "@nomind.studio" },
  },
];

// ─── Collections ──────────────────────────────────────────────────────────────
const collections = [
  {
    slug: "gobi-fw2025-steppe-silence",
    title: "Steppe Silence",
    designer_slug: "gobi-cashmere",
    designer_name: "Gobi Cashmere",
    season: "FW",
    year: 2025,
    description: "Steppe Silence is a tribute to the vast, wordless landscape of the Mongolian winter. The palette draws from frost, shadow, and the pale gold of dried grass. Volume is architectural — coats that stand away from the body, capes that move like weather.",
    cover_image: img[7],
    looks: [
      { id: "gobi-fw25-look-1", number: 1, image: img[8],  description: "Oversized double-faced cashmere coat in ivory with dropped shoulders and a single interior seam.", materials: ["cashmere", "silk lining"], tags: ["outerwear", "ivory", "oversized"] },
      { id: "gobi-fw25-look-2", number: 2, image: img[9],  description: "Ribbed turtleneck sweater in charcoal, worn over wide-leg pressed trousers in the same tone.", materials: ["cashmere", "wool blend"], tags: ["knitwear", "charcoal", "tonal"] },
      { id: "gobi-fw25-look-3", number: 3, image: img[10], description: "Floor-length cape in camel with a deep center back pleat and raw-cut hem.", materials: ["pure cashmere"], tags: ["outerwear", "camel", "cape"] },
      { id: "gobi-fw25-look-4", number: 4, image: img[11], description: "Cocoon silhouette midi dress in off-white cashmere, belted loosely at the natural waist.", materials: ["cashmere"], tags: ["dress", "off-white", "cocoon"] },
    ],
  },
  {
    slug: "goyol-ss2025-nomadic-bloom",
    title: "Nomadic Bloom",
    designer_slug: "goyol-studio",
    designer_name: "Goyol Studio",
    season: "SS",
    year: 2025,
    description: "Nomadic Bloom follows the short, explosive spring of the Mongolian steppe — when wildflowers cover the grasslands for only a few weeks before summer arrives. The collection is light, layered, and quietly joyful.",
    cover_image: img[12],
    looks: [
      { id: "goyol-ss25-look-1", number: 1, image: img[13], description: "Silk organza top layered over a hand-dyed cotton slip, printed with abstracted flower motifs from Mongolian embroidery.", materials: ["silk organza", "cotton"], tags: ["top", "floral", "layered"] },
      { id: "goyol-ss25-look-2", number: 2, image: img[14], description: "Wide-leg linen trousers in dusty rose with a drawstring waist and embroidered cuff detail.", materials: ["linen", "cotton thread"], tags: ["trousers", "rose", "embroidery"] },
      { id: "goyol-ss25-look-3", number: 3, image: img[15], description: "Draped open-back dress in cream silk with a hand-knotted sash referencing Mongolian ceremonial belts.", materials: ["silk", "leather"], tags: ["dress", "cream", "draped"] },
    ],
  },
  {
    slug: "nomin-d-fw2024-winter-ritual",
    title: "Winter Ritual",
    designer_slug: "nomin-d",
    designer_name: "Nomin D",
    season: "FW",
    year: 2024,
    description: "Winter Ritual takes the Mongolian del as its starting point and dismantles it entirely. Hardware replaces traditional closures. Industrial felts meet antique silk liners. The ritual remains — only its form has changed.",
    cover_image: img[16],
    looks: [
      { id: "nomin-fw24-look-1", number: 1, image: img[17], description: "Reconstructed del coat in black boiled wool, fastened with oversized brass rings and a leather strap system.", materials: ["boiled wool", "brass hardware", "leather"], tags: ["outerwear", "black", "hardware", "del"] },
      { id: "nomin-fw24-look-2", number: 2, image: img[18], description: "Asymmetric mini dress combining industrial felt panels with an antique silk lining visible at the hem.", materials: ["industrial felt", "antique silk"], tags: ["dress", "asymmetric", "mixed-material"] },
      { id: "nomin-fw24-look-3", number: 3, image: img[19], description: "Deconstructed trousers in heavy cotton canvas with exposed seam allowances and a double-waistband closure.", materials: ["cotton canvas"], tags: ["trousers", "deconstructed", "canvas"] },
    ],
  },
  {
    slug: "gobi-ss2025-the-pale-season",
    title: "The Pale Season",
    designer_slug: "gobi-cashmere",
    designer_name: "Gobi Cashmere",
    season: "SS",
    year: 2025,
    description: "The Pale Season explores the liminal state between winter's end and the first warmth — garments thin enough to sense the sun but substantial enough to carry the memory of cold.",
    cover_image: img[20],
    looks: [
      { id: "gobi-ss25-look-1", number: 1, image: img[1], description: "Fine-gauge cashmere cardigan in pale sand, worn open over a matching camisole.", materials: ["fine cashmere"], tags: ["knitwear", "sand", "layering"] },
      { id: "gobi-ss25-look-2", number: 2, image: img[3], description: "Relaxed-fit wide-leg trousers in ivory cashmere-silk blend with a pressed centre crease.", materials: ["cashmere", "silk"], tags: ["trousers", "ivory", "relaxed"] },
    ],
  },
];

// ─── Articles ─────────────────────────────────────────────────────────────────
const articles = [
  {
    slug: "the-cashmere-code",
    title: "The Cashmere Code",
    subtitle: "How Mongolia's most ancient fiber became the world's most coveted luxury material — and what it costs.",
    category: "features",
    author_name: "Anoce Editorial",
    status: "published",
    published_at: "2025-03-15T09:00:00.000Z",
    read_time: 8,
    cover_image: img[19],
    cover_image_vertical: img[20],  // ← two images
    designer_slug: "gobi-cashmere",
    tags: ["cashmere", "luxury", "mongolia", "sustainability", "fiber"],
    body: `The goat does not know it is producing the world's most expensive fiber. It grazes the steppe as it always has — through winters that drop to minus forty, across grasslands that stretch beyond any visible horizon. The cashmere it sheds each spring is simply warmth made tangible.

What happens next is the story of how a nomadic material became a global obsession.

**The Source**

Mongolia produces roughly a third of the world's raw cashmere. The finest comes from the Gobi Desert region, where extreme temperature fluctuations force the Inner Mongolian goat to develop an exceptionally fine undercoat. A single goat yields only 150 to 200 grams of usable fiber per year — barely enough for a single sweater.

The hand-combing process happens each spring over just a few weeks. Herder families work with practiced efficiency, pulling the loose undercoat from each animal without cutting the coarser outer guard hair. It is labor-intensive, seasonal, and irreplaceable by machines.

**The Making**

At Gobi Cashmere's facility in Ulaanbaatar, the raw fiber undergoes a transformation that takes weeks. Sorting by hand. Dehairing to remove coarse fibers. Multiple washings. A drying process that requires precise temperature and humidity control. Only then does the fiber reach the spinners, whose machines hum twenty hours a day during peak season.

The finished yarn is measured in microns. Gobi's finest grade runs at 14 to 15 microns — finer than most brands claim, finer than most consumers can feel. It is a standard maintained not because the market demands it, but because the house knows the difference.

**The Cost**

A cashmere sweater from Gobi Cashmere carries a price that reflects this chain. Critics call it steep. The alternative — outsourced production, cheaper fiber, synthetic blends — is a path the house has declined to take. "Once you compromise the fiber," says Gobi's creative director, "you compromise everything that comes after it."`,
    credits: {
      photographer: "B. Enkhjargal",
      stylist: "T. Narantsetseg",
      location: "Gobi Desert, South Gobi Province",
      date: "March 2025",
    },
  },
  {
    slug: "in-conversation-with-goyol-studio",
    title: "In Conversation with Goyol Studio",
    subtitle: "Enkhjargal Gantulga on growing up between gers and galleries, and why Mongolian fashion has no obligation to be decorative.",
    category: "interviews",
    author_name: "Anoce Editorial",
    status: "published",
    published_at: "2025-02-20T10:00:00.000Z",
    read_time: 6,
    cover_image: img[12],
    cover_image_vertical: img[13],  // ← two images
    designer_slug: "goyol-studio",
    tags: ["interview", "goyol", "ulaanbaatar", "contemporary", "design"],
    body: `Enkhjargal Gantulga receives us in the Goyol Studio space in Ulaanbaatar's Zaisan district — a converted Soviet-era print workshop with exposed brick, long cutting tables, and fabric bolts arranged by color on industrial shelving. She moves through it with the ease of someone who has repainted the same walls many times.

**You've spoken about the studio as a space of excavation. What are you digging for?**

Honestly, I'm not always sure when I start. I know what I don't want: the surface-level Mongolia. The tourist version of the del, the decorative approximation of nomadic life. What I want is the thing underneath — the logic of a garment designed for a body in constant motion, the functional intelligence of layering systems developed over centuries. That is interesting to me. The ornament is not.

**Your SS25 collection, Nomadic Bloom, felt like a departure. There was color — real color.**

There was. I surprised myself. I had been working on the FW collections for a while and they were very internal, very severe. And then I went back to my mother's home in Khentii for a week and the spring had just arrived and the whole field was just — it was ridiculous, actually. The blooms last maybe three weeks and they are so insistent. I came back and I couldn't make anything dark for a few months.

**Is there pressure from the international market to be a certain kind of Mongolian designer?**

Of course. There is an expectation that we will present ourselves through heritage, through geography, through the exotic. And I am Mongolian — that is real, that matters to my work. But it should not be the packaging. I am a designer who happens to be from Mongolia. Not a Mongolian designer performing Mongolia for a foreign audience. That distinction is everything to me.`,
    credits: {
      photographer: "D. Oyunbileg",
      location: "Goyol Studio, Zaisan District, Ulaanbaatar",
      date: "February 2025",
    },
  },
  {
    slug: "fw-2025-return-of-the-steppe-silhouette",
    title: "FW 2025: The Return of the Steppe Silhouette",
    subtitle: "Volume is back. Mongolian designers are leading a quiet revolution in how cold-weather dressing is imagined.",
    category: "trends",
    author_name: "Anoce Editorial",
    status: "published",
    published_at: "2025-01-10T08:00:00.000Z",
    read_time: 5,
    cover_image: img[7],
    cover_image_vertical: img[8],  // ← two images
    designer_slug: "gobi-cashmere",
    tags: ["fw2025", "trends", "silhouette", "volume", "cashmere", "winter"],
    body: `Something is shifting in how cold weather is dressed. The lean minimalism that dominated the past decade is giving way to something more generous — in proportion, in material, in intent. Mongolian designers have been here for some time.

**The Architecture of Warmth**

Gobi Cashmere's FW25 collection, Steppe Silence, presents a masterclass in structured volume. Coats that stand away from the body. Sleeves that drop past the natural shoulder. Hems that sweep the ground. The silhouettes are large in the way that landscape is large — not as excess, but as fact.

This approach to proportion has deep roots. Traditional Mongolian outerwear was engineered for horseback, for sleeping under open sky, for a life in which a garment might be worn for days without removal. The del's width and layering capacity were pragmatic solutions. Contemporary designers are now re-reading those proportions as aesthetic propositions.

**Material as Statement**

The fabrics reinforce the shift. Gobi's signature double-faced cashmere is dense enough to hold its shape off the body without boning or interfacing. The material itself is the structure. This is a different relationship to textiles than most luxury houses maintain — one where the fiber's intrinsic qualities determine the form, rather than the other way around.

**A Wider Conversation**

What is most significant about FW25 is not any individual collection but the coherence of the direction. Across houses, there is a shared instinct toward clothing that creates space around the body rather than mapping it. Whether this becomes a lasting shift or a seasonal moment is unknowable. What is certain is that the Mongolian steppe, with its vast scale and its demand for serious protection, is an unusually productive place from which to reimagine winter dressing.`,
    credits: {
      photographer: "S. Bolormaa",
      stylist: "N. Enkhjin",
      date: "January 2025",
    },
  },
  {
    slug: "mongolian-wool-worlds-luxury",
    title: "How Mongolian Wool Became the World's Luxury",
    subtitle: "From desert herder to Parisian atelier — tracing the improbable journey of a fiber that changed fashion.",
    category: "news",
    author_name: "Anoce Editorial",
    status: "published",
    published_at: "2024-12-05T11:00:00.000Z",
    read_time: 7,
    cover_image: img[2],
    cover_image_vertical: img[5],  // ← two images
    tags: ["wool", "cashmere", "supply-chain", "mongolia", "history", "luxury"],
    body: `The story of how Mongolian fiber entered the global luxury market is not a smooth one. It involves Soviet-era collectivization, the chaos of the 1990s transition economy, a rapid proliferation of cashmere goats that threatened the grasslands, and — ultimately — the emergence of a domestic luxury industry that decided to tell its own story.

**Before the Market**

For centuries, Mongolian herders produced cashmere and wool for their own use. The fiber was sorted, spun, and woven at home or traded locally. The concept of a global luxury market was not part of the equation.

That began to change in the late Soviet period, when state factories in Ulaanbaatar started processing fiber for export. The quality was present, but the branding was absent. Mongolia supplied raw material to European mills, which added the finished product's perceived value — and kept most of the margin.

**The Overgrazing Crisis**

The 1990s brought market liberalization and an explosion in goat numbers. Without the Soviet quota system, herders responded to cashmere prices by maximizing herd size. By the 2000s, Mongolia's goat population had more than doubled, and the grasslands were showing the strain. Soil erosion, desertification, the loss of indigenous grass species — the environmental cost was severe and, in places, still ongoing.

**The Domestic Turn**

The response, when it came, was entrepreneurial. A new generation of Mongolian business owners decided that the value chain needed to stay in-country. Processing. Finishing. Design. Retail. The entire sequence. Gobi Cashmere was among the first to pursue this path at scale, and the results helped establish a model that others have followed.

Today, Mongolia's domestic luxury brands occupy a position that would have been unimaginable thirty years ago. They are not merely suppliers. They are authors of their own narrative — one that is increasingly being read, with interest, by buyers and editors far beyond the steppe.`,
    credits: {
      photographer: "Archive / Gobi Cashmere",
      date: "December 2024",
    },
  },
  {
    slug: "nomin-d-the-del-reimagined",
    title: "Nomin D: The Del, Reimagined",
    subtitle: "Mongolia's youngest major designer talks hardware, heritage, and the politics of deconstruction.",
    category: "features",
    author_name: "Anoce Editorial",
    status: "published",
    published_at: "2025-04-01T09:00:00.000Z",
    read_time: 5,
    cover_image: img[16],
    cover_image_vertical: img[17],  // ← two images
    designer_slug: "nomin-d",
    tags: ["nomin-d", "del", "deconstruction", "emerging", "ulaanbaatar"],
    body: `Nomin Davaadorj is twenty-six years old and already making some of the most discussed work in Mongolian fashion. Her FW24 collection, Winter Ritual, arrived with the particular force of a designer who knows exactly what she wants to destroy and exactly what she wants to build.

**The Del as Starting Point**

The traditional Mongolian del is a garment of extraordinary efficiency. Designed for nomadic life, it wraps, layers, and fastens with an economy of material that modern sportswear engineers would recognize as sophisticated. Nomin D begins there — not to preserve the del, but to understand it well enough to take it apart.

"I have a lot of respect for the del," she says from her small studio in central Ulaanbaatar. "Which is exactly why I can do what I do to it. You can only really deconstruct something you understand."

**Hardware as Language**

The signature element of Winter Ritual — and of Nomin D's work more broadly — is its hardware. Where the traditional del closes with fabric loops and buttons, her versions use oversized brass rings, leather strap systems, industrial buckles. The referents are multiple: workwear, bondage, armor, and yes, the del.

"I'm not trying to make the del modern for a global audience," she says. "I'm making it for the people I grew up around. They understand the reference. They also understand that things change."

**What Comes Next**

Nomin D is working on her SS25 collection, and she's being deliberately unhelpful about what to expect. "Something lighter," she says. "I've been living in black wool for eighteen months. I'm ready to breathe."

Whatever form it takes, the industry is watching. A designer this focused, this early, is rare anywhere. From Mongolia, it feels significant.`,
    credits: {
      photographer: "B. Ariunaa",
      location: "Nomin D Studio, Ulaanbaatar",
      date: "April 2025",
    },
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const repo = createContentRepository();

  console.log("Ensuring CouchDB is ready...");
  await repo.ensureReady();

  console.log(`\nSeeding ${designers.length} designers...`);
  for (const d of designers) {
    const result = await repo.upsertDesigner(d as Record<string, unknown>);
    console.log(`  ✓ ${result.name}`);
  }

  console.log(`\nSeeding ${collections.length} collections...`);
  for (const c of collections) {
    const result = await repo.upsertCollection(c as Record<string, unknown>);
    console.log(`  ✓ ${result.title} (${result.season} ${result.year}) — ${(result.looks || []).length} looks`);
  }

  console.log(`\nSeeding ${articles.length} articles...`);
  for (const article of articles) {
    const result = await repo.upsertArticle(article as Record<string, unknown>);
    console.log(`  ✓ "${result.title}" [${result.status}]`);
  }

  console.log("\n✅ All content seeded successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
