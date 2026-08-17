import type { ExperiencePackage } from "../types";

function definePackage(experience: ExperiencePackage): ExperiencePackage {
  return experience;
}

export const experiencePackages: readonly ExperiencePackage[] = [
  definePackage({
    slug: "punjabi-wedding",
    title: "Punjabi Wedding",
    tagline: "Baraat dhol, sangeet band, and reception finale.",
    description:
      "A full-day Punjabi wedding soundtrack with procession percussion, bilingual sangeet sets, and a peak-hour reception band.",
    artistIds: [
      "traditional-shivgarjana-dhol-pathak",
      "band-the-groove-collective",
      "artist-vivaan-singh",
    ],
    timeline: [
      {
        time: "10:00",
        title: "Baraat entry",
        description: "Punjabi dhol pathak leads the procession with synchronized breaks.",
        performerIds: ["traditional-shivgarjana-dhol-pathak"],
      },
      {
        time: "14:00",
        title: "Sangeet segment",
        description: "Bollywood and bhangra medleys with live requests.",
        performerIds: ["artist-vivaan-singh"],
      },
      {
        time: "20:00",
        title: "Reception headline set",
        description: "Full-band dance set with encore and couple entry cue.",
        performerIds: ["band-the-groove-collective"],
      },
    ],
    equipment: [
      "PA system with subwoofers",
      "Wireless vocal mics",
      "Procession drum kit",
      "Stage monitors",
    ],
    suggestedBudget: { amount: 285_000, currency: "INR" },
    recommendedVenueId: "venue-gulmohar-bagh",
    durationMinutes: 720,
    eventTypeId: "wedding",
    genreIds: ["bhangra", "bollywood", "folk"],
  }),
  definePackage({
    slug: "royal-rajasthani-wedding",
    title: "Royal Rajasthani Wedding",
    tagline: "Palace folk ensemble with ghoomar and sarangi.",
    description:
      "Rajasthani lok kalakar, ghoomar dancers, and ambient instrumental sets for a palace wedding weekend.",
    artistIds: [
      "traditional-rajasthan-lok-kalakar",
      "artist-sharmila-bose",
      "artist-kabir-mehta",
    ],
    timeline: [
      {
        time: "11:00",
        title: "Welcome folk ensemble",
        description: "Sarangi and dholak welcome guests at the palace courtyard.",
        performerIds: ["traditional-rajasthan-lok-kalakar"],
      },
      {
        time: "17:00",
        title: "Ghoomar showcase",
        description: "Traditional ghoomar with live folk chorus.",
        performerIds: ["traditional-rajasthan-lok-kalakar"],
      },
      {
        time: "20:30",
        title: "Moonlit classical interlude",
        description: "Instrumental ragas for dinner ambience.",
        performerIds: ["artist-kabir-mehta"],
      },
    ],
    equipment: [
      "Folk percussion kit",
      "Ambient PA",
      "Traditional costumes",
      "Stage torches",
    ],
    suggestedBudget: { amount: 220_000, currency: "INR" },
    recommendedVenueId: "venue-amber-palace-hotel",
    durationMinutes: 600,
    eventTypeId: "wedding",
    genreIds: ["folk", "ghoomar", "classical"],
  }),
  definePackage({
    slug: "luxury-reception",
    title: "Luxury Reception",
    tagline: "Jazz trio, bilingual vocalist, and curated ambience.",
    description:
      "An elegant reception package with lobby jazz, cocktail instrumental sets, and a polished headline vocalist.",
    artistIds: ["band-the-blue-room-quartet", "artist-ananya-rao", "artist-kabir-mehta"],
    timeline: [
      {
        time: "18:00",
        title: "Cocktail jazz trio",
        description: "Instrumental standards and soft Bollywood instrumentals.",
        performerIds: ["band-the-blue-room-quartet"],
      },
      {
        time: "20:00",
        title: "Couple entry cue",
        description: "Custom arrangement with live strings and vocals.",
        performerIds: ["artist-ananya-rao"],
      },
      {
        time: "21:00",
        title: "Dinner ambience",
        description: "Low-volume classical fusion for seated service.",
        performerIds: ["artist-kabir-mehta"],
      },
    ],
    equipment: ["Compact jazz PA", "Piano or keyboard", "Ambient lighting control"],
    suggestedBudget: { amount: 165_000, currency: "INR" },
    recommendedVenueId: "venue-amber-palace-hotel",
    durationMinutes: 300,
    eventTypeId: "reception",
    genreIds: ["jazz", "classical", "bollywood"],
  }),
  definePackage({
    slug: "corporate-gala",
    title: "Corporate Gala",
    tagline: "Award-night band with polished bilingual hosting.",
    description:
      "A corporate-ready gala package with strict timing cues, instrumental walk-on music, and a headline fusion band.",
    artistIds: ["band-meridian-corporate-ensemble", "artist-ananya-rao"],
    timeline: [
      {
        time: "18:30",
        title: "Guest arrival instrumental",
        description: "Light fusion instrumentals during registration.",
        performerIds: ["band-meridian-corporate-ensemble"],
      },
      {
        time: "19:30",
        title: "Award ceremony cues",
        description: "Timed stings and walk-on music coordinated with AV.",
        performerIds: ["band-meridian-corporate-ensemble"],
      },
      {
        time: "21:00",
        title: "Headline celebration set",
        description: "45-minute dance set with bilingual MC support.",
        performerIds: ["artist-ananya-rao", "band-meridian-corporate-ensemble"],
      },
    ],
    equipment: ["Corporate PA", "IEM pack", "Timed cue sheet", "Backup wireless mics"],
    suggestedBudget: { amount: 195_000, currency: "INR" },
    recommendedVenueId: "venue-tech-park-auditorium",
    durationMinutes: 240,
    eventTypeId: "corporate",
    genreIds: ["jazz", "fusion", "instrumental"],
  }),
  definePackage({
    slug: "sufi-night",
    title: "Sufi Night",
    tagline: "Qawwali ensemble with harmonium and tabla.",
    description:
      "An intimate Sufi mehfil with qawwali repertoire, harmonium accompaniment, and audience participation segments.",
    artistIds: ["artist-rohan-kapoor", "artist-kabir-mehta", "band-confluence"],
    timeline: [
      {
        time: "19:00",
        title: "Opening alap",
        description: "Instrumental prelude setting a meditative tone.",
        performerIds: ["artist-kabir-mehta"],
      },
      {
        time: "19:45",
        title: "Qawwali set",
        description: "Call-and-response qawwali with harmonium and tabla.",
        performerIds: ["artist-rohan-kapoor"],
      },
      {
        time: "21:00",
        title: "Fusion crescendo",
        description: "Controlled crescendo with guest participation.",
        performerIds: ["band-confluence"],
      },
    ],
    equipment: ["Harmonium", "Tabla kit", "Intimate PA", "Floor cushions"],
    suggestedBudget: { amount: 125_000, currency: "INR" },
    recommendedVenueId: "venue-banyan-table",
    durationMinutes: 180,
    eventTypeId: "private-party",
    genreIds: ["qawwali", "sufi", "classical"],
  }),
  definePackage({
    slug: "garba-night",
    title: "Garba Night",
    tagline: "Live garba band with dhol and responsive vocals.",
    description:
      "A Navratri-ready garba night with traditional openings, peak-hour Bollywood garba, and synchronized dhol breaks.",
    artistIds: ["band-the-groove-collective", "band-taal-vidroha-pathak"],
    timeline: [
      {
        time: "18:30",
        title: "Traditional garba opening",
        description: "Folk garba with live dholak and call vocals.",
        performerIds: ["band-taal-vidroha-pathak"],
      },
      {
        time: "20:00",
        title: "Peak garba set",
        description: "High-energy garba with Bollywood transitions.",
        performerIds: ["band-the-groove-collective"],
      },
      {
        time: "22:00",
        title: "Closing dandiya medley",
        description: "Fast dandiya segment with encore.",
        performerIds: ["band-the-groove-collective"],
      },
    ],
    equipment: ["Garba PA", "Dhol kit", "Stage monitors", "Wireless headset mic"],
    suggestedBudget: { amount: 145_000, currency: "INR" },
    recommendedVenueId: "venue-tech-park-auditorium",
    durationMinutes: 270,
    eventTypeId: "garba",
    genreIds: ["garba", "folk", "bollywood"],
  }),
  definePackage({
    slug: "temple-festival",
    title: "Temple Festival",
    tagline: "Bhajan sandhya with classical interludes.",
    description:
      "A temple utsav programme with bhajan, classical vocals, and folk percussion suited for sacred contexts.",
    artistIds: ["artist-rohan-kapoor", "traditional-manoos-cultural-ensemble"],
    timeline: [
      {
        time: "17:00",
        title: "Bhajan sandhya",
        description: "Devotional song circle with harmonium and tabla.",
        performerIds: ["artist-rohan-kapoor"],
      },
      {
        time: "19:00",
        title: "Classical interlude",
        description: "Bansuri and tabla for temple courtyard ambience.",
        performerIds: ["traditional-manoos-cultural-ensemble"],
      },
    ],
    equipment: ["Devotional PA", "Harmonium", "Tabla", "Minimal stage wash"],
    suggestedBudget: { amount: 85_000, currency: "INR" },
    recommendedVenueId: "venue-gulmohar-bagh",
    durationMinutes: 180,
    eventTypeId: "temple",
    genreIds: ["bhajan", "classical", "folk"],
  }),
  definePackage({
    slug: "acoustic-cafe",
    title: "Acoustic Cafe",
    tagline: "Intimate singer-songwriter and acoustic duo.",
    description:
      "A relaxed cafe residency package with two acoustic sets and audience requests.",
    artistIds: ["artist-kabir-mehta", "artist-meera-iyer"],
    timeline: [
      {
        time: "19:00",
        title: "First acoustic set",
        description: "Indie and acoustic originals with Hindi covers.",
        performerIds: ["artist-kabir-mehta"],
      },
      {
        time: "20:30",
        title: "Second set with requests",
        description: "Bilingual acoustic set with guest requests.",
        performerIds: ["artist-meera-iyer"],
      },
    ],
    equipment: ["Compact acoustic PA", "DI boxes", "Stage stool", "Warm wash lighting"],
    suggestedBudget: { amount: 45_000, currency: "INR" },
    recommendedVenueId: "venue-banyan-table",
    durationMinutes: 150,
    eventTypeId: "cafe",
    genreIds: ["acoustic", "indie", "folk"],
  }),
  definePackage({
    slug: "jazz-evening",
    title: "Jazz Evening",
    tagline: "Blue Note-style quartet with standards and fusion.",
    description:
      "A jazz club evening with a full quartet, guest vocalist spot, and late-night jam segment.",
    artistIds: ["band-the-blue-room-quartet", "artist-sharmila-bose"],
    timeline: [
      {
        time: "20:00",
        title: "Jazz standards set",
        description: "Instrumental standards and soft vocal features.",
        performerIds: ["band-the-blue-room-quartet"],
      },
      {
        time: "21:30",
        title: "Guest vocalist feature",
        description: "Bilingual jazz and blues selections.",
        performerIds: ["artist-sharmila-bose"],
      },
    ],
    equipment: ["Club PA", "Upright bass DI", "Piano", "Stage monitors"],
    suggestedBudget: { amount: 95_000, currency: "INR" },
    recommendedVenueId: "venue-blue-note-club",
    durationMinutes: 180,
    eventTypeId: "concert",
    genreIds: ["jazz", "blues", "fusion"],
  }),
  definePackage({
    slug: "bollywood-night",
    title: "Bollywood Night",
    tagline: "Cover band with live requests and DJ handoff.",
    description:
      "A Bollywood-focused dance night with live band sets and a DJ after-party handoff.",
    artistIds: ["band-sunset-boulevard", "artist-ritika-deshmukh"],
    timeline: [
      {
        time: "20:00",
        title: "Live Bollywood set",
        description: "Decade-spanning Bollywood medleys with live requests.",
        performerIds: ["band-sunset-boulevard"],
      },
      {
        time: "22:00",
        title: "DJ after-party",
        description: "Seamless handoff to DJ for late-night dance.",
        performerIds: ["artist-ritika-deshmukh"],
      },
    ],
    equipment: ["Full band PA", "DJ controller", "Subwoofers", "Moving heads"],
    suggestedBudget: { amount: 135_000, currency: "INR" },
    recommendedVenueId: "venue-blue-note-club",
    durationMinutes: 240,
    eventTypeId: "private-party",
    genreIds: ["bollywood", "edm", "rock"],
  }),
  definePackage({
    slug: "college-fest",
    title: "College Fest",
    tagline: "Campus amphitheatre rock and indie headline.",
    description:
      "A college fest package with opening acoustic act, headline rock band, and crowd-engagement focus.",
    artistIds: ["band-anthem-rising", "band-electric-static", "artist-vivaan-singh"],
    timeline: [
      {
        time: "17:00",
        title: "Opening acoustic act",
        description: "Student-warmup friendly acoustic opener.",
        performerIds: ["artist-vivaan-singh"],
      },
      {
        time: "18:30",
        title: "Indie support slot",
        description: "High-energy indie set for growing crowd.",
        performerIds: ["band-electric-static"],
      },
      {
        time: "20:00",
        title: "Headline rock set",
        description: "Campus-scale rock and Bollywood encore.",
        performerIds: ["band-anthem-rising"],
      },
    ],
    equipment: ["Festival PA", "Stage monitors", "Backline kit", "Crowd barriers"],
    suggestedBudget: { amount: 175_000, currency: "INR" },
    recommendedVenueId: "venue-presidency-amphitheatre",
    durationMinutes: 300,
    eventTypeId: "concert",
    genreIds: ["rock", "indie", "bollywood"],
  }),
];

export function getExperiencePackage(slug: string): ExperiencePackage | undefined {
  return experiencePackages.find((experience) => experience.slug === slug);
}

export const experienceSlugs = experiencePackages.map(({ slug }) => slug);
