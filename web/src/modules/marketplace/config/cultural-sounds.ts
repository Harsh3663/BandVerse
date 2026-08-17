import type { CulturalSoundCategory, CulturalSoundDimension } from "../types";

function defineCategory(category: CulturalSoundCategory): CulturalSoundCategory {
  return category;
}

const video = (title: string, query: string) => ({
  title,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
});

export const culturalSoundDimensions: readonly {
  id: CulturalSoundDimension;
  label: string;
  description: string;
}[] = [
  {
    id: "region",
    label: "Region",
    description: "Broad cultural regions across the Indian subcontinent.",
  },
  {
    id: "state",
    label: "State",
    description: "State-specific folk, classical, and contemporary traditions.",
  },
  {
    id: "festival",
    label: "Festival",
    description: "Seasonal celebrations and community festival soundscapes.",
  },
  {
    id: "instrument",
    label: "Instrument",
    description: "Signature instruments that define a performance tradition.",
  },
  {
    id: "occasion",
    label: "Occasion",
    description: "Booking contexts from weddings to corporate galas.",
  },
  {
    id: "mood",
    label: "Mood",
    description: "Emotional palettes for curated guest experiences.",
  },
  {
    id: "tradition",
    label: "Tradition",
    description: "Dance, devotional, and folk performance lineages.",
  },
];

