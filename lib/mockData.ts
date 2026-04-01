import { Designer, Collection, Article, User } from './types'

export const designers: Designer[] = [
  {
    id: '1',
    slug: 'gobi',
    name: 'Gobi Cashmere',
    brand: 'Gobi',
    tier: 'high-end',
    founded: 1981,
    nationality: 'Mongolian',
    activeSeasons: 12,
    shortBio: "Mongolia's premier cashmere house, redefining luxury since 1981.",
    bio: 'Gobi Cashmere has been at the forefront of Mongolian luxury fashion since 1981, transforming the finest inner fleece of Mongolian goats into garments that carry the silence of the steppe. Each piece is a testament to generations of craftsmanship, combining traditional nomadic techniques with contemporary silhouettes.',
    profileImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=700&fit=crop',
    socialLinks: { instagram: '@gobicashmere', website: 'gobicashmere.mn' }
  },
  {
    id: '2',
    slug: 'goyol',
    name: 'Goyol',
    brand: 'Goyol',
    tier: 'high-end',
    founded: 1998,
    nationality: 'Mongolian',
    activeSeasons: 8,
    shortBio: 'Architectural silhouettes rooted in nomadic tradition.',
    bio: "Goyol interprets the geometry of the Mongolian landscape — vast steppes, angular mountains — through architectural silhouettes and structural tailoring. Founded in 1998, the house has become synonymous with conceptual fashion that speaks to both heritage and innovation.",
    profileImage: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=1400&h=700&fit=crop',
    socialLinks: { instagram: '@goyolstudio' }
  },
  {
    id: '3',
    slug: 'michel-amazonka',
    name: 'Michel&Amazonka',
    brand: 'Michel&Amazonka',
    tier: 'contemporary',
    founded: 2015,
    nationality: 'Mongolian',
    activeSeasons: 5,
    shortBio: "Where Ulaanbaatar street culture meets European craft.",
    bio: 'Michel&Amazonka bridges the raw energy of Ulaanbaatar urban scene with the precision of European tailoring tradition. The brand has cultivated a devoted following among young Mongolians who see fashion as a form of cultural expression.',
    profileImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1400&h=700&fit=crop',
    socialLinks: { instagram: '@michelamazonka' }
  },
  {
    id: '4',
    slug: '93-kidult',
    name: '93 Kidult',
    brand: '93 Kidult',
    tier: 'contemporary',
    founded: 2019,
    nationality: 'Mongolian',
    activeSeasons: 3,
    shortBio: 'Youth culture, reimagined through a Mongolian lens.',
    bio: '93 Kidult channels the restless energy of Mongolia younger generation — a generation shaped by digital culture and steppe heritage in equal measure. The brand is known for oversized silhouettes, bold graphics, and an unapologetic embrace of youth identity.',
    profileImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400&h=700&fit=crop',
    socialLinks: { instagram: '@93kidult' }
  },
  {
    id: '5',
    slug: 'nomin-design',
    name: 'Nomin Design',
    brand: 'Nomin Design',
    tier: 'emerging',
    founded: 2022,
    nationality: 'Mongolian',
    activeSeasons: 2,
    shortBio: 'Sustainable luxury from the heart of the Mongolian steppe.',
    bio: 'Nomin Design pioneers a new vision of sustainable luxury, sourcing exclusively from small-scale herder cooperatives across the Mongolian steppe. Every garment tells the story of the specific herd and family who produced its fiber.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=700&fit=crop',
    socialLinks: { instagram: '@nomindesign' }
  },
  {
    id: '6',
    slug: 'steppe-studio',
    name: 'Steppe Studio',
    brand: 'Steppe Studio',
    tier: 'emerging',
    founded: 2023,
    nationality: 'Mongolian',
    activeSeasons: 1,
    shortBio: 'Experimental textiles inspired by nomadic craft.',
    bio: 'Steppe Studio is a material research practice as much as a fashion house, experimenting with traditional Mongolian textile techniques. Their debut collection explored the relationship between woven patterns and the constellations visible from the steppe.',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&h=700&fit=crop',
    socialLinks: { instagram: '@steppestudio.mn' }
  }
]

