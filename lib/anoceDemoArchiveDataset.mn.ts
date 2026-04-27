export type DemoArchiveSeason = 'SS' | 'FW' | 'Resort'

export type DemoArchiveLook = {
  number: number
  title: string
  descriptionMn: string
  materialsMn: string[]
  tags: string[]
}

export type DemoArchiveCollection = {
  id: string
  slug: string
  title: string
  titleMn: string
  designerName: string
  designerSlug: string
  season: DemoArchiveSeason
  seasonMn: string
  year: number
  category: string
  summaryMn: string
  moodMn: string[]
  tags: string[]
  latinAliases: string[]
  looks: DemoArchiveLook[]
}

export const anoceDemoArchiveCollectionsMn: DemoArchiveCollection[] = [
  {
    id: 'demo-collection-mongol-huvtsas-ss2022',
    slug: 'anoce-mongol-huvtsas-ss2022',
    title: 'Mongol Huvtsas Spring 2022',
    titleMn: 'Монгол хувцасны хавар 2022',
    designerName: 'Anoce Editorial Archive',
    designerSlug: 'anoce-editorial-archive',
    season: 'SS',
    seasonMn: 'Хавар/Зун',
    year: 2022,
    category: 'heritage-modern',
    summaryMn:
      'Anoce demo archive-д 2022 оны хавар/зун улирлын Монгол хувцасны редакцийн цуглуулга гэж бүртгэсэн. Гол санаа нь дээлэн зах, торгон гадаргуу, хөнгөн давхарлалт, өдөр тутамд өмсөх боломжтой heritage-modern silhouette.',
    moodMn: ['хаврын', 'heritage-modern', 'зөөлөн ёслолын', 'өдөр тутмын тансаг'],
    tags: ['2022', 'SS2022', 'spring', 'summer', 'хавар', 'зун', 'монгол хувцас', 'дээл', 'торго'],
    latinAliases: [
      '2022 onii collection',
      '2022 onii mongol huvtsas',
      'mongol huvtsasnii havriinh',
      'havriin mongol huvtsas',
      'spring 2022 mongol clothes',
      'ss2022 mongol huvtsas',
    ],
    looks: [
      {
        number: 1,
        title: 'Light deel coat',
        descriptionMn: 'Цайвар торгон гадартай, богино дээлэн пальто хэлбэрийн хаврын гадуур хувцас.',
        materialsMn: ['торго', 'хөнгөн ноосон дотор'],
        tags: ['deel coat', 'дээл', 'outerwear', 'spring'],
      },
      {
        number: 2,
        title: 'Silk blouse and sash',
        descriptionMn: 'Өндөр захтай торгон цамц, бүсний зөөлөн зангилаагаар Монгол хувцасны хэлбэрийг өдөр тутамд ойртуулсан look.',
        materialsMn: ['торго', 'сатин'],
        tags: ['silk', 'blouse', 'бүс', 'mongol huvtsas'],
      },
      {
        number: 3,
        title: 'Embroidered skirt',
        descriptionMn: 'Хатгамал ирмэгтэй midi юбка, minimal цамцтай хосолсон хаврын ёслолын хувилбар.',
        materialsMn: ['хөвөн', 'хатгамал даавуу'],
        tags: ['embroidery', 'skirt', 'ceremony'],
      },
      {
        number: 4,
        title: 'Everyday deel dress',
        descriptionMn: 'Дээлэн энгэрийг даашинзны цэвэр silhouette-тэй холбосон өдөр тутмын хувилбар.',
        materialsMn: ['торго-хөвөн холимог'],
        tags: ['dress', 'deel silhouette', 'daily wear'],
      },
    ],
  },
  {
    id: 'demo-collection-naadam-silk-ss2023',
    slug: 'anoce-naadam-silk-ss2023',
    title: 'Naadam Silk SS 2023',
    titleMn: 'Наадмын торго SS 2023',
    designerName: 'Anoce Editorial Archive',
    designerSlug: 'anoce-editorial-archive',
    season: 'SS',
    seasonMn: 'Наадам / Хавар-Зун',
    year: 2023,
    category: 'ceremonial-silk',
    summaryMn:
      '2023 оны наадам, зуны ёслолын өнгө аястай торгон хувцасны demo archive record. Торго, brocade, өндөр зах, хатгамал ирмэг, баярын minimal silhouette давамгай.',
    moodMn: ['наадам', 'ёслолын', 'торгон', 'гэрэлтсэн'],
    tags: ['2023', 'SS2023', 'naadam', 'наадам', 'торго', 'silk', 'ceremony', 'deel'],
    latinAliases: ['naadmiin collection', '2023 onii naadam huvtsas', 'silk collection mongol'],
    looks: [
      {
        number: 1,
        title: 'Ivory silk deel',
        descriptionMn: 'Зааны ясан өнгийн торгон дээл, нарийн brocade эмжээртэй.',
        materialsMn: ['торго', 'brocade'],
        tags: ['deel', 'silk', 'naadam'],
      },
      {
        number: 2,
        title: 'Ceremonial vest',
        descriptionMn: 'Дээлэн цамцан дээр өмсөх богино хантааз, металл товчтой.',
        materialsMn: ['хатгамал даавуу', 'торго'],
        tags: ['vest', 'ceremony'],
      },
      {
        number: 3,
        title: 'Blue sash dress',
        descriptionMn: 'Хөх бүстэй даашинз, дээлэн энгэрийн диагональ шугамтай.',
        materialsMn: ['сатин', 'торго'],
        tags: ['dress', 'sash', 'blue'],
      },
    ],
  },
  {
    id: 'demo-collection-ub-street-ss2023',
    slug: 'anoce-ub-street-ss2023',
    title: 'Ulaanbaatar Street SS 2023',
    titleMn: 'Улаанбаатар street SS 2023',
    designerName: 'Anoce Editorial Archive',
    designerSlug: 'anoce-editorial-archive',
    season: 'SS',
    seasonMn: 'Хавар/Зун',
    year: 2023,
    category: 'streetwear',
    summaryMn:
      'Улаанбаатарын залуу үеийн streetwear өнгө аясыг hoodie, graphic tee, cargo silhouette, denim layering-аар тайлбарласан demo archive record.',
    moodMn: ['залуу', 'graphic', 'comfort fit', 'urban'],
    tags: ['2023', 'SS2023', 'streetwear', 'urban', 'hoodie', 'denim', 'graphic', 'гудамжны стиль'],
    latinAliases: ['ub streetwear 2023', 'gudamjnii style', 'streetwear sanal bolgo'],
    looks: [
      {
        number: 1,
        title: 'Script hoodie',
        descriptionMn: 'Монгол бичгийн graphic detail-тэй oversized hoodie.',
        materialsMn: ['cotton fleece'],
        tags: ['hoodie', 'graphic', 'streetwear'],
      },
      {
        number: 2,
        title: 'Cargo denim',
        descriptionMn: 'Өргөн cargo denim өмд, utilitarian pocket detail-тэй.',
        materialsMn: ['denim'],
        tags: ['denim', 'cargo', 'pants'],
      },
      {
        number: 3,
        title: 'Layered tee',
        descriptionMn: 'Heritage print-тэй футболк, нимгэн overshirt-тэй давхарласан look.',
        materialsMn: ['хөвөн'],
        tags: ['t-shirt', 'layering', 'heritage print'],
      },
    ],
  },
  {
    id: 'demo-collection-winter-cashmere-fw2023',
    slug: 'anoce-winter-cashmere-fw2023',
    title: 'Winter Cashmere FW 2023',
    titleMn: 'Өвлийн ноолуур FW 2023',
    designerName: 'Anoce Editorial Archive',
    designerSlug: 'anoce-editorial-archive',
    season: 'FW',
    seasonMn: 'Намар/Өвөл',
    year: 2023,
    category: 'cashmere-winter',
    summaryMn:
      'Өвлийн ноолуур, давхарлалт, пальто, cardigan, basic knitwear дээр төвлөрсөн demo archive record. Монгол ноолуурыг өдөр тутмын luxury minimalism хэлбэрээр тайлбарлана.',
    moodMn: ['дулаан', 'minimal', 'premium basic', 'өвлийн'],
    tags: ['2023', 'FW2023', 'winter', 'өвөл', 'ноолуур', 'cashmere', 'knitwear', 'coat'],
    latinAliases: ['uvliin nooluuriin collection', 'winter cashmere', 'fw2023 cashmere'],
    looks: [
      {
        number: 1,
        title: 'Camel cashmere coat',
        descriptionMn: 'Тэмээн шаргал өнгийн урт ноолууран пальто.',
        materialsMn: ['ноолуур'],
        tags: ['coat', 'cashmere', 'outerwear'],
      },
      {
        number: 2,
        title: 'Ivory knit set',
        descriptionMn: 'Цайвар свитер, сул өмдтэй premium basic иж бүрдэл.',
        materialsMn: ['ноолуур', 'ноос'],
        tags: ['knitwear', 'basic', 'set'],
      },
      {
        number: 3,
        title: 'Layered cardigan',
        descriptionMn: 'Урт cardigan, нимгэн turtleneck-тэй давхарласан өвлийн look.',
        materialsMn: ['ноолуур'],
        tags: ['cardigan', 'layering'],
      },
    ],
  },
  {
    id: 'demo-collection-heritage-modern-ss2024',
    slug: 'anoce-heritage-modern-ss2024',
    title: 'Heritage Modern SS 2024',
    titleMn: 'Өв соёл ба modern silhouette SS 2024',
    designerName: 'Anoce Editorial Archive',
    designerSlug: 'anoce-editorial-archive',
    season: 'SS',
    seasonMn: 'Хавар/Зун',
    year: 2024,
    category: 'heritage-modern',
    summaryMn:
      'Өв соёлын хэлбэрийг шууд хуулбарлахгүйгээр modern silhouette, minimal tailoring, торго болон хатгамлын detail-р дахин тайлбарласан demo archive record.',
    moodMn: ['editorial', 'өв соёл', 'minimal tailoring', 'heritage-modern'],
    tags: ['2024', 'SS2024', 'heritage', 'modern', 'дээл', 'торго', 'хатгамал', 'mongol fashion'],
    latinAliases: ['ov soyol modern', 'heritage modern', 'mongol fashion 2024'],
    looks: [
      {
        number: 1,
        title: 'Collar-line blazer',
        descriptionMn: 'Дээлэн захны шугамыг blazer silhouette дээр зөөлөн оруулсан look.',
        materialsMn: ['ноос', 'торго'],
        tags: ['blazer', 'deel collar', 'tailoring'],
      },
      {
        number: 2,
        title: 'Minimal silk dress',
        descriptionMn: 'Хатгамал ирмэгтэй minimal торгон даашинз.',
        materialsMn: ['торго'],
        tags: ['dress', 'silk', 'embroidery'],
      },
      {
        number: 3,
        title: 'Wide trouser set',
        descriptionMn: 'Өргөн өмд, богино structured top-той heritage-modern иж бүрдэл.',
        materialsMn: ['хөвөн', 'ноос'],
        tags: ['trousers', 'set', 'modern'],
      },
    ],
  },
  {
    id: 'demo-collection-custom-atelier-fw2024',
    slug: 'anoce-custom-atelier-fw2024',
    title: 'Custom Atelier FW 2024',
    titleMn: 'Захиалгат atelier FW 2024',
    designerName: 'Anoce Editorial Archive',
    designerSlug: 'anoce-editorial-archive',
    season: 'FW',
    seasonMn: 'Намар/Өвөл',
    year: 2024,
    category: 'made-to-order',
    summaryMn:
      'Захиалгат хэмжээ, made-to-order, ёслолын болон өдөр тутмын premium tailoring-ийг тайлбарлах demo archive record.',
    moodMn: ['boutique', 'захиалгат', 'tailored', 'formal'],
    tags: ['2024', 'FW2024', 'custom', 'made-to-order', 'захиалгат', 'tailoring', 'formalwear'],
    latinAliases: ['zahialgat huvtsas', 'custom fit', 'made to order mongolia'],
    looks: [
      {
        number: 1,
        title: 'Made-to-order coat',
        descriptionMn: 'Биеийн хэмжээнд тааруулсан ноосон пальто.',
        materialsMn: ['ноос', 'ноолуур'],
        tags: ['coat', 'custom fit'],
      },
      {
        number: 2,
        title: 'Formal deel suit',
        descriptionMn: 'Дээлэн энгэртэй formal suit, ёслолын орчинд зориулсан.',
        materialsMn: ['ноосон костюмны даавуу'],
        tags: ['formalwear', 'deel suit'],
      },
      {
        number: 3,
        title: 'Boutique dress',
        descriptionMn: 'Захиалгаар өөрчилж болох minimal даашинз.',
        materialsMn: ['сатин', 'торго'],
        tags: ['dress', 'made-to-order'],
      },
    ],
  },
]
