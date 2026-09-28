export interface UserIdentity {
  name: string
  color: string
}

// Pantone-inspired harmonious palette matching the editorial swatch
const PALETTE = [
  '#F6DF88', // Pantone Popcorn Yellow
  '#96B3CE', // Pantone Dusty Sky Blue
  '#4A3B43', // Pantone Deep Espresso
  '#D48C70', // Warm Terracotta
  '#8BA894', // Sage Green
  '#C0A0BE', // Muted Mauve
  '#E8B86D', // Warm Ochre
  '#6B8E9B', // Slate Ocean
]

const ADJECTIVES = [
  'Swift',
  'Bright',
  'Clever',
  'Cosmic',
  'Dynamic',
  'Gentle',
  'Curious',
  'Agile',
  'Brave',
]

const NOUNS = [
  'Falcon',
  'Otter',
  'Fox',
  'Panda',
  'Owl',
  'Dolphin',
  'Koala',
  'Sparrow',
  'Lynx',
]

const STORAGE_KEY = 'inksync_user_profile'

export function getUserIdentity(): UserIdentity {
  if (typeof window === 'undefined') {
    return { name: 'Collaborator', color: '#96B3CE' }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.name && parsed.color) return parsed
    }
  } catch (e) {
    console.warn('Unable to access localStorage for user profile', e)
  }

  const randomAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const randomColor = PALETTE[Math.floor(Math.random() * PALETTE.length)]

  const newUser: UserIdentity = {
    name: `${randomAdj} ${randomNoun}`,
    color: randomColor,
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
  } catch (e) {
    console.warn('Unable to persist user profile', e)
  }

  return newUser
}

export function saveUserIdentity(user: UserIdentity): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch (e) {
    console.warn('Unable to persist user profile', e)
  }
}