export const collections: Collection[] = [
  {
    id: '1',
    slug: 'gobi-fw2025',
    title: 'Gobi FW 2025',
    designerId: '1',
    designerName: 'Gobi Cashmere',
    designerSlug: 'gobi',
    season: 'FW',
    year: 2025,
    description: 'An exploration of heritage through the lens of architectural minimalism. The collection draws from the geometric patterns found in traditional Mongolian textiles, reimagined as modern structural elements.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=800&fit=crop',
    looks: [
      { id: 'l1', number: 1, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop', description: 'Oversized camel coat with geometric embroidery', materials: ['100% Mongolian cashmere'], tags: ['outerwear', 'embroidery'] },
      { id: 'l2', number: 2, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=900&fit=crop', description: 'Structured blazer in natural undyed cashmere', materials: ['Undyed cashmere'], tags: ['tailoring'] },
      { id: 'l3', number: 3, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=900&fit=crop', description: 'Draped midi dress with asymmetrical hemline', materials: ['Silk-cashmere blend'], tags: ['dresses', 'drape'] },
      { id: 'l4', number: 4, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=900&fit=crop', description: 'Wide-leg trousers in charcoal grey', materials: ['Cashmere-wool blend'], tags: ['trousers'] },
      { id: 'l5', number: 5, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=900&fit=crop', description: 'Chunky knit turtleneck in ivory', materials: ['Mongolian cashmere'], tags: ['knitwear'] },
      { id: 'l6', number: 6, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=900&fit=crop', description: 'Longline cardigan with patch pockets', materials: ['Cashmere'], tags: ['knitwear', 'outerwear'] },
      { id: 'l7', number: 7, image: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=900&fit=crop', description: 'Silk slip dress layered over cashmere turtleneck', materials: ['Silk', 'Cashmere'], tags: ['dresses', 'layering'] },
      { id: 'l8', number: 8, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=900&fit=crop', description: 'Wrap coat in forest green', materials: ['100% cashmere'], tags: ['outerwear'] },
    ]
  },
  {
    id: '2',
    slug: 'gobi-ss2025',
    title: 'Gobi SS 2025',
    designerId: '1',
    designerName: 'Gobi Cashmere',
    designerSlug: 'gobi',
    season: 'SS',
    year: 2025,
    description: 'Lightweight cashmere reimagined for warmer months. The collection introduces new weaving techniques that create ethereal, almost weightless fabrics.',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&h=800&fit=crop',
    looks: [
      { id: 'l1', number: 1, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=900&fit=crop', description: 'Cashmere gauze kaftan in natural ivory', materials: ['Cashmere gauze'], tags: ['dresses', 'summer'] },
      { id: 'l2', number: 2, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop', description: 'Oversized linen-cashmere shirt', materials: ['Linen-cashmere blend'], tags: ['tops', 'shirts'] },
      { id: 'l3', number: 3, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=900&fit=crop', description: 'Wide-leg drawstring trousers in sand', materials: ['Cashmere-linen'], tags: ['trousers'] },
      { id: 'l4', number: 4, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=900&fit=crop', description: 'Cropped cardigan with open weave', materials: ['Open-weave cashmere'], tags: ['knitwear'] },
    ]
  },
  {
    id: '3',
    slug: 'goyol-fw2025',
    title: 'Goyol FW 2025',
    designerId: '2',
    designerName: 'Goyol',
    designerSlug: 'goyol',
    season: 'FW',
    year: 2025,
    description: 'Inspired by the angular peaks of the Altai Mountains, this collection explores volume and form through geometric construction.',
    coverImage: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=1400&h=800&fit=crop',
    looks: [
      { id: 'l1', number: 1, image: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=900&fit=crop', description: 'Structured coat with angular shoulders', materials: ['Wool-cashmere'], tags: ['outerwear', 'structure'] },
      { id: 'l2', number: 2, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop', description: 'Geometric panel dress in black and white', materials: ['Technical wool'], tags: ['dresses', 'geometric'] },
      { id: 'l3', number: 3, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=900&fit=crop', description: 'Draped jumpsuit with architectural pleating', materials: ['Silk-wool'], tags: ['jumpsuits', 'pleating'] },
      { id: 'l4', number: 4, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=900&fit=crop', description: 'Column coat in charcoal grey', materials: ['Double-faced cashmere'], tags: ['outerwear'] },
      { id: 'l5', number: 5, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=900&fit=crop', description: 'Asymmetric hem skirt with pleat detail', materials: ['Wool blend'], tags: ['skirts'] },
      { id: 'l6', number: 6, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=900&fit=crop', description: 'Cropped bomber jacket in metallic finish', materials: ['Technical fabric'], tags: ['jackets'] },
    ]
  },
  {
    id: '4',
    slug: 'goyol-ss2025',
    title: 'Goyol SS 2025',
    designerId: '2',
    designerName: 'Goyol',
    designerSlug: 'goyol',
    season: 'SS',
    year: 2025,
    description: 'A study in restraint and transparency. The collection explores light and shadow through layered organza and silk constructions.',
    coverImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1400&h=800&fit=crop',
    looks: [
      { id: 'l1', number: 1, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=900&fit=crop', description: 'Layered organza dress in sky blue', materials: ['Silk organza'], tags: ['dresses', 'layers'] },
      { id: 'l2', number: 2, image: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=900&fit=crop', description: 'Sheer silk blouse with attached scarf', materials: ['Silk georgette'], tags: ['tops', 'sheer'] },
      { id: 'l3', number: 3, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=900&fit=crop', description: 'Wide-leg trousers in cream silk', materials: ['Silk crepe'], tags: ['trousers'] },
    ]
  },
  {
    id: '5',
    slug: 'michel-amazonka-ss2025',
    title: 'Michel&Amazonka SS 2025',
    designerId: '3',
    designerName: 'Michel&Amazonka',
    designerSlug: 'michel-amazonka',
    season: 'SS',
    year: 2025,
    description: 'Street-inspired luxury that speaks to the contradictions of modern Mongolian youth culture.',
    coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&h=800&fit=crop',
    looks: [
      { id: 'l1', number: 1, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=900&fit=crop', description: 'Oversized hoodie with Mongolian script embroidery', materials: ['Cotton fleece'], tags: ['streetwear', 'embroidery'] },
      { id: 'l2', number: 2, image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=900&fit=crop', description: 'Cargo pants with utility pockets', materials: ['Technical nylon'], tags: ['trousers', 'streetwear'] },
      { id: 'l3', number: 3, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop', description: 'Cropped leather jacket with embroidery', materials: ['Lambskin leather'], tags: ['jackets', 'leather'] },
      { id: 'l4', number: 4, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=900&fit=crop', description: 'Graphic tee with heritage print', materials: ['Organic cotton'], tags: ['tops', 'graphics'] },
      { id: 'l5', number: 5, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=900&fit=crop', description: 'Deconstructed blazer with raw edges', materials: ['Wool blend'], tags: ['tailoring', 'deconstructed'] },
    ]
  },
  {
    id: '6',
    slug: '93-kidult-fw2025',
    title: '93 Kidult FW 2025',
    designerId: '4',
    designerName: '93 Kidult',
    designerSlug: '93-kidult',
    season: 'FW',
    year: 2025,
    description: 'Maximum volume, maximum attitude. This collection pushes boundaries with exaggerated silhouettes and bold color blocking.',
    coverImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400&h=800&fit=crop',
    looks: [
      { id: 'l1', number: 1, image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=900&fit=crop', description: 'Puffy sleeve coat in bright orange', materials: ['Nylon shell', 'Cashmere fill'], tags: ['outerwear', 'volume'] },
      { id: 'l2', number: 2, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=900&fit=crop', description: 'Wide-leg cargo pants in acid green', materials: ['Technical fabric'], tags: ['trousers', 'color'] },
      { id: 'l3', number: 3, image: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=900&fit=crop', description: 'Oversized knit with color block', materials: ['Wool-acrylic blend'], tags: ['knitwear', 'colorblock'] },
      { id: 'l4', number: 4, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=900&fit=crop', description: 'Bucket hat in reflective material', materials: ['Reflective nylon'], tags: ['accessories'] },
    ]
  }
]

export const articles: Article[] = [
  {
    id: '1',
    slug: 'quiet-revolution-cashmere',
    title: 'The Quiet Revolution in Mongolian Cashmere',
    subtitle: 'How a handful of visionary designers are transforming Mongolia cashmere from commodity to craft',
    category: 'features',
    author: 'Narantsetseg Bold',
    publishedAt: '2026-03-15',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=700&fit=crop',
    designerSlug: 'gobi',
    tags: ['cashmere', 'sustainability', 'heritage'],
    readTime: 8,
    body: `The steppe stretches endlessly before us, a sea of golden grass that has sustained Mongolian herder families for millennia. Here, among the nomads of Arkhangai province, lies the source of what many consider the world's finest cashmere.

The transformation from raw fiber to luxury garment is a journey that spans continents and centuries. But something is changing in how the world views Mongolian cashmere—and it starts not in the ateliers of Paris or Milan, but in the workshops of Ulaanbaatar.

"We're not just making clothes," says Tsetseg, a third-generation cashmere grader in Arkhangai. "We're preserving a way of life. Every sweater carries the memory of the herd, the hands that sorted the fiber, the women who spun it into yarn."

This philosophy has given rise to a new generation of Mongolian designers who are challenging the traditional supply chain. Rather than selling raw fiber to foreign buyers, they are keeping production local, transforming the material at its source.

The results are striking. Gobi Cashmere, the country's largest manufacturer, has recently launched a new line that traces each garment back to the specific herder family who supplied its fiber. The initiative, though costly, has resonated with consumers willing to pay premium prices for provenance.

"For too long, Mongolian cashmere has been treated as a commodity," explains Bold, one of the founders of Nomin Design. "We want to restore its value as a craft—something made by hand, with intention, with stories embedded in every stitch."

The movement extends beyond luxury. Contemporary brands like 93 Kidult are using lower-grade cashmere and blends to create accessible pieces that still carry the essence of Mongolian heritage. Their oversized hoodies, embroidered with traditional geometric patterns, have become cult favorites among young fashion enthusiasts.

Yet challenges remain. Climate change threatens the delicate balance of the steppe ecosystem. Overgrazing has led to desertification in some regions. And the global cashmere market remains volatile, with prices fluctuating wildly from year to year.

Despite these obstacles, there is a quiet optimism among Mongolian designers. They see themselves as part of a larger movement—one that values quality over quantity, heritage over trends, and sustainability over profit.

"Woven from the finest inner fleece of Mongolian goats, each piece carries the silence of the steppe," reads the tagline from Gobi's latest campaign. It's a sentiment that captures something essential about what makes Mongolian fashion unique: the connection between land, animal, and artisan that no amount of mechanization can replicate.

As the fashion world continues to grapple with questions of sustainability and authenticity, Mongolia offers a compelling answer—one that grows from the earth and honors the traditions of those who tend it.`,
    status: 'published'
  },
  {
    id: '2',
    slug: '93-kidult-street-code',
    title: "How 93 Kidult is Rewriting Ulaanbaatar's Street Code",
    subtitle: 'The young brand challenging what it means to be Mongolian and fashionable',
    category: 'interviews',
    author: 'Bat-Erdene',
    publishedAt: '2026-03-10',
    coverImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=700&fit=crop',
    designerSlug: '93-kidult',
    tags: ['streetwear', 'youth', 'culture'],
    readTime: 6,
    body: `The studio is chaos. Fabric swatches cover every surface, sketches paper the walls, and in the center, three young designers argue passionately about sleeve proportions. Welcome to 93 Kidult, the Ulaanbaatar brand that has become the voice of Mongolia's disaffected youth.

"When we started, everyone said we were too extreme," recalls founder Nomin, gesturing at a rack of oversized puffers in acid green. "Too loud. Too much. But that's exactly the point."

The name itself is a statement: 93 references the year Mongolia transitioned from socialism, and Kidult—combining "kid" and "adult"—captures the brand's ethos of perpetual youthfulness.

Their FW 2025 collection, which debuted at a warehouse party in Ulaanbaatar, was nothing short of a manifesto. Models—friends and acquaintances rather than professional—wore pieces that referenced traditional Mongolian garments while subverting them entirely.

"The deel, our traditional robe, is beautiful but formal," explains Nomin. "We wanted to take those shapes and make them messy, wearable, alive."

The brand's success has been meteoric. Within two years, they've gone from selling on Instagram to being stocked at Concept Stores in Berlin and Tokyo. But success has brought complications.

"People want us to be 'authentic' Mongolian," says co-designer Saruul. "But what is authentic? The nomads who herded goats? Or the kids growing up with TikTok and Genghis Khan memes? We are both. We are neither. We are 93 Kidult."

This tension—between heritage and contemporary, local and global—pervades everything they do. Their latest hoodie features traditional Buddhist symbols alongside contemporary graphics. The Mongolian script is deliberately stylized, almost illegible, a private language for those who know.

"For our customers, wearing 93 Kidult is a way of saying something about who they are," Nomin explains. "They love their country, but they don't fit into the traditional mold. They want fashion that reflects their complexity."

As the sun sets over Ulaanbaatar, the designers return to their work. There's a new collection to sketch, new boundaries to push. The code they're writing isn't just about style—it's about identity, about what it means to be young and Mongolian in the twenty-first century.`,
    status: 'published'
  },
  {
    id: '3',
    slug: 'gobi-fw2025-heritage',
    title: 'Gobi FW2025: When Heritage Meets Architecture',
    subtitle: 'A collection that bridges Mongolia past and future through geometric precision',
    category: 'features',
    author: 'Narantsetseg Bold',
    publishedAt: '2026-02-28',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=700&fit=crop',
    designerSlug: 'gobi',
    tags: ['gobi', 'fw2025', 'architecture'],
    readTime: 5,
    body: `There's a moment in every Gobi show when the clothes stop being garments and become something else entirely—sculptural objects that command space, that demand to be seen from multiple angles.

This season, that moment comes early. The opening look—an oversized camel coat with geometric embroidery referencing traditional Mongolian textile patterns—sets the tone for what follows: a meditation on form, heritage, and the future of luxury.

"The inspiration came from the buildings in Ulaanbaatar," explains the design team. "The old Soviet administrative structures, yes, but also the traditional ger camps on the steppe. Both have their own logic, their own relationship to the landscape."

The collection balances these influences masterfully. Tailoring is structured and precise, with angular shoulders that echo the buildings of the capital. But the fabrics—100% Mongolian cashmere, naturally—are soft, yielding, deeply tactile.

Accessories take the architectural theme literally. Bags feature hard geometric frames, their shapes suggesting the angular peaks of the Altai Mountains. Shoes are sculptural, with heels that resemble the corner supports of traditional ger tents.

What makes this collection remarkable is its restraint. Gobi could easily overwhelm with ornament or novelty. Instead, they trust in the quality of their materials and the precision of their construction to speak for itself.

The closing looks—three variations on the theme, each more refined than the last—leave no doubt: Gobi has found its voice. It's a voice that honors the past while pushing toward something new, that treats fashion as both art and craft.

"Woven from the finest inner fleece of Mongolian goats," the show notes conclude, "each piece carries the silence of the steppe." It's a sentiment that applies to this collection as much as any that came before.`,
    status: 'published'
  },
  {
    id: '4',
    slug: 'steppe-to-runway',
    title: 'From Steppe to Runway: Mongolia Fashion Week Moment',
    subtitle: 'The annual gathering that is putting Mongolian designers on the global stage',
    category: 'news',
    author: 'Munkhjin',
    publishedAt: '2026-02-15',
    coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=700&fit=crop',
    tags: ['fashion week', 'events', 'industry'],
    readTime: 4,
    body: `For one week each February, Ulaanbaatar becomes the center of the Mongolian fashion universe. Designers, buyers, journalists, and fashion enthusiasts descend on the capital for Mongolia Fashion Week—a relatively young event that has rapidly matured in scope and ambition.

This year's edition, held at the recently renovated National Museum, was the most ambitious yet. Twenty-three designers showed collections, from established houses like Gobi to newcomers like Steppe Studio, whose debut presentation created a genuine buzz.

The setting played a crucial role. The museum's soaring atrium, with its glass ceiling and concrete walls, provided a dramatic backdrop for the clothes—many of which seemed to engage in dialogue with the architecture.

"We wanted to create an immersive experience," explained one organizer. "Fashion isn't just about garments—it's about context, atmosphere, the feeling you get when you see something new."

The international presence was notably larger this year. Buyers from Seoul, Tokyo, Paris, and New York attended, many making the long journey specifically to discover new talents. Several showed interest in Nomin Design, whose sustainable approach has caught the attention of environmentally conscious retailers.

Coverage in regional and international media has also increased, with journalists from South Korea, Japan, and Germany filing stories about the Mongolian fashion scene. The hashtag #MongolianFashion trended briefly on Twitter, though primarily among expats and fashion enthusiasts.

Yet the week wasn't without challenges. Some designers struggled with production timelines, and the event's infrastructure—while improved—still lagged behind standards in more established fashion capitals.

Despite these growing pains, there's a palpable sense of optimism. Mongolian fashion is no longer a curiosity—it has become a destination, a place where serious fashion business happens.

As one international buyer noted, departing: "Everyone knows about Mongolian cashmere. What's becoming clear is that Mongolia can do more than supply raw materials. It can create."`,
    status: 'published'
  },
  {
    id: '5',
    slug: 'nomin-design-sustainability',
    title: 'Nomin Design and the Future of Ethical Cashmere',
    subtitle: 'How traceability is becoming the ultimate luxury',
    category: 'trends',
    author: 'Narantsetseg Bold',
    publishedAt: '2026-02-01',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=700&fit=crop',
    designerSlug: 'nomin-design',
    tags: ['sustainability', 'ethical', 'nomin'],
    readTime: 7,
    body: `Every garment from Nomin Design comes with a story. Literally—each piece includes a small card with the name and location of the herder family who supplied the cashmere, along with a QR code that links to photographs and video of their animals.

"The fashion industry talks a lot about sustainability," says founder Bold, pouring tea in her sunlit studio. "We wanted to make it tangible. To give people a real connection to where their clothes come from."

The approach is radically transparent. Nomin works exclusively with three herder cooperatives in Arkhangai, Khuvsgul, and Zavkhan provinces. These aren't anonymous suppliers—they're partners whose practices Nomin monitors closely and whose livelihoods depend on fair compensation.

"We're paying three times the market rate," she explains. "But we're also asking for things: no overgrazing, proper animal welfare, traditional herding practices. The money is tied to outcomes."

The results speak for themselves. Nomin cashmere is consistently rated among the finest in Mongolia, prized for its softness and uniformity. Customers—particularly those in Europe and North America—respond to the ethical story.

But the model isn't without challenges. Scaling is difficult when you depend on small-scale producers. Quality control becomes more complex when your supply chain spans remote provinces. And the premium pricing that makes the model sustainable limits the potential customer base.

"People ask why our sweaters cost more than a fast fashion equivalent," Bold says. "I tell them: because you know exactly where it came from, who made it, and that no one was exploited in the process. That's what you're paying for."

As sustainability becomes increasingly central to fashion discourse, Nomin's approach offers a potential template. It demonstrates that ethical production isn't just possible—it can produce exceptional products that customers are willing to pay premium prices for.

The steppe stretches beyond the window, unchanged by the industry it supports. For Bold, that's the point. "We can't save the steppe," she concludes. "But we can make sure our fashion doesn't harm it."`,
    status: 'published'
  },
  {
    id: '6',
    slug: 'michel-amazonka-interview',
    title: 'Michel&Amazonka: Building a Brand Between Two Worlds',
    subtitle: 'An interview with the duo redefining Mongolian streetwear',
    category: 'interviews',
    author: 'Bat-Erdene',
    publishedAt: '2026-01-20',
    coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=700&fit=crop',
    designerSlug: 'michel-amazonka',
    tags: ['interview', 'streetwear', 'michel-amazonka'],
    readTime: 9,
    body: `Michel and Amazonka met at a flea market. It was 2014, and both were selling vintage Mongolian textiles to tourists outside a ger camp outside Ulaanbaatar. A decade later, their joint eponymous brand has become one of the most talked-about in contemporary Mongolian fashion.

"We didn't plan to start a brand," Michel admits, laughing. "We just kept making things together because it was fun."

The fun continues, even as the business has grown. Their studio, in a converted Soviet-era warehouse, has the chaotic energy of a creative space rather than a corporate office. Sketches cover every surface; fabric samples fill countless bins.

Amazonka, who handles the technical design, explains their collaborative process: "Michel will bring a concept—maybe something from a dream, or a memory from childhood. Then I figure out how to make it wearable."

The results are distinctive: clothes that balance Mongolian heritage with urban sensibility, that reference traditional forms while subverting them. Their signature piece—the oversized hoodie with Mongolian script embroidery—has become a uniform for a certain kind of Ulaanbaatar youth.

"We grew up between two worlds," Michel reflects. "Soviet influence, traditional culture, global media. All of it, mixed together. That's what our clothes look like."

The brand's success has brought opportunities—and complications. International interest has led to collaborations with European brands and offers from global retailers. But expansion means compromises, and the founders are cautious.

"We could scale up, produce in factories, reach more customers," Amazonka says. "But then it wouldn't be ours anymore. The whole point is the handmade quality, the connection to where we are."

For now, they're staying small, staying local. Their production remains in Ulaanbaatar, with a team of twelve seamstresses who have worked with them since the beginning. Orders ship slowly; waiting lists are common.

"We're not for everyone," Michel says. "And that's okay. We're for the people who get it—who understand that fashion can be a form of cultural expression, not just a way to look good."

As the interview concludes, samples arrive for next season. New ideas, new references, new ways of being Mongolian and fashionable. The two designers examine them together, already discussing modifications. The conversation continues.`,
    status: 'published'
  },
  {
    id: '7',
    slug: 'mongolia-fashion-week-2025',
    title: 'Mongolia Fashion Week 2025: Every Look That Mattered',
    subtitle: 'The definitive roundup from this year most ambitious edition yet',
    category: 'news',
    author: 'Munkhjin',
    publishedAt: '2026-02-10',
    coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=700&fit=crop',
    tags: ['fashion week', 'fw2025', 'roundup'],
    readTime: 10,
    body: `Mongolia Fashion Week 2025 has concluded, and it was the most ambitious edition in the event's history. Over five days, twenty-three designers showed collections that ranged from technically sophisticated to conceptually daring. Here are the moments that mattered.

Gobi opened the week with a masterclass in heritage craft. Their geometrically embroidered coats and structured cashmere pieces set the tone: this was fashion that took its roots seriously while pushing forward. The closing look—a floor-length gown in undyed natural cashmere—was worn by a model who had never walked a runway before. It was a statement about inclusion, about fashion belonging to everyone.

Goyol showed perhaps the most technically accomplished collection of the week. Their architectural silhouettes, inspired by the angular peaks of the Altai Mountains, demonstrated real skill in construction. The color palette—blacks, whites, and one startling red—reinforced the sculptural quality.

Michel&Amazonka brought the energy of Ulaanbaatar's street scene to the runway. Their oversized hoodies and deconstructed blazers resonated particularly with the younger audience. The show ended with the entire team—designers, models, stylists—taking the runway together, a gesture of collective authorship that felt genuine rather than performative.

93 Kidult, in their runway debut, went full throttle. Their FW 2025 collection featured the volume and attitude that have made them cult favorites, translated into a show format. The acid greens and electric oranges felt almost aggressive after the muted palettes of earlier shows—and that was entirely the point.

Nomin Design presented their sustainable philosophy through a quieter collection. The focus on traceability—their garments' connections to specific herder families—translated into a coherent aesthetic: natural colors, simple cuts, and an emphasis on material quality over design novelty.

Steppe Studio's debut was the week's most talked-about moment. Their experimental textiles, inspired by traditional Mongolian weaving techniques, created genuine surprise. Their closing look—a coat constructed from multiple layers of hand-woven fabric, each referencing a different constellation—drew a standing ovation.

The international presence was notable. Buyers from Seoul, Tokyo, and Paris attended, with several making immediate orders. The global fashion industry is paying attention to Mongolia—and this week's shows demonstrated that the attention is deserved.

Mongolia Fashion Week 2025 was not just about clothes. It was about identity, about what it means to create fashion in a country with a rich heritage and a complicated relationship with global culture. The designers who showed understood this, and their clothes showed it.`,
    status: 'published'
  },
  {
    id: '8',
    slug: 'goyol-geometry-of-steppe',
    title: 'Goyol and the Geometry of the Steppe',
    subtitle: 'How one brand found its identity in the angular landscapes of Mongolia',
    category: 'features',
    author: 'Narantsetseg Bold',
    publishedAt: '2026-01-15',
    coverImage: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=1200&h=700&fit=crop',
    designerSlug: 'goyol',
    tags: ['goyol', 'geometry', 'heritage'],
    readTime: 6,
    body: `There's a particular quality of light on the Mongolian steppe that artists have tried to capture for centuries. It comes from the horizon, uninterrupted for miles, and it makes everything look sharper, more defined—as if the air itself has been clarified.

Goyol's design director, when asked about her aesthetic, describes it in these terms. "I'm interested in that clarity," she says. "In the way the landscape creates its own geometry. The mountains aren't soft. They're angular, decisive. I want our clothes to have that same quality."

The house was founded in 1998, making it one of the older contemporary Mongolian brands. But its aesthetic—architectural, precise, minimal—feels remarkably current.

The name itself is interesting. "Goyol" refers to a specific type of traditional Mongolian song—long, drawn-out melodies that explore the relationship between human emotion and the vastness of the steppe. The designers have cited this music as an influence, and you can hear it in their work: the same sense of space, of taking time, of allowing things to unfold at their own pace.

Their approach to fabric is equally distinctive. Goyol works primarily with wool and cashmere blends, favoring materials with body and structure. Clothes hold their shape, maintain their lines. They're designed to be seen, to occupy space.

The construction techniques reference tailoring traditions—Japanese, Italian, Savile Row—while remaining distinctly Mongolian in their geometry. Sleeves are set at unusual angles; hems are rarely straight; lapels fold in unexpected ways.

Yet there's nothing gimmicky about the designs. Every unusual element serves a purpose, creating a silhouette or achieving a proportion that couldn't be accomplished conventionally. The eccentricities are earned.

"I'm not interested in novelty for its own sake," the design director explains. "I want every decision to be meaningful. If I use an unusual shoulder, it's because it changes the whole feeling of the garment. Not just for the sake of being different."

This commitment to meaning over novelty gives Goyol's work a timeless quality. Their pieces don't date; they accumulate significance. Collectors speak of returning to their Goyol purchases years later and finding them as relevant, as beautiful, as the day they bought them.

The steppe, vast and eternal, continues to shape the work. "When I'm stuck," the designer admits, "I go out there. Not to the tourist camps, but to real herding communities. I watch how they arrange their gers, how they fold their textiles. There's so much design intelligence in those traditions, if you're willing to see it."`,
    status: 'published'
  }
]

export const currentUser: User = {
  id: 'user-1',
  name: 'Tsetsgt',
  email: 'tsetseg@example.com',
  role: 'admin',
  avatar: '',
  joinedAt: '2025-06-15',
  savedArticles: ['1', '2', '4'],
  savedLooks: ['gobi-fw2025-l1', 'michel-amazonka-ss2025-l2'],
  followedBrands: ['gobi', 'goyol', 'michel-amazonka']
}
