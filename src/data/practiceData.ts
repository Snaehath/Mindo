export interface PracticeItem {
  id: string;
  word: string;
  emoji: string;
  category: 'objects' | 'groceries' | 'nature' | 'abstract';
  bizarreHint?: string;
}

export const practiceItemPool: PracticeItem[] = [
  // Objects
  { id: 'item_1', word: 'Banana', emoji: '🍌', category: 'groceries', bizarreHint: 'Glowing neon yellow and 8 feet tall' },
  { id: 'item_2', word: 'Guitar', emoji: '🎸', category: 'objects', bizarreHint: 'Blasting lightning bolts from strings' },
  { id: 'item_3', word: 'Penguin', emoji: '🐧', category: 'nature', bizarreHint: 'Sliding on a diamond snowboard' },
  { id: 'item_4', word: 'Alarm Clock', emoji: '⏰', category: 'objects', bizarreHint: 'Ringing with seismic earthquakes' },
  { id: 'item_5', word: 'Pineapple', emoji: '🍍', category: 'groceries', bizarreHint: 'Wearing stylish aviator sunglasses' },
  { id: 'item_6', word: 'Rocket', emoji: '🚀', category: 'objects', bizarreHint: 'Leaving a trail of rainbow smoke' },
  { id: 'item_7', word: 'Flamingo', emoji: '🦩', category: 'nature', bizarreHint: 'Balancing on a silver unicycle' },
  { id: 'item_8', word: 'Pancake', emoji: '🥞', category: 'groceries', bizarreHint: 'Stack as high as the ceiling swimming in syrup' },
  { id: 'item_9', word: 'Telescope', emoji: '🔭', category: 'objects', bizarreHint: 'Shooting sparkling star lasers' },
  { id: 'item_10', word: 'Diamond', emoji: '💎', category: 'objects', bizarreHint: 'Spinning and blinding with refraction' },
  { id: 'item_11', word: 'Elephant', emoji: '🐘', category: 'nature', bizarreHint: 'Floating on tiny pink fairy wings' },
  { id: 'item_12', word: 'Pizza', emoji: '🍕', category: 'groceries', bizarreHint: 'Hot cheese stretching across the entire room' },
  { id: 'item_13', word: 'Bicycle', emoji: '🚲', category: 'objects', bizarreHint: 'Wheels made of spinning orange slices' },
  { id: 'item_14', word: 'Umbrella', emoji: '☂️', category: 'objects', bizarreHint: 'Raining purple glitter upwards into space' },
  { id: 'item_15', word: 'Coffee Cup', emoji: '☕', category: 'groceries', bizarreHint: 'Erupting like a warm chocolate volcano' },
  { id: 'item_16', word: 'Camera', emoji: '📷', category: 'objects', bizarreHint: 'Flashing a blinding golden supernova' },
  { id: 'item_17', word: 'Crown', emoji: '👑', category: 'objects', bizarreHint: 'Floating with ruby flames dancing on top' },
  { id: 'item_18', word: 'Sunflower', emoji: '🌻', category: 'nature', bizarreHint: 'Singing opera with booming stereo bass' },
  { id: 'item_19', word: 'Skateboard', emoji: '🛹', category: 'objects', bizarreHint: 'Jet-powered with flames roaring behind' },
  { id: 'item_20', word: 'Watermelon', emoji: '🍉', category: 'groceries', bizarreHint: 'Exploding into sweet pink fireworks' },
  { id: 'item_21', word: 'Microphone', emoji: '🎤', category: 'objects', bizarreHint: 'Echoing cosmic thunder whenever touched' },
  { id: 'item_22', word: 'Cactus', emoji: '🌵', category: 'nature', bizarreHint: 'Sprouting delicious multi-flavor ice cream cones' },
  { id: 'item_23', word: 'Backpack', emoji: '🎒', category: 'objects', bizarreHint: 'Sprouting angel wings and carrying a baby bear' },
  { id: 'item_24', word: 'Teapot', emoji: '🫖', category: 'objects', bizarreHint: 'Whistling a funky disco beat' },
  { id: 'item_25', word: 'Strawberry', emoji: '🍓', category: 'groceries', bizarreHint: 'The size of an armchair, squishy and sweet' },
];

export const baselineTestWords: PracticeItem[] = [
  { id: 'base_1', word: 'Candle', emoji: '🕯️', category: 'objects' },
  { id: 'base_2', word: 'Mirror', emoji: '🪞', category: 'objects' },
  { id: 'base_3', word: 'Key', emoji: '🔑', category: 'objects' },
  { id: 'base_4', word: 'Apple', emoji: '🍎', category: 'groceries' },
  { id: 'base_5', word: 'Book', emoji: '📖', category: 'objects' },
];

export function getPracticeItems(count: number): PracticeItem[] {
  const shuffled = [...practiceItemPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