export const culturalSoundCategories: readonly CulturalSoundCategory[] = [
  defineCategory({
    slug: "north-india",
    label: "North India",
    dimension: "region",
    tagline: "Bhangra, qawwali, and wedding brass energy.",
    description:
      "From Punjabi baraats to Delhi wedding receptions, North India brings high-energy vocals, dhol, and brass-forward ensembles.",
    history:
      "North Indian performance culture blends courtly classical forms with folk celebrations. Wedding processions, Sufi gatherings, and festival nights share a preference for rhythm-led ensembles and call-and-response vocals.",
    videos: [video("North Indian wedding baraat", "punjabi dhol baraat live")],
    featuredArtistIds: [
      "band-the-groove-collective",
      "traditional-rajasthan-lok-kalakar",
    ],
    matchCriteria: {
      genreIds: ["bhangra", "folk", "bollywood"],
      states: ["Delhi", "Punjab"],
    },
  }),
  defineCategory({
    slug: "south-india",
    label: "South India",
    dimension: "region",
    tagline: "Carnatic depth and percussion-forward ensembles.",
    description:
      "South India showcases mridangam, veena, and classical vocals alongside contemporary fusion for temple and concert settings.",
    history:
      "Carnatic and regional folk traditions anchor South Indian stages. Temple festivals, college fests, and hotel residencies often pair classical rigor with accessible repertoire.",
    videos: [video("Carnatic ensemble live", "carnatic mridangam live performance")],
    featuredArtistIds: ["artist-arjun-subramaniam", "artist-meera-iyer"],
    matchCriteria: {
      genreIds: ["classical", "folk", "fusion"],
      states: ["Tamil Nadu", "Kerala", "Karnataka"],
    },
  }),
  defineCategory({
    slug: "west-india",
    label: "West India",
    dimension: "region",
    tagline: "Garba nights, lavani, and coastal fusion.",
    description:
      "Maharashtra and Gujarat contribute garba, dhol-tasha pathaks, lavani, and Bollywood-ready bands for festive crowds.",
    history:
      "Western India’s festival calendar drives much of its live-music demand. Navratri mandaps, Ganesh immersions, and monsoon corporate events all call for distinct rhythmic signatures.",
    videos: [video("Garba live band", "garba live dhol performance")],
    featuredArtistIds: [
      "band-taal-vidroha-pathak",
      "traditional-shivgarjana-dhol-pathak",
      "traditional-sanskruti-lezim-pathak",
    ],
    matchCriteria: {
      genreIds: ["garba", "lavani", "folk"],
      states: ["Maharashtra", "Goa"],
    },
  }),
  defineCategory({
    slug: "punjab",
    label: "Punjab",
    dimension: "state",
    tagline: "Bhangra, Punjabi dhol, and wedding brass.",
    description:
      "Punjab’s performance identity is built around dhol, energetic vocals, and baraat-ready ensembles.",
    history:
      "Punjabi folk and bhangra evolved from harvest celebrations into a global wedding staple. Live bands combine dhol, tumbi-inspired arrangements, and Bollywood hooks.",
    videos: [video("Punjabi dhol baraat", "punjabi dhol baraat live")],
    featuredArtistIds: ["band-the-groove-collective", "artist-vivaan-singh"],
    matchCriteria: {
      languageIds: ["punjabi", "hindi"],
      genreIds: ["bhangra", "bollywood"],
    },
  }),
  defineCategory({
    slug: "rajasthan",
    label: "Rajasthan",
    dimension: "state",
    tagline: "Ghoomar, sarangi, and royal folk ensembles.",
    description:
      "Rajasthani performers bring desert folk, ghoomar dance, and sarangi-led storytelling for palace weddings and cultural festivals.",
    history:
      "Rajasthan’s lok kalakar communities preserve repertoires passed through generations of court and village performance. Sarangi, khartal, and dholak anchor many ensembles.",
    videos: [video("Rajasthani folk ensemble", "rajasthani folk sarangi live")],
    featuredArtistIds: ["traditional-rajasthan-lok-kalakar", "artist-sharmila-bose"],
    matchCriteria: {
      languageIds: ["rajasthani", "hindi"],
      genreIds: ["folk", "ghoomar"],
    },
  }),
  defineCategory({
    slug: "maharashtra",
    label: "Maharashtra",
    dimension: "state",
    tagline: "Lavani, dhol-tasha, and festival pathaks.",
    description:
      "Maharashtra is home to lavani, lezim, and the thunderous dhol-tasha tradition tied to Ganesh and Navratri celebrations.",
    history:
      "From tamasha stages to Ganesh visarjan processions, Maharashtra’s performance culture is deeply community-led. Pathak groups train year-round for synchronized street performances.",
    videos: [video("Dhol Tasha pathak", "dhol tasha pathak live pune")],
    featuredArtistIds: [
      "traditional-shivgarjana-dhol-pathak",
      "traditional-nashik-dhunkiraj-pathak",
      "band-taal-vidroha-pathak",
    ],
    matchCriteria: { languageIds: ["marathi", "hindi"], genreIds: ["lavani", "folk"] },
  }),
  defineCategory({
    slug: "kerala",
    label: "Kerala",
    dimension: "state",
    tagline: "Temple percussion and coastal classical fusion.",
    description:
      "Kerala’s stages feature chenda-adjacent percussion traditions, classical vocals, and relaxed resort-ready fusion sets.",
    history:
      "Temple festivals and Theyyam-adjacent folk rhythms influence Kerala’s live-music briefs. Contemporary performers often blend Malayalam repertoire with jazz and acoustic arrangements.",
    videos: [video("Kerala temple percussion", "kerala temple chenda live")],
    featuredArtistIds: ["artist-meera-iyer", "band-confluence"],
    matchCriteria: {
      languageIds: ["malayalam", "english"],
      genreIds: ["classical", "fusion"],
    },
  }),
  defineCategory({
    slug: "tamil-nadu",
    label: "Tamil Nadu",
    dimension: "state",
    tagline: "Carnatic, bharatanatyam, and campus rock.",
    description:
      "Tamil Nadu spans Carnatic concerts, bharatanatyam accompanists, and high-energy college fest bands.",
    history:
      "Chennai’s December music season and temple utsavams sustain classical demand, while campuses and clubs drive indie and rock bookings.",
    videos: [video("Bharatanatyam live orchestra", "bharatanatyam live mridangam")],
    featuredArtistIds: ["artist-arjun-subramaniam", "band-anthem-rising"],
    matchCriteria: { languageIds: ["tamil", "english"], genreIds: ["classical", "rock"] },
  }),
  defineCategory({
    slug: "bengal",
    label: "Bengal",
    dimension: "state",
    tagline: "Baul, rabindra sangeet, and jazz evenings.",
    description:
      "Bengal’s performance culture spans baul mysticism, poetic song, and Kolkata’s enduring jazz club scene.",
    history:
      "From Tagore-era song to modern fusion cafés, Bengal prizes lyrical depth. Baul performers and jazz quartets share an emphasis on intimacy and storytelling.",
    videos: [video("Baul folk performance", "baul folk live kolkata")],
    featuredArtistIds: ["artist-sharmila-bose", "band-the-blue-room-quartet"],
    matchCriteria: {
      languageIds: ["bengali", "hindi"],
      genreIds: ["folk", "jazz", "baul"],
    },
  }),
  defineCategory({
    slug: "garba",
    label: "Garba",
    dimension: "festival",
    tagline: "Community dance circles with live percussion.",
    description:
      "Garba programmes need rhythm-led ensembles, responsive vocalists, and stamina for multi-hour dance floors.",
    history:
      "Garba grew from Gujarat’s Navratri observances into one of India’s largest seasonal live-music categories. Live bands cue transitions between traditional and Bollywood garba.",
    videos: [video("Live garba night", "live garba band navratri")],
    featuredArtistIds: ["band-the-groove-collective", "band-taal-vidroha-pathak"],
    matchCriteria: { genreIds: ["garba", "folk"], eventTypeIds: ["garba", "navratri"] },
  }),
  defineCategory({
    slug: "navratri",
    label: "Navratri",
    dimension: "festival",
    tagline: "Multi-night dandiya and garba programmes.",
    description:
      "Navratri bookings often span several evenings with escalating energy, traditional openings, and peak-night Bollywood sets.",
    history:
      "Navratri mandaps and corporate campus celebrations drive recurring demand for bands that can sustain high BPM sets across consecutive nights.",
    videos: [video("Navratri live band", "navratri live dandiya band")],
    featuredArtistIds: [
      "band-the-groove-collective",
      "traditional-shivgarjana-dhol-pathak",
    ],
    matchCriteria: { genreIds: ["garba", "folk"], eventTypeIds: ["navratri", "garba"] },
  }),
  defineCategory({
    slug: "ganesh-festival",
    label: "Ganesh Festival",
    dimension: "festival",
    tagline: "Procession percussion and devotional evenings.",
    description:
      "Ganesh festival performances combine pathak drumming, lezim troupes, and devotional vocalists for mandal programmes.",
    history:
      "Maharashtra’s Ganesh utsav transformed from a freedom-era community movement into a city-wide performance calendar with elaborate sonic processions.",
    videos: [video("Ganesh festival pathak", "ganesh festival dhol tasha live")],
    featuredArtistIds: [
      "traditional-shivgarjana-dhol-pathak",
      "traditional-sanskruti-lezim-pathak",
    ],
    matchCriteria: { eventTypeIds: ["temple", "concert"], genreIds: ["folk", "bhajan"] },
  }),
  defineCategory({
    slug: "singer",
    label: "Singer",
    dimension: "instrument",
    tagline: "Lead vocalists for every occasion.",
    description:
      "Wedding singers, playback-style vocalists, and multilingual performers for curated guest experiences.",
    history:
      "Vocal-led bookings remain the most requested category on BandVerse, spanning ghazals, Bollywood, devotional, and indie sets.",
    videos: [video("Live wedding singer", "live wedding singer hindi")],
    featuredArtistIds: ["artist-ananya-rao", "artist-kabir-mehta", "artist-vivaan-singh"],
    matchCriteria: { categoryIds: ["vocalist"], instrumentIds: ["vocals"] },
  }),
  defineCategory({
    slug: "band",
    label: "Band",
    dimension: "instrument",
    tagline: "Full-stage ensembles for high-energy events.",
    description:
      "Cover bands, wedding bands, and fusion groups built for dance floors and large audiences.",
    history:
      "Indian wedding and corporate bands evolved from hotel lounge residencies into specialized ensembles with dedicated production riders.",
    videos: [video("Live wedding band", "live wedding band india")],
    featuredArtistIds: [
      "band-the-groove-collective",
      "band-sunset-boulevard",
      "band-confluence",
    ],
    matchCriteria: { categoryIds: ["band"], kind: "band" },
  }),
  defineCategory({
    slug: "dj",
    label: "DJ",
    dimension: "instrument",
    tagline: "Club, wedding, and reception DJ sets.",
    description:
      "DJs for sangeet after-parties, club nights, and curated reception playlists with live mashups.",
    history:
      "DJ-led bookings surged with sangeet-after-party culture and hotel club residencies across metro cities.",
    videos: [video("Wedding DJ set", "wedding dj live india")],
    featuredArtistIds: ["artist-ritika-deshmukh"],
    matchCriteria: { categoryIds: ["dj"], kind: "dj" },
  }),
  defineCategory({
    slug: "tabla",
    label: "Tabla",
    dimension: "instrument",
    tagline: "Hindustani rhythm for classical and fusion.",
    description:
      "Tabla accompanists for mehfils, corporate soirées, and fusion ensembles.",
    history:
      "Tabla pedagogy from the gharana tradition continues to inform contemporary fusion and Bollywood session work.",
    videos: [video("Tabla solo live", "tabla solo live performance")],
    featuredArtistIds: ["band-confluence", "traditional-manoos-cultural-ensemble"],
    matchCriteria: { instrumentIds: ["tabla"] },
  }),
  defineCategory({
    slug: "sitar",
    label: "Sitar",
    dimension: "instrument",
    tagline: "Meditative ragas and fusion textures.",
    description:
      "Sitar performers for classical recitals, hotel lobbies, and ambient wedding ceremonies.",
    history:
      "The sitar’s global profile through twentieth-century maestros still shapes luxury and classical booking briefs.",
    videos: [video("Sitar recital", "sitar live raga performance")],
    featuredArtistIds: ["band-confluence"],
    matchCriteria: { instrumentIds: ["sitar"] },
  }),
  defineCategory({
    slug: "sarod",
    label: "Sarod",
    dimension: "instrument",
    tagline: "Deep resonant strings for classical soirées.",
    description:
      "Sarod artists for intimate classical evenings and cultural festival programmes.",
    history:
      "The sarod’s fretless design produces the sustained tones favored in Hindustani alap-jor-jhala presentations.",
    videos: [video("Sarod recital", "sarod live classical india")],
    featuredArtistIds: ["artist-kabir-mehta"],
    matchCriteria: { instrumentIds: ["sarangi"], genreIds: ["classical"] },
  }),
  defineCategory({
    slug: "santoor",
    label: "Santoor",
    dimension: "instrument",
    tagline: "Hammered dulcimer textures for elegant evenings.",
    description:
      "Santoor performers for hotel residencies, classical concerts, and ambient corporate dinners.",
    history:
      "Kashmiri santoor traditions entered the Hindustani concert stage in the twentieth century and remain popular for instrumental showcases.",
    videos: [video("Santoor live", "santoor live classical")],
    featuredArtistIds: ["artist-kabir-mehta"],
    matchCriteria: { genreIds: ["classical", "instrumental"] },
  }),
  defineCategory({
    slug: "veena",
    label: "Veena",
    dimension: "instrument",
    tagline: "Carnatic string tradition for temple and concert halls.",
    description:
      "Veena artists for South Indian classical programmes and devotional evenings.",
    history:
      "The veena is among the oldest string traditions referenced in Sanskrit performance treatises.",
    videos: [video("Veena recital", "veena carnatic live")],
    featuredArtistIds: ["artist-meera-iyer"],
    matchCriteria: { instrumentIds: ["veena"], genreIds: ["classical"] },
  }),
  defineCategory({
    slug: "mridangam",
    label: "Mridangam",
    dimension: "instrument",
    tagline: "Carnatic percussion anchor.",
    description:
      "Mridangam artists for kutcheris, bharatanatyam arangetrams, and fusion projects.",
    history:
      "Mridangam syllables (konnakol) structure Carnatic rhythm and remain essential for classical and dance accompaniment.",
    videos: [video("Mridangam solo", "mridangam solo live")],
    featuredArtistIds: ["artist-arjun-subramaniam"],
    matchCriteria: { instrumentIds: ["mridangam"], genreIds: ["classical"] },
  }),
  defineCategory({
    slug: "bansuri",
    label: "Bansuri",
    dimension: "instrument",
    tagline: "Bamboo flute for meditative and folk palettes.",
    description:
      "Bansuri performers for temple mornings, cafe sets, and fusion ensembles.",
    history:
      "Bansuri traditions span folk, light classical, and film music, making the instrument versatile for varied booking contexts.",
    videos: [video("Bansuri live", "bansuri live raga")],
    featuredArtistIds: ["traditional-manoos-cultural-ensemble"],
    matchCriteria: { instrumentIds: ["bansuri"] },
  }),
  defineCategory({
    slug: "shehnai",
    label: "Shehnai",
    dimension: "instrument",
    tagline: "Ceremonial wind for weddings and temple events.",
    description: "Shehnai players for baraat entries, pheras, and auspicious openings.",
    history:
      "Shehnai is historically associated with North Indian wedding ceremonies and temple announcements.",
    videos: [video("Shehnai wedding", "shehnai live wedding baraat")],
    featuredArtistIds: ["artist-rohan-kapoor"],
    matchCriteria: { instrumentIds: ["shehnai"], eventTypeIds: ["wedding"] },
  }),
  defineCategory({
    slug: "harmonium",
    label: "Harmonium",
    dimension: "instrument",
    tagline: "Devotional and ghazal accompaniment.",
    description:
      "Harmonium players for bhajan sandhyas, qawwali, and mehfil-style gatherings.",
    history:
      "The harmonium became central to twentieth-century devotional and ghazal performance across North India.",
    videos: [video("Harmonium bhajan", "harmonium bhajan live")],
    featuredArtistIds: ["artist-rohan-kapoor"],
    matchCriteria: { instrumentIds: ["harmonium"], genreIds: ["bhajan", "qawwali"] },
  }),
  defineCategory({
    slug: "qawwali",
    label: "Qawwali",
    dimension: "tradition",
    tagline: "Sufi call-and-response with harmonium and tabla.",
    description:
      "Qawwali ensembles for mehfils, corporate heritage evenings, and festival stages.",
    history:
      "Qawwali performance at Sufi shrines shaped a repertoire emphasizing repetition, improvisation, and ecstatic crescendo.",
    videos: [video("Qawwali live", "qawwali live performance")],
    featuredArtistIds: ["artist-rohan-kapoor", "artist-kabir-mehta"],
    matchCriteria: { genreIds: ["qawwali"] },
  }),
  defineCategory({
    slug: "bhajan",
    label: "Bhajan",
    dimension: "tradition",
    tagline: "Devotional song circles and temple programmes.",
    description:
      "Bhajan performers for temple festivals, house warmings, and corporate heritage days.",
    history:
      "Bhajan traditions span regional languages and bhakti poetry, often performed with harmonium, tabla, and kartal.",
    videos: [video("Bhajan sandhya", "bhajan sandhya live")],
    featuredArtistIds: ["artist-rohan-kapoor"],
    matchCriteria: { genreIds: ["bhajan", "devotional"], eventTypeIds: ["temple"] },
  }),
  defineCategory({
    slug: "dhol",
    label: "Dhol",
    dimension: "instrument",
    tagline: "Double-headed drum for baraats and folk stages.",
    description:
      "Dhol players and pathak groups for weddings, festivals, and high-energy dance segments.",
    history:
      "The dhol anchors Punjabi folk, Maharashtra pathak culture, and Rajasthani folk ensembles.",
    videos: [video("Dhol pathak live", "dhol pathak live wedding")],
    featuredArtistIds: [
      "traditional-shivgarjana-dhol-pathak",
      "band-taal-vidroha-pathak",
    ],
    matchCriteria: { instrumentIds: ["dhol"] },
  }),
  defineCategory({
    slug: "punjabi-dhol",
    label: "Punjabi Dhol",
    dimension: "instrument",
    tagline: "Baraat-ready Punjabi percussion.",
    description:
      "Punjabi dhol specialists for baraat entries, sangeet segments, and bhangra breaks.",
    history:
      "Punjabi dhol technique emphasizes powerful bass strokes and syncopated patterns tailored for processional movement.",
    videos: [video("Punjabi dhol baraat", "punjabi dhol baraat live")],
    featuredArtistIds: ["band-the-groove-collective"],
    matchCriteria: { instrumentIds: ["dhol", "punjabi-dhol"], genreIds: ["bhangra"] },
  }),
  defineCategory({
    slug: "dhol-tasha",
    label: "Dhol Tasha",
    dimension: "instrument",
    tagline: "Maharashtra’s procession percussion tradition.",
    description:
      "Synchronized dhol-tasha pathaks for Ganesh visarjan, Navratri, and civic processions.",
    history:
      "Dhol-tasha pathak training emphasizes visual drill alongside thunderous unison rhythms.",
    videos: [video("Dhol tasha pathak", "dhol tasha pathak live")],
    featuredArtistIds: [
      "traditional-shivgarjana-dhol-pathak",
      "traditional-nashik-dhunkiraj-pathak",
    ],
    matchCriteria: { instrumentIds: ["dhol-tasha", "dhol"] },
  }),
  defineCategory({
    slug: "kathak",
    label: "Kathak",
    dimension: "tradition",
    tagline: "North Indian classical dance with live tabla.",
    description:
      "Kathak performers for mehfils, corporate heritage evenings, and wedding sangeets.",
    history:
      "Kathak evolved from storytelling traditions in North Indian courts, emphasizing intricate footwork and spins.",
    videos: [video("Kathak live", "kathak live tabla")],
    featuredArtistIds: ["artist-ananya-rao"],
    matchCriteria: { genreIds: ["kathak", "classical"] },
  }),
  defineCategory({
    slug: "bharatanatyam",
    label: "Bharatanatyam",
    dimension: "tradition",
    tagline: "Tamil classical dance with live carnatic ensemble.",
    description:
      "Bharatanatyam artists for arangetrams, temple festivals, and cultural showcases.",
    history:
      "Bharatanatyam’s margam repertoire structures solo performances with distinct narrative and abstract segments.",
    videos: [video("Bharatanatyam arangetram", "bharatanatyam live mridangam")],
    featuredArtistIds: ["artist-arjun-subramaniam"],
    matchCriteria: { genreIds: ["bharatanatyam", "classical"] },
  }),
  defineCategory({
    slug: "lavani",
    label: "Lavani",
    dimension: "tradition",
    tagline: "Maharashtra’s rhythmic song-and-dance tradition.",
    description:
      "Lavani troupes for festive evenings, cultural festivals, and traditional showcases.",
    history:
      "Lavani performance combines fast-paced dholki rhythms with expressive gesture and Marathi poetic lyric.",
    videos: [video("Lavani live", "lavani live performance")],
    featuredArtistIds: ["band-taal-vidroha-pathak", "traditional-sanskruti-lezim-pathak"],
    matchCriteria: { genreIds: ["lavani", "folk"] },
  }),
  defineCategory({
    slug: "ghoomar",
    label: "Ghoomar",
    dimension: "tradition",
    tagline: "Rajasthani circle dance with live folk ensemble.",
    description:
      "Ghoomar performers for palace weddings, mehfils, and destination celebrations.",
    history:
      "Ghoomar is traditionally performed by women in flowing ghagras, often accompanied by dholak and harmonium.",
    videos: [video("Ghoomar folk", "ghoomar rajasthani live")],
    featuredArtistIds: ["traditional-rajasthan-lok-kalakar"],
    matchCriteria: { genreIds: ["ghoomar", "folk"] },
  }),
  defineCategory({
    slug: "baul",
    label: "Baul",
    dimension: "tradition",
    tagline: "Bengal’s mystic wandering minstrels.",
    description:
      "Baul performers for intimate gatherings, cultural festivals, and poetry-forward evenings.",
    history:
      "Baul philosophy blends Vaishnav, Sufi, and tantric influences into minimalist ektara-led song.",
    videos: [video("Baul folk", "baul folk live kolkata")],
    featuredArtistIds: ["artist-sharmila-bose"],
    matchCriteria: { genreIds: ["baul", "folk"] },
  }),
  defineCategory({
    slug: "yakshagana",
    label: "Yakshagana",
    dimension: "tradition",
    tagline: "Karnataka’s night-long dance-drama tradition.",
    description:
      "Yakshagana troupes for cultural festivals, heritage evenings, and campus showcases.",
    history:
      "Yakshagana combines elaborate costume, percussion, and improvised dialogue in all-night village performances.",
    videos: [video("Yakshagana live", "yakshagana live performance")],
    featuredArtistIds: ["traditional-manoos-cultural-ensemble"],
    matchCriteria: { genreIds: ["folk", "classical"], states: ["Karnataka"] },
  }),
  defineCategory({
    slug: "magician",
    label: "Magician",
    dimension: "tradition",
    tagline: "Stage magic for family events and corporate offsites.",
    description:
      "Magicians and illusionists for birthday parties, gala dinners, and family day programmes.",
    history:
      "Stage magic in India blends street illusion heritage with contemporary corporate entertainment formats.",
    videos: [video("Stage magician India", "stage magician live show india")],
    featuredArtistIds: ["artist-ritika-deshmukh"],
    matchCriteria: { categoryIds: ["dj"] },
  }),
  defineCategory({
    slug: "anchor",
    label: "Anchor",
    dimension: "tradition",
    tagline: "Bilingual hosts for weddings and corporate stages.",
    description:
      "Anchors and emcees who coordinate flow between performances and audience segments.",
    history:
      "Professional anchoring became a distinct booking category as large-format Indian weddings adopted runway-style programming.",
    videos: [video("Wedding anchor", "wedding anchor live india")],
    featuredArtistIds: ["artist-ananya-rao"],
    matchCriteria: { categoryIds: ["vocalist"] },
  }),
  defineCategory({
    slug: "comedy",
    label: "Comedy",
    dimension: "tradition",
    tagline: "Stand-up and improv for corporate and college audiences.",
    description:
      "Comedy performers for offsites, college fests, and after-dinner entertainment.",
    history:
      "India’s stand-up scene expanded from English-language clubs into multilingual corporate and campus circuits.",
    videos: [video("Stand up comedy live", "stand up comedy live india")],
    featuredArtistIds: ["artist-vivaan-singh"],
    matchCriteria: { categoryIds: ["vocalist"] },
  }),
  defineCategory({
    slug: "poetry",
    label: "Poetry",
    dimension: "tradition",
    tagline: "Spoken word and mushaira-style evenings.",
    description:
      "Poetry performers for literary festivals, intimate salons, and corporate diversity programmes.",
    history:
      "Urdu mushaira and contemporary spoken word share a emphasis on live audience call-and-response.",
    videos: [video("Spoken word live", "spoken word poetry live india")],
    featuredArtistIds: ["artist-sharmila-bose", "artist-kabir-mehta"],
    matchCriteria: { genreIds: ["folk", "classical"] },
  }),
  defineCategory({
    slug: "wedding",
    label: "Wedding",
    dimension: "occasion",
    tagline: "Baraat to vidaai — every wedding moment scored.",
    description:
      "Wedding bookings span dhol pathaks, singers, bands, and classical ensembles across ceremonies.",
    history:
      "Indian weddings are multi-day performance programmes. Each ritual segment has distinct sonic requirements.",
    videos: [video("Indian wedding live band", "indian wedding live band")],
    featuredArtistIds: [
      "band-the-groove-collective",
      "traditional-shivgarjana-dhol-pathak",
    ],
    matchCriteria: { eventTypeIds: ["wedding", "reception"] },
  }),
  defineCategory({
    slug: "corporate",
    label: "Corporate",
    dimension: "occasion",
    tagline: "Award nights, launches, and gala dinners.",
    description:
      "Corporate bookings favor jazz, fusion, instrumental, and polished bilingual vocalists.",
    history:
      "Corporate entertainment matured with brand-conscious programming and strict timing requirements.",
    videos: [video("Corporate gala band", "corporate gala live band india")],
    featuredArtistIds: ["band-meridian-corporate-ensemble", "band-the-blue-room-quartet"],
    matchCriteria: { eventTypeIds: ["corporate"] },
  }),
  defineCategory({
    slug: "temple",
    label: "Temple",
    dimension: "occasion",
    tagline: "Devotional programmes and utsav performances.",
    description:
      "Temple festivals require bhajan, classical, and folk performers comfortable with sacred contexts.",
    history:
      "Temple utsavams sustain regional classical and folk repertoires across India.",
    videos: [video("Temple bhajan programme", "temple bhajan live")],
    featuredArtistIds: ["artist-rohan-kapoor", "traditional-manoos-cultural-ensemble"],
    matchCriteria: { eventTypeIds: ["temple"] },
  }),
  defineCategory({
    slug: "luxury-hotel",
    label: "Luxury Hotel",
    dimension: "occasion",
    tagline: "Lobby residencies, brunches, and black-tie evenings.",
    description:
      "Hotel bookings favor instrumental elegance, jazz trios, and multilingual vocalists.",
    history:
      "Luxury hospitality drove demand for discreet, repertoire-flexible performers with consistent grooming and punctuality.",
    videos: [video("Hotel lobby jazz", "hotel lobby live jazz india")],
    featuredArtistIds: ["band-the-blue-room-quartet", "artist-kabir-mehta"],
    matchCriteria: { eventTypeIds: ["hotel", "cafe"] },
  }),
  defineCategory({
    slug: "celebratory",
    label: "Celebratory",
    dimension: "mood",
    tagline: "High-energy sets for dance floors and processions.",
    description:
      "Celebratory moods call for dhol, brass, Bollywood hooks, and crowd-engagement specialists.",
    history:
      "Celebratory programming prioritizes BPM, visual spectacle, and audience participation.",
    videos: [video("Celebration live band", "celebration live band india")],
    featuredArtistIds: ["band-the-groove-collective", "traditional-royal-banjo-party"],
    matchCriteria: { genreIds: ["bollywood", "bhangra", "folk"] },
  }),
  defineCategory({
    slug: "devotional-mood",
    label: "Devotional",
    dimension: "mood",
    tagline: "Reverent, meditative, and spiritually grounded.",
    description:
      "Devotional moods suit bhajan, classical alap, and temple-appropriate repertoire.",
    history:
      "Devotional performance contexts require sensitivity to ritual timing and sacred space norms.",
    videos: [video("Devotional live", "devotional bhajan live")],
    featuredArtistIds: ["artist-rohan-kapoor"],
    matchCriteria: { genreIds: ["bhajan", "devotional", "classical"] },
  }),
  defineCategory({
    slug: "elegant",
    label: "Elegant",
    dimension: "mood",
    tagline: "Refined ambience for fine dining and receptions.",
    description:
      "Elegant moods favor jazz, instrumental, and understated vocal performances.",
    history:
      "Fine-dining and luxury reception programming influenced a distinct booking brief emphasizing volume control and repertoire curation.",
    videos: [video("Elegant jazz trio", "elegant jazz trio live")],
    featuredArtistIds: ["band-the-blue-room-quartet", "artist-kabir-mehta"],
    matchCriteria: { genreIds: ["jazz", "instrumental", "classical"] },
  }),
  defineCategory({
    slug: "energetic",
    label: "Energetic",
    dimension: "mood",
    tagline: "Peak-hour energy for festivals and sangeets.",
    description: "Energetic moods need bands and pathaks that can sustain high BPM sets.",
    history:
      "Sangeet and festival peak segments often book dedicated high-energy acts separate from dinner ambience.",
    videos: [video("Energetic sangeet band", "sangeet live band india")],
    featuredArtistIds: ["band-sunset-boulevard", "band-electric-static"],
    matchCriteria: { genreIds: ["rock", "bollywood", "edm"] },
  }),
];

export function getCulturalSoundCategory(
  slug: string,
): CulturalSoundCategory | undefined {
  return culturalSoundCategories.find((category) => category.slug === slug);
}

export function listCulturalSoundCategoriesByDimension(
  dimension: CulturalSoundDimension,
): readonly CulturalSoundCategory[] {
  return culturalSoundCategories.filter((category) => category.dimension === dimension);
}

export const culturalSoundSlugs = culturalSoundCategories.map(({ slug }) => slug);
