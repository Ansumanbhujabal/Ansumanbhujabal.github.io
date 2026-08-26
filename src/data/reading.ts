export interface Book { title: string; author?: string }
export interface Shelf { emoji: string; name: string; books: Book[] }

export const SHELVES: Shelf[] = [
  { emoji: '🧠', name: 'Intellectual & Personal Development', books: [
    { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari' },
    { title: 'The Power of Your Subconscious Mind', author: 'Joseph Murphy' },
    { title: 'Who Will Cry When You Die?', author: 'Robin Sharma' },
  ]},
  { emoji: '🌍', name: 'Wildlife, Nature & Conservation', books: [
    { title: 'Man-Eaters of Kumaon', author: 'Jim Corbett' },
    { title: 'The Man-Eating Leopard of Rudraprayag', author: 'Jim Corbett' },
    { title: 'The Champawat Man-Eater', author: 'Jim Corbett' },
    { title: 'Nine Man-Eaters and One Rogue', author: 'Kenneth Anderson' },
    { title: 'Man-Eaters of Manchi Village', author: 'Kenneth Anderson' },
    { title: 'The Black Panther of Sivanipalli', author: 'Kenneth Anderson' },
    { title: 'The Man-Eaters of Tsavo', author: 'J.H. Patterson' },
  ]},
  { emoji: '🎭', name: 'Classic Literature', books: [
    { title: 'Animal Farm', author: 'George Orwell' },
    { title: '1984', author: 'George Orwell' },
    { title: "Tess of the d'Urbervilles", author: 'Thomas Hardy' },
    { title: 'Robinson Crusoe', author: 'Daniel Defoe' },
    { title: 'Metamorphosis', author: 'Franz Kafka' },
    { title: 'Lolita', author: 'Vladimir Nabokov' },
    { title: 'Pamela', author: 'Samuel Richardson' },
  ]},
  { emoji: '✨', name: 'Contemporary & Literary Fiction', books: [
    { title: 'The White Tiger', author: 'Aravind Adiga' },
    { title: 'Half Girlfriend', author: 'Chetan Bhagat' },
    { title: 'The Girl in Room 105', author: 'Chetan Bhagat' },
    { title: 'You Are the Best Wife', author: 'Ajay K. Pandey' },
    { title: 'Will You Still Love Me?', author: 'Preeti Shenoy' },
    { title: 'I Still Think About You', author: 'Preeti Shenoy' },
    { title: 'You Are the Reason for My Smile', author: 'Preeti Shenoy' },
    { title: 'Be My Perfect Ending', author: 'Savi Sharma' },
  ]},
  { emoji: '🌀', name: 'Magical Realism & Philosophical Fiction', books: [
    { title: 'Kafka on the Shore', author: 'Haruki Murakami' },
    { title: 'Men Without Women', author: 'Haruki Murakami' },
    { title: 'Sputnik Sweetheart', author: 'Haruki Murakami' },
  ]},
  { emoji: '🕵️', name: 'Mystery & Adventure', books: [
    { title: 'The ABC Murders', author: 'Agatha Christie' },
    { title: 'Arsène Lupin', author: 'Maurice Leblanc' },
    { title: "King Solomon's Mines", author: 'H. Rider Haggard' },
    { title: 'Papillon', author: 'Henri Charrière' },
    { title: 'The Jewel of Seven Stars', author: 'Bram Stoker' },
  ]},
  { emoji: '🇮🇳', name: 'Indian Literature', books: [
    { title: 'The Blue Umbrella', author: 'Ruskin Bond' },
    { title: 'The Bachelor of Arts', author: 'R.K. Narayan' },
    { title: 'Tara', author: 'Mahesh Dattani' },
    { title: 'Cry, the Peacock', author: 'Anita Desai' },
  ]},
  { emoji: '📜', name: 'Poetry & Short Stories', books: [
    { title: 'The Tell-Tale Heart', author: 'Edgar Allan Poe' },
    { title: 'The Black Cat', author: 'Edgar Allan Poe' },
    { title: 'After Twenty Years', author: 'O. Henry' },
    { title: 'The Luncheon', author: 'W. Somerset Maugham' },
    { title: 'The Lament', author: 'Anton Chekhov' },
    { title: "I'm Nobody! Who Are You?", author: 'Emily Dickinson' },
    { title: 'Sonnet 55', author: 'Edmund Spenser' },
  ]},
];
