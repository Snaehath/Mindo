import { TechniqueType } from '../types';

export interface LessonStep {
  stepNumber: number;
  stepName: 'Understand' | 'See' | 'Try' | 'Practice' | 'Recall' | 'Challenge';
  title: string;
  subtitle: string;
  interactiveType: 'info' | 'interactive_palace' | 'story_builder' | 'peg_test' | 'quiz' | 'free_recall';
  content: {
    text: string[];
    exampleItems?: Array<{ label: string; spotOrPeg?: string; prompt: string; emoji: string }>;
    interactiveItems?: Array<{ id: string; name: string; emoji: string; associationPrompt?: string }>;
    quizQuestions?: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }>;
  };
}

export interface TechniqueModule {
  id: TechniqueType;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  badgeColor: string;
  steps: LessonStep[];
}

export const techniqueModules: Record<TechniqueType, TechniqueModule> = {
  palace: {
    id: 'palace',
    title: 'Memory Palace',
    tagline: 'Method of Loci',
    description: 'Anchor memories to familiar physical locations you already know by heart.',
    icon: 'castle',
    badgeColor: '#4F46E5',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Understand',
        title: 'Your Brain Loves Places',
        subtitle: 'Spatial memory is your mind’s evolutionary superpower.',
        interactiveType: 'info',
        content: {
          text: [
            'Our ancestors navigated vast landscapes to survive. Because of this, spatial memory is naturally sticky.',
            'A Memory Palace uses a place you already know intimately (like your home).',
            'By placing items along a familiar walking path, remembering them becomes as simple as taking a walk in your mind.',
          ],
        },
      },
      {
        stepNumber: 2,
        stepName: 'See',
        title: 'Vivid Mental Associations',
        subtitle: 'Watch how ordinary items become unforgettable when placed in rooms.',
        interactiveType: 'info',
        content: {
          text: [
            'Ordinary images are easy to forget. Bizarre, exaggerated, and absurd imagery is almost impossible to forget.',
            'Let’s take a walk through a home to remember 3 random groceries:',
          ],
          exampleItems: [
            {
              spotOrPeg: '1. Front Door',
              label: 'Giant Banana',
              emoji: '🍌',
              prompt: 'A 10-foot glowing yellow banana is jammed in the front doorway, squishing as you push it open!',
            },
            {
              spotOrPeg: '2. Living Room Sofa',
              label: 'Rocket Milk Carton',
              emoji: '🥛',
              prompt: 'A gallon of milk is blasting off like a rocket from the couch cushion, spraying mist across the carpet!',
            },
            {
              spotOrPeg: '3. TV Stand',
              label: 'Dancing Broccoli',
              emoji: '🥦',
              prompt: 'A stalk of broccoli with sunglasses is breakdancing right on top of the television screen!',
            },
          ],
        },
      },
      {
        stepNumber: 3,
        stepName: 'Try',
        title: 'Place Your First Item',
        subtitle: 'Attach a mental picture to a spot right now.',
        interactiveType: 'interactive_palace',
        content: {
          text: [
            'Imagine your kitchen dining table.',
            'You need to remember a Golden Crown 👑.',
            'Picture it: A sparkling queen’s crown dripping hot melted cheese all over the wood grain.',
          ],
          interactiveItems: [
            {
              id: 'crown',
              name: 'Golden Crown',
              emoji: '👑',
              associationPrompt: 'Placed on Dining Table: Dripping hot cheese and jewels glowing.',
            },
          ],
        },
      },
      {
        stepNumber: 4,
        stepName: 'Practice',
        title: 'Mental Walkthrough',
        subtitle: 'Walk through 4 spots in sequence and drop items.',
        interactiveType: 'interactive_palace',
        content: {
          text: [
            'Now place these 4 items along your route. Tap each one to imprint the image before moving forward.',
          ],
          interactiveItems: [
            { id: '1', name: 'Pineapple', emoji: '🍍', associationPrompt: 'Front Door: Spiky pineapple wearing sunglasses acting as doorman.' },
            { id: '2', name: 'Guitar', emoji: '🎸', associationPrompt: 'Living Room Sofa: Red electric guitar strumming loud heavy metal on the pillows.' },
            { id: '3', name: 'Basketball', emoji: '🏀', associationPrompt: 'Dining Table: Burning orange basketball spinning in a soup bowl.' },
            { id: '4', name: 'Alarm Clock', emoji: '⏰', associationPrompt: 'Bed: Giant alarm clock ringing with vibrating springs bouncing on the mattress.' },
          ],
        },
      },
      {
        stepNumber: 5,
        stepName: 'Recall',
        title: 'Walk & Recall',
        subtitle: 'Test how well you placed the items in your palace.',
        interactiveType: 'quiz',
        content: {
          text: ['Walk back through your spots mentally. What was located at each position?'],
          quizQuestions: [
            {
              question: 'What was at the Living Room Sofa?',
              options: ['Alarm Clock', 'Guitar', 'Pineapple', 'Basketball'],
              correctAnswer: 'Guitar',
              explanation: 'The electric guitar was loudly strumming on the sofa cushions!',
            },
            {
              question: 'What was spinning in a soup bowl at the Dining Table?',
              options: ['Basketball', 'Pineapple', 'Crown', 'Milk'],
              correctAnswer: 'Basketball',
              explanation: 'The burning basketball was spinning right on your dining table.',
            },
            {
              question: 'What was bouncing on the Bed?',
              options: ['Guitar', 'Pineapple', 'Alarm Clock', 'Crown'],
              correctAnswer: 'Alarm Clock',
              explanation: 'The loud vibrating alarm clock was bouncing on the bed mattress.',
            },
          ],
        },
      },
      {
        stepNumber: 6,
        stepName: 'Challenge',
        title: 'Real-World Application',
        subtitle: 'Use your palace in everyday life.',
        interactiveType: 'info',
        content: {
          text: [
            '🎉 You’ve mastered the core mechanism of the Memory Palace!',
            'How to use this outside the app:',
            '• Grocery runs without paper notes.',
            '• Giving a 5-point presentation without looking at slides.',
            '• Memorizing key facts or to-do lists before leaving the house.',
            'Tip: Keep your route in strict chronological order so you never skip a room.',
          ],
        },
      },
    ],
  },
  linking: {
    id: 'linking',
    title: 'Linking / Story Method',
    tagline: 'Visual Narrative Chains',
    description: 'Chain items together through outrageous, exaggerated cause-and-effect scenes.',
    icon: 'link-variant',
    badgeColor: '#7C3AED',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Understand',
        title: 'The Power of Absurd Chains',
        subtitle: 'Connect item A directly to item B with a crazy reaction.',
        interactiveType: 'info',
        content: {
          text: [
            'Instead of using rooms, Linking connects each item directly to the next one like links of a chain.',
            'Item 1 interacts directly with Item 2.',
            'Item 2 then causes something wild to happen to Item 3.',
            'The secret? Make the connection active, violent, funny, or shocking.',
          ],
        },
      },
      {
        stepNumber: 2,
        stepName: 'See',
        title: 'A Bizarre Visual Story',
        subtitle: 'Watch 5 unrelated words turn into an unforgettable movie.',
        interactiveType: 'info',
        content: {
          text: ['List: Dog 🐶 → Pizza 🍕 → Moon 🌕 → Guitar 🎸 → Elephant 🐘'],
          exampleItems: [
            {
              spotOrPeg: 'Dog → Pizza',
              label: 'Dog bites Pizza',
              emoji: '🐶🍕',
              prompt: 'A fluffy dog takes a gigantic bite out of a cheesy pepperoni pizza.',
            },
            {
              spotOrPeg: 'Pizza → Moon',
              label: 'Pizza frisbees to Moon',
              emoji: '🍕🌕',
              prompt: 'The dog flings the pizza into the sky like a glowing flying saucer, slapping right onto the Moon.',
            },
            {
              spotOrPeg: 'Moon → Guitar',
              label: 'Moon strums Guitar',
              emoji: '🌕🎸',
              prompt: 'The Moon sprouts two arms and starts strumming a glowing rock Guitar.',
            },
            {
              spotOrPeg: 'Guitar → Elephant',
              label: 'Guitar wakes Elephant',
              emoji: '🎸🐘',
              prompt: 'The guitar sound wakes up a pink elephant who begins dancing on a tightrope!',
            },
          ],
        },
      },
      {
        stepNumber: 3,
        stepName: 'Try',
        title: 'Form Your Own Link',
        subtitle: 'Connect two items in your imagination.',
        interactiveType: 'story_builder',
        content: {
          text: [
            'Let’s link: Bicycle 🚲 and Watermelon 🍉.',
            'Imagine riding a bicycle with giant juicy watermelons instead of wheels. Every pedal squirts pink juice everywhere!',
          ],
          interactiveItems: [
            { id: 'l1', name: 'Bicycle', emoji: '🚲' },
            { id: 'l2', name: 'Watermelon', emoji: '🍉' },
          ],
        },
      },
      {
        stepNumber: 4,
        stepName: 'Practice',
        title: 'Chain 4 Items',
        subtitle: 'Build an unbroken narrative chain.',
        interactiveType: 'story_builder',
        content: {
          text: ['Follow the chain: Coffee ☕ → Penguin 🐧 → Umbrella ☂️ → Diamond 💎'],
          interactiveItems: [
            { id: 'c1', name: 'Hot Coffee', emoji: '☕', associationPrompt: 'A steaming cup spills hot mocha on a sliding Penguin.' },
            { id: 'c2', name: 'Penguin', emoji: '🐧', associationPrompt: 'The shivering penguin opens a polka-dot Umbrella.' },
            { id: 'c3', name: 'Umbrella', emoji: '☂️', associationPrompt: 'From the umbrella tip drops a sparkling giant Diamond.' },
            { id: 'c4', name: 'Diamond', emoji: '💎', associationPrompt: 'The diamond reflects rainbow lasers across the sky.' },
          ],
        },
      },
      {
        stepNumber: 5,
        stepName: 'Recall',
        title: 'Trace the Chain',
        subtitle: 'Follow the links in your memory.',
        interactiveType: 'quiz',
        content: {
          text: ['Recall the sequence of the story chain.'],
          quizQuestions: [
            {
              question: 'In the first story: What did the Dog bite into?',
              options: ['Guitar', 'Pizza', 'Moon', 'Watermelon'],
              correctAnswer: 'Pizza',
              explanation: 'The dog took a huge bite of the cheesy pizza!',
            },
            {
              question: 'What did the Pizza fly and slap onto?',
              options: ['The Moon', 'The Bicycle', 'An Elephant', 'A Tree'],
              correctAnswer: 'The Moon',
              explanation: 'The pizza flew like a frisbee into space and hit the Moon.',
            },
            {
              question: 'In the practice chain: What came right after the Umbrella?',
              options: ['Coffee', 'Penguin', 'Diamond', 'Elephant'],
              correctAnswer: 'Diamond',
              explanation: 'The tip of the umbrella popped out a huge sparkling diamond!',
            },
          ],
        },
      },
      {
        stepNumber: 6,
        stepName: 'Challenge',
        title: 'Rapid Association Challenge',
        subtitle: 'Take Linking into your day.',
        interactiveType: 'info',
        content: {
          text: [
            'Linking is fast and requires zero pre-built palaces!',
            'Best for:',
            '• Unordered lists or quick reminders.',
            '• Remembering people’s names (connect face feature → rhyme → name).',
            '• Sequences where order must be strictly preserved.',
            'Golden rule: Never make peaceful links. Always make action-packed, sensory collisions!',
          ],
        },
      },
    ],
  },
  peg: {
    id: 'peg',
    title: 'The Peg System',
    tagline: 'Number-Rhyme Anchors',
    description: 'Instantly recall items by number with fixed mental pegboards.',
    icon: 'format-list-numbered',
    badgeColor: '#0D9488',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Understand',
        title: 'Pegs Never Move',
        subtitle: 'Pre-memorized anchors give numbers visual shapes.',
        interactiveType: 'info',
        content: {
          text: [
            'Abstract numbers (1, 2, 3...) are slippery for human brains.',
            'The Peg System attaches each number to a memorable rhyme:',
            '1 = Bun 🍔 | 2 = Shoe 👟 | 3 = Tree 🌳 | 4 = Door 🚪 | 5 = Hive 🐝',
            'Once you learn the pegs, you can instantly tell what item #4 or #2 is without reciting the whole list!',
          ],
        },
      },
      {
        stepNumber: 2,
        stepName: 'See',
        title: 'The 1 to 5 Rhyme Pegs',
        subtitle: 'Memorize these 5 simple rhymes.',
        interactiveType: 'peg_test',
        content: {
          text: ['Notice how each peg rhymes with its number:'],
          exampleItems: [
            { spotOrPeg: '1 = Bun', label: 'Golden Bun', emoji: '🍔', prompt: 'One is a warm toasted hamburger bun' },
            { spotOrPeg: '2 = Shoe', label: 'Sneaker Shoe', emoji: '👟', prompt: 'Two is a giant red running shoe' },
            { spotOrPeg: '3 = Tree', label: 'Oak Tree', emoji: '🌳', prompt: 'Three is a tall green shady tree' },
            { spotOrPeg: '4 = Door', label: 'Wooden Door', emoji: '🚪', prompt: 'Four is a squeaky wooden door' },
            { spotOrPeg: '5 = Hive', label: 'Bee Hive', emoji: '🐝', prompt: 'Five is a buzzing golden beehive' },
          ],
        },
      },
      {
        stepNumber: 3,
        stepName: 'Try',
        title: 'Hang Items on Pegs',
        subtitle: 'Associate items with the peg rhymes.',
        interactiveType: 'peg_test',
        content: {
          text: [
            'Let’s attach items to Pegs 1 and 2:',
            'Item #1: Camera 📷 → Imagine squashing a camera between two warm burger Buns! 🍔',
            'Item #2: Telescope 🔭 → Imagine sticking a long telescope into a Shoe as a heel! 👟',
          ],
        },
      },
      {
        stepNumber: 4,
        stepName: 'Practice',
        title: 'Hang 5 Items on Pegs',
        subtitle: 'Lock in 5 items to pegs 1 through 5.',
        interactiveType: 'peg_test',
        content: {
          text: ['Connect each item with its number peg:'],
          interactiveItems: [
            { id: 'p1', name: 'Laptop', emoji: '💻', associationPrompt: '#1 (Bun): A sizzling hot Laptop served inside a hamburger Bun.' },
            { id: 'p2', name: 'Flamingo', emoji: '🦩', associationPrompt: '#2 (Shoe): A pink Flamingo wearing roller-skate Shoes.' },
            { id: 'p3', name: 'Guitar', emoji: '🎸', associationPrompt: '#3 (Tree): Red electric guitars growing like apples on a Tree.' },
            { id: 'p4', name: 'Rocket', emoji: '🚀', associationPrompt: '#4 (Door): A silver Rocket crashing right through a wooden Door.' },
            { id: 'p5', name: 'Pancake', emoji: '🥞', associationPrompt: '#5 (Hive): Sweet pancakes covered in honey bees from a Hive.' },
          ],
        },
      },
      {
        stepNumber: 5,
        stepName: 'Recall',
        title: 'Direct Number Access',
        subtitle: 'Jump directly to any number without reciting 1, 2, 3...',
        interactiveType: 'quiz',
        content: {
          text: ['Test your instant access:'],
          quizQuestions: [
            {
              question: 'What item was on Peg #4 (Four = Door)?',
              options: ['Flamingo', 'Rocket', 'Laptop', 'Pancake'],
              correctAnswer: 'Rocket',
              explanation: 'Four is Door! The silver rocket crashed right through the door.',
            },
            {
              question: 'What item was on Peg #2 (Two = Shoe)?',
              options: ['Laptop', 'Flamingo', 'Guitar', 'Rocket'],
              correctAnswer: 'Flamingo',
              explanation: 'Two is Shoe! The pink flamingo was wearing roller-skate shoes.',
            },
            {
              question: 'What item was on Peg #5 (Five = Hive)?',
              options: ['Pancake', 'Guitar', 'Laptop', 'Flamingo'],
              correctAnswer: 'Pancake',
              explanation: 'Five is Hive! Sweet pancakes covered in honey bees from the hive.',
            },
          ],
        },
      },
      {
        stepNumber: 6,
        stepName: 'Challenge',
        title: 'Expand to 10 Pegs',
        subtitle: 'Take your pegboard to the next level.',
        interactiveType: 'info',
        content: {
          text: [
            'You now possess random-access memory!',
            'The complete 1–10 Pegboard:',
            '1 = Bun 🍔 | 2 = Shoe 👟 | 3 = Tree 🌳 | 4 = Door 🚪 | 5 = Hive 🐝',
            '6 = Sticks 🥢 | 7 = Heaven ☁️ | 8 = Gate ⛩️ | 9 = Vine 🌿 | 10 = Hen 🐔',
            'Ready to practice with random words in the Practice Gym!',
          ],
        },
      },
    ],
  },
};
