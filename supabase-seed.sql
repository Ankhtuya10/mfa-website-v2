-- ================================================
-- ANOCE FASHION SEED DATA
-- Run this AFTER supabase-schema.sql
-- ================================================

-- ================================================
-- DESIGNERS
-- ================================================

INSERT INTO designers (slug, name, tier, bio, short_bio, founded, profile_image, cover_image) VALUES
('gobi', 'Gobi Cashmere', 'high-end',
 'Gobi Cashmere has been at the forefront of Mongolian luxury fashion since 1981, transforming the finest inner fleece of Mongolian goats into garments that carry the silence of the steppe.',
 'Mongolias premier cashmere house, redefining luxury since 1981.',
 1981,
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=700&fit=crop'),
('goyol', 'Goyol', 'high-end',
 'Goyol interprets the geometry of the Mongolian landscape through architectural silhouettes and structural tailoring.',
 'Architectural silhouettes rooted in nomadic tradition.',
 1998,
 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=600&fit=crop',
 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=1400&h=700&fit=crop'),
('michel-amazonka', 'Michel&Amazonka', 'contemporary',
 'Michel&Amazonka bridges the raw energy of Ulaanbaatars urban scene with the precision of European tailoring tradition.',
 'Where Ulaanbaatar street culture meets European craft.',
 2015,
 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=600&fit=crop',
 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1400&h=700&fit=crop'),
('93-kidult', '93 Kidult', 'contemporary',
 '93 Kidult channels the restless energy of Mongolias younger generation shaped by digital culture and steppe heritage.',
 'Youth culture, reimagined through a Mongolian lens.',
 2019,
 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=600&fit=crop',
 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400&h=700&fit=crop'),
('nomin-design', 'Nomin Design', 'emerging',
 'Nomin Design pioneers sustainable luxury, sourcing exclusively from small-scale herder cooperatives across the Mongolian steppe.',
 'Sustainable luxury from the heart of the Mongolian steppe.',
 2022,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=700&fit=crop'),
('steppe-studio', 'Steppe Studio', 'emerging',
 'Steppe Studio is a material research practice experimenting with traditional Mongolian textile techniques.',
 'Experimental textiles inspired by nomadic craft.',
 2023,
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop',
 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&h=700&fit=crop');

-- ================================================
-- COLLECTIONS
-- ================================================

INSERT INTO collections (slug, title, designer_id, designer_name, designer_slug, season, year, description, cover_image)
SELECT 'gobi-fw2025', 'The Silence of the Steppe', id, 'Gobi Cashmere', 'gobi', 'FW', 2025,
'A collection that distills the vast quietude of the Mongolian winter into wearable form.',
'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop'
FROM designers WHERE slug = 'gobi';

INSERT INTO collections (slug, title, designer_id, designer_name, designer_slug, season, year, description, cover_image)
SELECT 'gobi-ss2025', 'Highlands Spring', id, 'Gobi Cashmere', 'gobi', 'SS', 2025,
'Lightness and warmth in equal measure - the spring awakening of the Mongolian plateau.',
'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop'
FROM designers WHERE slug = 'gobi';

INSERT INTO collections (slug, title, designer_id, designer_name, designer_slug, season, year, description, cover_image)
SELECT 'goyol-fw2025', 'Architecture of the Steppe', id, 'Goyol', 'goyol', 'FW', 2025,
'Structured forms inspired by the angular geometry of mountain ranges and ger frames.',
'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=800&h=1000&fit=crop'
FROM designers WHERE slug = 'goyol';

INSERT INTO collections (slug, title, designer_id, designer_name, designer_slug, season, year, description, cover_image)
SELECT 'michel-amazonka-ss2025', 'Urban Nomad', id, 'Michel&Amazonka', 'michel-amazonka', 'SS', 2025,
'The collision of Ulaanbaatar street energy with precision European tailoring.',
'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&h=1000&fit=crop'
FROM designers WHERE slug = 'michel-amazonka';

INSERT INTO collections (slug, title, designer_id, designer_name, designer_slug, season, year, description, cover_image)
SELECT '93-kidult-fw2025', 'Digital Ger', id, '93 Kidult', '93-kidult', 'FW', 2025,
'A generation raised on screens and steppe - this collection lives in that tension.',
'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=1000&fit=crop'
FROM designers WHERE slug = '93-kidult';

INSERT INTO collections (slug, title, designer_id, designer_name, designer_slug, season, year, description, cover_image)
SELECT 'nomin-design-ss2025', 'Cooperative Threads', id, 'Nomin Design', 'nomin-design', 'SS', 2025,
'Each piece sourced directly from herder cooperatives, connecting wearer to origin.',
'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop'
FROM designers WHERE slug = 'nomin-design';

INSERT INTO collections (slug, title, designer_id, designer_name, designer_slug, season, year, description, cover_image)
SELECT 'steppe-studio-fw2025', 'Woven Memory', id, 'Steppe Studio', 'steppe-studio', 'FW', 2025,
'Experimental textiles that revive traditional Mongolian weaving techniques.',
'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=1000&fit=crop'
FROM designers WHERE slug = 'steppe-studio';

-- ================================================
-- LOOKS (for gobi-fw2025)
-- ================================================

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 1, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=900&fit=crop',
'Flowing cashmere coat in natural undyed fiber. The silhouette draws from traditional deel robes, reimagined for contemporary proportions.',
ARRAY['undyed cashmere', 'silk lining']
FROM collections WHERE slug = 'gobi-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 2, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=900&fit=crop',
'Minimalist turtleneck paired with wide-leg trousers. The contrast of texture against the monochrome palette speaks to steppe minimalism.',
ARRAY['lightweight cashmere', 'organic cotton']
FROM collections WHERE slug = 'gobi-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 3, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop',
'Layered knit ensemble with architectural volume. The exaggerated shoulders reference both nomadic blankets and contemporary sculptural forms.',
ARRAY['boucle cashmere', 'merino wool']
FROM collections WHERE slug = 'gobi-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 4, 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=900&fit=crop',
'Structured vest over flowing pants. The juxtaposition of rigid and fluid creates a dialogue between tradition and modernity.',
ARRAY['cashmere suiting', 'silk blend']
FROM collections WHERE slug = 'gobi-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 5, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=900&fit=crop',
'Camel-toned wrap coat with asymmetric closure. Hand-finished edges celebrate the human touch in an age of automation.',
ARRAY['camel cashmere', 'hand-finished']
FROM collections WHERE slug = 'gobi-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 6, 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=900&fit=crop',
'Evening ensemble in deep charcoal. The simplicity of the form amplifies the richness of the material.',
ARRAY['silk-cashmere blend', 'undyed']
FROM collections WHERE slug = 'gobi-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 7, 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=900&fit=crop',
'Textured knit dress with subtle geometric patterning inspired by Mongolian carpet motifs.',
ARRAY['cable-knit cashmere', 'geometrical pattern']
FROM collections WHERE slug = 'gobi-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 8, 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=600&h=900&fit=crop',
'Relaxed outerwear piece designed for the transitional moments between seasons on the steppe.',
ARRAY['double-faced cashmere', 'natural dyes']
FROM collections WHERE slug = 'gobi-fw2025';

-- ================================================
-- LOOKS (for gobi-ss2025)
-- ================================================

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 1, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=900&fit=crop',
'Lightweight cashmere layers in soft pastels. Spring Awakening collection.',
ARRAY['lightweight cashmere', 'cotton']
FROM collections WHERE slug = 'gobi-ss2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 2, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop',
'Breathable knit in natural ivory. The highlands spring light captured in fiber.',
ARRAY['baby cashmere', 'silk']
FROM collections WHERE slug = 'gobi-ss2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 3, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=900&fit=crop',
'Summer cashmere in soft lavender. Who says cashmere is only for winter?',
ARRAY['summer cashmere', 'natural dye']
FROM collections WHERE slug = 'gobi-ss2025';

-- ================================================
-- LOOKS (for goyol-fw2025)
-- ================================================

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 1, 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=900&fit=crop',
'Angular shoulder coat referencing ger frame geometry.',
ARRAY['wool-cashmere blend', 'architectural structure']
FROM collections WHERE slug = 'goyol-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 2, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop',
'Structured blazer with geometric pocket details.',
ARRAY['suiting weight cashmere', 'precise tailoring']
FROM collections WHERE slug = 'goyol-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 3, 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=900&fit=crop',
'Minimalist black ensemble with architectural volume.',
ARRAY['black cashmere', 'sculptural form']
FROM collections WHERE slug = 'goyol-fw2025';

-- ================================================
-- LOOKS (for michel-amazonka-ss2025)
-- ================================================

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 1, 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=900&fit=crop',
'Street-inspired tailoring meeting European precision.',
ARRAY['mixed textiles', 'urban influence']
FROM collections WHERE slug = 'michel-amazonka-ss2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 2, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop',
'Deconstructed blazer with Mongolian embroidery accents.',
ARRAY['deconstructed tailoring', 'traditional embroidery']
FROM collections WHERE slug = 'michel-amazonka-ss2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 3, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=900&fit=crop',
'Light layers for the urban nomad navigating city and steppe.',
ARRAY['lightweight fabrics', 'versatile design']
FROM collections WHERE slug = 'michel-amazonka-ss2025';

-- ================================================
-- LOOKS (for 93-kidult-fw2025)
-- ================================================

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 1, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=900&fit=crop',
'Digital prints meet traditional patterns in this Gen-Z statement.',
ARRAY['technical fabrics', 'digital print']
FROM collections WHERE slug = '93-kidult-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 2, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=900&fit=crop',
'Oversized silhouettes with Mongolian script graphics.',
ARRAY['cotton blend', 'screen print']
FROM collections WHERE slug = '93-kidult-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 3, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop',
'Streetwear essentials reimagined with steppe heritage.',
ARRAY['comfortable cashmere', 'casual cut']
FROM collections WHERE slug = '93-kidult-fw2025';

-- ================================================
-- LOOKS (for nomin-design-ss2025)
-- ================================================

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 1, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=900&fit=crop',
'Sustainable luxury from cooperative-sourced materials.',
ARRAY['organic cashmere', 'natural dyes']
FROM collections WHERE slug = 'nomin-design-ss2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 2, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=900&fit=crop',
'Earthy tones reflecting the landscape of the steppe.',
ARRAY['earth-toned cashmere', 'herder cooperative']
FROM collections WHERE slug = 'nomin-design-ss2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 3, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=900&fit=crop',
'Simple elegant forms that honor the material and its origins.',
ARRAY['traceable cashmere', 'ethical production']
FROM collections WHERE slug = 'nomin-design-ss2025';

-- ================================================
-- LOOKS (for steppe-studio-fw2025)
-- ================================================

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 1, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=900&fit=crop',
'Experimental weave structures revived from traditional techniques.',
ARRAY['hand-woven textiles', 'traditional patterns']
FROM collections WHERE slug = 'steppe-studio-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 2, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=900&fit=crop',
'Textile research made wearable - each piece tells a story of craft.',
ARRAY['experimental textiles', 'material research']
FROM collections WHERE slug = 'steppe-studio-fw2025';

INSERT INTO looks (collection_id, number, image, description, materials)
SELECT id, 3, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop',
'Nomadic patterns translated into contemporary silhouettes.',
ARRAY['traditional techniques', 'modern form']
FROM collections WHERE slug = 'steppe-studio-fw2025';

-- ================================================
-- ARTICLES
-- ================================================

INSERT INTO articles (slug, title, subtitle, category, author_name, cover_image, body, status, tags, read_time, published_at) VALUES
('quiet-revolution-cashmere',
 'The Quiet Revolution in Mongolian Cashmere',
 'How a new generation of designers is transforming the countrys most precious material',
 'features', 'Narantsetseg Bold',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=700&fit=crop',
 'For decades, Mongolian cashmere was known primarily as a raw material - exported in bales, transformed elsewhere, sold back at luxury prices with foreign labels. That story is changing.

A new generation of Mongolian designers is reclaiming the narrative, insisting that the finest cashmere in the world deserves to be designed, crafted, and celebrated where it originates: on the steppe.

The shift has been gradual but unmistakable. Gobi Cashmere, the countrys oldest luxury house, has invested heavily in design talent. Nomin Design works directly with herder cooperatives. And a wave of younger labels - Michel&Amazonka, 93 Kidult, Steppe Studio - are bringing entirely new aesthetics to a material with ancient roots.

The cashmere doesnt change. What changes is how we see it.',
 'published', ARRAY['cashmere', 'gobi', 'fw2025'], 8, NOW()),

('michel-amazonka-interview',
 'Michel&Amazonka: Building a Brand Between Two Worlds',
 'How the label navigates Mongolian identity and global fashion language',
 'interviews', 'Narantsetseg Bold',
 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1200&h=700&fit=crop',
 'The name itself is a provocation. Michel&Amazonka - two words that sound like they belong on a Parisian label, attached to a fashion house that is deeply, deliberately Mongolian.

That tension is the point. We live in between worlds, says the founder. We speak Mongolian, but we consume globally. We understand the steppe, but we also understand what happens in Ulaanbaatar, in Seoul, in Berlin.

The label was born from that duality. The first collection was called Urban Nomad - a phrase that captures both the geography of their practice and the mindset of their customer.',
 'published', ARRAY['michel-amazonka', 'contemporary', 'ulaanbaatar'], 9, NOW()),

('93-kidult-street-code',
 'How 93 Kidult is Rewriting Ulaanbaatars Street Code',
 'The label channeling Mongolias youth culture into something entirely its own',
 'interviews', 'Enkhbold Gantulga',
 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=700&fit=crop',
 'The studio is in a repurposed Soviet-era apartment block in the 4th district. Racks of half-finished pieces crowd the space. On a battered laptop, a playlist of Mongolian hip-hop competes with the sound of traffic seven floors below.

This is where 93 Kidult is made - and it looks nothing like a traditional fashion house.

The label was founded in 2019 by two friends who met at the Fine Arts University. Their starting point was simple: they were tired of Mongolian fashion that looked like it was made for someone else.

Everything felt like a copy. We wanted to make something that could only come from here.',
 'published', ARRAY['93-kidult', 'streetwear', 'ulaanbaatar'], 6, NOW()),

('goyol-geometry-of-steppe',
 'Goyol and the Geometry of the Steppe',
 'The architectural vision behind Mongolias most structurally ambitious fashion house',
 'features', 'Enkhjargal Dorj',
 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=1200&h=700&fit=crop',
 'There is a moment in the Mongolian summer when the light hits the steppe at a low angle and the landscape becomes almost abstract - pure geometry, the curve of the earth meeting the straight line of the horizon.

Goyol has been chasing that moment for twenty-five years.

The collections are architectural in the truest sense: structured forms that reference the angular geometry of mountain ranges, the precise angles of ger frames, the hard edges of winter light on snow.',
 'published', ARRAY['goyol', 'fw2025', 'architecture'], 6, NOW()),

('steppe-to-runway',
 'From Steppe to Runway: Mongolias Fashion Week Moment',
 'The 2025 season that announced Mongolian fashion to the world',
 'news', 'Zolboo Munkhjargal',
 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=700&fit=crop',
 'Mongolia Fashion Week 2025 was, by any measure, the most ambitious in the events history.

Six labels. Four venues. Three days. And for the first time, genuine international press attention - buyers from Paris, journalists from Tokyo, a documentary crew from London.

The shows ran from the steps of the Genghis Khan statue to the converted warehouse district. Some were staged in traditional ger camps. Others in brutalist concrete halls left over from the socialist era.',
 'published', ARRAY['fashion-week', 'ulaanbaatar', 'emerging'], 4, NOW()),

('nomin-design-sustainability',
 'Nomin Design and the Future of Ethical Cashmere',
 'How one label is proving that luxury and sustainability are not opposites',
 'trends', 'Enkhjargal Dorj',
 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=700&fit=crop',
 'The herders have been doing this for centuries. Every spring, the combing - patient, careful, practiced - yields the inner fleece that makes Mongolian cashmere the finest in the world.

Nomin Design is one of the few fashion labels that insists on being present for this process. They visit the cooperatives. They know the herders by name. They can trace every piece back to the specific animals that produced its fiber.

This is what we mean by sustainable luxury, says the founder. Not just materials. Relationships.',
 'published', ARRAY['nomin-design', 'sustainability', 'cashmere'], 7, NOW()),

('gobi-fw2025-heritage',
 'Gobi FW2025: When Heritage Meets Architecture',
 'The collection that redefines what Mongolian luxury can mean',
 'features', 'Narantsetseg Bold',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=700&fit=crop',
 'The show opened in silence. No music - just the sound of the models footsteps on the raw concrete floor of the Ulaanbaatar Cultural Palace.

The first look: a full-length coat in undyed natural cashmere, its structure so precise it could have been carved from stone.

The audience understood immediately that this was a different kind of Gobi collection. This was heritage refined through an architectural lens.',
 'published', ARRAY['gobi', 'fw2025', 'cashmere'], 5, NOW()),

('mongolian-fashion-week-2025',
 'Mongolia Fashion Week 2025: Every Look That Mattered',
 'A complete record of the seasons most significant moments',
 'news', 'Zolboo Munkhjargal',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=700&fit=crop',
 'Six shows. Forty-eight hours. Hundreds of looks. Mongolia Fashion Week 2025 was the most expansive showcase of domestic design talent the country has ever staged.

Here, we document every collection that defined the season - from Gobis architectural cashmere to Steppe Studios experimental textiles.',
 'published', ARRAY['fashion-week', 'fw2025', 'roundup'], 10, NOW());
