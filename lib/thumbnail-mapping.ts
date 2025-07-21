// Thumbnail mapping system to match video titles with their thumbnail filenames
// This ensures thumbnails render correctly even when titles don't exactly match filenames

export const thumbnailMapping: Record<string, string> = {
  // Meditation videos
  'Calming Heart at the Royal Arch': 'Calming Heart at the Royal Arch.jpg',
  'Nostril Navigator: Alt Nostril Breath': 'Nostril Navigator Alt Nostril Breath.jpg',
  'Alternate Nostril Breathing Flow': 'Alternate Nostril Breathing Flow.jpg',
  'Alternate Nostril Breathing Instruction & Flow': 'Alternate Nostril Breathing Flow.jpg',
  'Sun Salutation : Your Yoga Foundation': 'Sun Salutation Foundations.jpg',
  'Box Breath Flowing into Calming Heart': 'Box Breath flowing into Calming Heart.jpg',
  'High-5 Meditation': 'High-5 Meditation.jpg',
  'I AM Flow Mediation': 'I Am.jpg',
  'I AM Flow Meditation': 'I Am.jpg',
  'Long Deep Breath: Breath in Peace; Breath out Stress': 'Breath in Peace & Out Stress.jpg',
  'I AM Instructions & Flow Meditation': 'I Am.jpg',
  'Breath in Peace & Out Stress': 'Breath in Peace & Out Stress.jpg',
  'Kirtan Kriya': 'Kirtan Kriya.jpg',

  // Yoga for PE videos
  'Open the Gate, Release the Drama': 'Open the Gate, Release the Drama.jpg',
  'Chop Shop Countdown with Instructions': 'Chop Shop Countdown with Instructions.jpg',
  'Chop Shop Cranking it out': 'Chop Shop Cranking it out.jpg',
  'The Wonder of Warriors': 'The Wonder of Warriors.jpg',
  'Sun Salutation Foundations': 'Sun Salutation Foundations.jpg',
  'Sun Salutation Foundation for Yoga': 'Sun Salutation Foundations.jpg',
  'Sun Salutation Foundation': 'Sun Salutation Foundations.jpg',
  'Sunrise Sun Salutation Extra': 'Sunrise Sun Salutation Extra .jpg',
  'Sunrise Salutation: Flowing with Lake Michigan\'s First Light': 'Sunrise Sun Salutation Extra .jpg',
  'Rise & Shine: Sun Salutation with positive Affirmations (Because You\'re a Superhero)': 'Rise & Shine Sun Salutation with positive Affirmations.jpg',
  'Ab Circle 1': 'Ab Circle 1.jpg',
  'Ab Circle 2': 'Ab Circle 2.jpg',
  'Branch Out': 'Branch Out.jpg',
  'Firefighter Flow': 'Firefighter Flow.jpg',
  'Dog Days & Core Plays': 'Dog Days & Core Plays.jpg',
  'IT bands, It\'s not techy it\'s stretchy': 'IT bands, It\'s not techy it\'s stretchy.jpg',
  'Intro & Instructions': 'Intro & Instructions.jpg',

  // Relaxation videos
  'Body Scan with Flowers': 'Body Scan with Flowers.jpg',
  'Warm Fuzzy Tale': 'Warm Fuzzy Tale.jpg',

  // Mindful Movements videos
  'The Flower by Michael Franti & Spearhead, Victoria Canal': 'The Flower.jpg',

  'The Champion': 'The Champion.jpg',
  'Champion by Carrie Underwood, Ludacris': 'The Champion.jpg',
  'Thunder': 'Thunder.jpg',
  'Fight Song': 'Fight Song.jpg',
  'Fight Song by Rachel Platten': 'Fight Song.jpg'
};

// Function to get thumbnail path using the mapping
export function getThumbnailPath(title: string, category: string): string {
  // First check if we have a direct mapping for this title
  if (title in thumbnailMapping) {
    return `/thumbnails/${category}/${thumbnailMapping[title]}`;
  }
  
  // Check for partial matches in the mapping keys
  const lowerTitle = title.toLowerCase();
  for (const key in thumbnailMapping) {
    // If the title contains the key (case insensitive) or vice versa
    if (lowerTitle.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTitle)) {
      return `/thumbnails/${category}/${thumbnailMapping[key]}`;
    }
  }
  
  // Last resort: use a default placeholder based on category
  console.log(`No thumbnail found for "${title}" in category "${category}". Using default.`);
  return `/thumbnails/${category}/default.jpg`;
}
