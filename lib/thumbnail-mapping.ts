// Thumbnail mapping system to match video titles with their thumbnail filenames
// This ensures thumbnails render correctly even when titles don't exactly match filenames

export const thumbnailMapping: Record<string, string> = {
  // Meditation videos
  'Calming Heart at the Royal Arch': 'Calming Heart at the Royal Arch.jpg',
  'Nostril Navigator: Alt Nostril Breath': 'Nostril Navigator Alt Nostril Breath.jpg',
  'Box Breath Flowing into Calming Heart': 'Box Breath flowing into Calming Heart.jpg',
  'High-5 Meditation': 'High-5 Meditation.jpg',
  'I AM Flow Mediation': 'I Am.jpg',
  'Breath in Peace & Out Stress': 'Breath in Peace & Out Stress.jpg',
  'Kirtan Kriya': 'Kirtan Kriya.jpg',

  // Yoga for PE videos
  'Open the Gate, Release the Drama': 'Open the Gate, Release the Drama.jpg',
  'Chop Shop Countdown with Instructions': 'Chop Shop Countdown with Instructions.jpg',
  'Chop Shop Cranking it out': 'Chop Shop Cranking it out.jpg',
  'The Wonder of Warriors': 'The Wonder of Warriors.jpg',
  'Sun Salutation Foundations': 'Sun Salutation Foundations.jpg',
  'Sunrise Sun Salutation Extra': 'Sunrise Sun Salutation Extra .jpg',
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
  'Thunder': 'Thunder.jpg',
  'Fight Song': 'Fight Song.jpg'
};

// Function to get thumbnail path using the mapping
export function getThumbnailPath(title: string, category: string): string {
  // First check if we have a direct mapping for this title
  if (title in thumbnailMapping) {
    return `/thumbnails/${category}/${thumbnailMapping[title]}`;
  }
  
  // Try with URL-encoded title
  return `/thumbnails/${category}/${encodeURIComponent(title)}.jpg`;
}
