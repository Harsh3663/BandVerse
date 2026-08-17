export interface TaxonomyOption {
  id: string;
  label: string;
  aliases?: readonly string[];
}

export interface PerformerSubcategoryOption extends TaxonomyOption {
  categoryId: string;
}

export const performerKinds = [
  { id: "solo", label: "Solo Artist" },
  { id: "band", label: "Band" },
  { id: "traditional-group", label: "Traditional Group" },
  { id: "dj", label: "DJ" },
  { id: "ensemble", label: "Ensemble" },
] as const satisfies readonly TaxonomyOption[];

export const performerCategories = [
  { id: "vocalist", label: "Vocalist", aliases: ["Singer"] },
  { id: "instrumentalist", label: "Instrumentalist" },
  { id: "band", label: "Band" },
  { id: "traditional-group", label: "Traditional Group" },
  { id: "dance-group", label: "Dance Group" },
  { id: "dj", label: "DJ" },
  { id: "devotional", label: "Devotional Performer" },
] as const satisfies readonly TaxonomyOption[];

export const performerSubcategories = [
  { id: "playback-singer", label: "Playback Singer", categoryId: "vocalist" },
  { id: "wedding-singer", label: "Wedding Singer", categoryId: "vocalist" },
  {
    id: "solo-instrumentalist",
    label: "Solo Instrumentalist",
    categoryId: "instrumentalist",
  },
  { id: "cover-band", label: "Cover Band", categoryId: "band" },
  { id: "wedding-band", label: "Wedding Band", categoryId: "band" },
  { id: "folk-ensemble", label: "Folk Ensemble", categoryId: "traditional-group" },
  { id: "dhol-pathak", label: "Dhol Pathak", categoryId: "traditional-group" },
  { id: "fusion-ensemble", label: "Fusion Ensemble", categoryId: "ensemble" },
  { id: "club-dj", label: "Club DJ", categoryId: "dj" },
  { id: "wedding-dj", label: "Wedding DJ", categoryId: "dj" },
] as const satisfies readonly PerformerSubcategoryOption[];

export const performerSkills = [
  { id: "live-vocals", label: "Live Vocals" },
  { id: "audience-engagement", label: "Audience Engagement" },
  { id: "song-requests", label: "Song Requests" },
  { id: "set-planning", label: "Set Planning" },
  { id: "improvisation", label: "Improvisation" },
  { id: "ensemble-direction", label: "Ensemble Direction" },
  { id: "ceremonial-performance", label: "Ceremonial Performance" },
  { id: "sound-check", label: "Sound Check Coordination" },
] as const satisfies readonly TaxonomyOption[];

export const galleryCategories = [
  { id: "professional", label: "Professional" },
  { id: "stage", label: "On Stage" },
  { id: "wedding", label: "Weddings" },
  { id: "concert", label: "Concerts" },
  { id: "traditional", label: "Traditional" },
] as const satisfies readonly TaxonomyOption[];

export const instruments = [
  { id: "tabla", label: "Tabla" },
  { id: "dhol", label: "Dhol" },
  { id: "dholak", label: "Dholak" },
  { id: "mridangam", label: "Mridangam" },
  { id: "pakhawaj", label: "Pakhawaj" },
  { id: "sitar", label: "Sitar" },
  { id: "sarangi", label: "Sarangi" },
  { id: "sarod", label: "Sarod" },
  { id: "santoor", label: "Santoor" },
  { id: "veena", label: "Veena" },
  { id: "shehnai", label: "Shehnai" },
  { id: "nadaswaram", label: "Nadaswaram" },
  { id: "bansuri", label: "Bansuri", aliases: ["Flute", "Flutist"] },
  { id: "vocals", label: "Vocals", aliases: ["Singer"] },
  { id: "guitar", label: "Guitar", aliases: ["Guitarist"] },
  { id: "bass", label: "Bass", aliases: ["Bass Guitar"] },
  { id: "ukulele", label: "Ukulele" },
  { id: "keyboard", label: "Keyboard", aliases: ["Keys", "Synth"] },
  { id: "piano", label: "Piano", aliases: ["Pianist"] },
  { id: "violin", label: "Violin", aliases: ["Violinist"] },
  { id: "cello", label: "Cello" },
  { id: "drums", label: "Drums", aliases: ["Drummer"] },
  { id: "cajon", label: "Cajon" },
  { id: "percussion", label: "Percussion" },
  { id: "saxophone", label: "Saxophone", aliases: ["Saxophonist"] },
  { id: "banjo", label: "Banjo" },
  { id: "lezim", label: "Lezim" },
  { id: "harmonium", label: "Harmonium" },
  { id: "punjabi-dhol", label: "Punjabi Dhol", aliases: ["Punjabi Dhol"] },
  { id: "dhol-tasha", label: "Dhol Tasha", aliases: ["Dhol Tasha"] },
] as const satisfies readonly TaxonomyOption[];

export const genres = [
  { id: "bollywood", label: "Bollywood" },
  { id: "retro", label: "Retro" },
  { id: "rock", label: "Rock" },
  { id: "metal", label: "Metal" },
  { id: "edm", label: "EDM" },
  { id: "pop", label: "Pop" },
  { id: "jazz", label: "Jazz" },
  { id: "blues", label: "Blues" },
  { id: "sufi", label: "Sufi" },
  { id: "qawwali", label: "Qawwali" },
  { id: "carnatic", label: "Carnatic" },
  { id: "hindustani", label: "Hindustani", aliases: ["Hindustani Classical"] },
  { id: "classical", label: "Classical" },
  { id: "fusion", label: "Fusion" },
  { id: "folk", label: "Folk" },
  { id: "devotional", label: "Devotional" },
  { id: "instrumental", label: "Instrumental" },
  { id: "acoustic", label: "Acoustic" },
  { id: "bhajan", label: "Bhajan" },
  { id: "garba", label: "Garba" },
  { id: "lavani", label: "Lavani" },
  { id: "bhangra", label: "Bhangra" },
  { id: "kathak", label: "Kathak" },
  { id: "indie", label: "Indie" },
  { id: "hip-hop", label: "Hip-Hop" },
  { id: "contemporary", label: "Contemporary" },
  { id: "bharatanatyam", label: "Bharatanatyam" },
  { id: "ghoomar", label: "Ghoomar" },
  { id: "baul", label: "Baul" },
  { id: "yakshagana", label: "Yakshagana" },
] as const satisfies readonly TaxonomyOption[];

export const languages = [
  { id: "hindi", label: "Hindi" },
  { id: "english", label: "English" },
  { id: "marathi", label: "Marathi" },
  { id: "gujarati", label: "Gujarati" },
  { id: "punjabi", label: "Punjabi" },
  { id: "tamil", label: "Tamil" },
  { id: "telugu", label: "Telugu" },
  { id: "kannada", label: "Kannada" },
  { id: "malayalam", label: "Malayalam" },
  { id: "bengali", label: "Bengali" },
  { id: "assamese", label: "Assamese" },
  { id: "odia", label: "Odia", aliases: ["Oriya"] },
  { id: "urdu", label: "Urdu" },
  { id: "sanskrit", label: "Sanskrit" },
  { id: "rajasthani", label: "Rajasthani" },
  { id: "konkani", label: "Konkani" },
] as const satisfies readonly TaxonomyOption[];

export const venueAmenities = [
  { id: "in-house-pa", label: "In-house PA System" },
  { id: "stage", label: "Stage" },
  { id: "green-room", label: "Green Room" },
  { id: "dance-floor", label: "Dance Floor" },
  { id: "outdoor-space", label: "Outdoor Space" },
  { id: "parking", label: "Parking" },
  { id: "power-backup", label: "Power Backup" },
  { id: "soundproofing", label: "Soundproofing" },
] as const satisfies readonly TaxonomyOption[];

export const marketplaceTaxonomy = {
  performerKinds,
  performerCategories,
  performerSubcategories,
  performerSkills,
  galleryCategories,
  instruments,
  genres,
  languages,
  venueAmenities,
} as const;

export function resolveTaxonomyId(
  value: string,
  options: readonly TaxonomyOption[],
): string | undefined {
  const normalized = value.trim().toLocaleLowerCase("en-IN");
  return options.find(
    (option) =>
      option.id === normalized ||
      option.label.toLocaleLowerCase("en-IN") === normalized ||
      option.aliases?.some((alias) => alias.toLocaleLowerCase("en-IN") === normalized),
  )?.id;
}

export function taxonomyLabel(id: string, options: readonly TaxonomyOption[]): string {
  return options.find((option) => option.id === id)?.label ?? id;
}
