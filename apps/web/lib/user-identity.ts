export interface UserIdentity {
  name: string
  color: string
}

// Vintage Botanical & Editorial Palette from user specification
const PALETTE = [
  '#C496A1', // Dusty Rose
  '#919D85', // Muted Sage
  '#8E88A3', // Lavender Purple
  '#5D0D18', // Bloodstone
  '#81785A', // Antique Bronze
  '#B5728A', // Thulian Pink
  '#9FB2AC', // Misty Sage
  '#933B5B', // Amaranth
  '#9F9679', // Pomelo Olive
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
    return { name: 'Collaborator', color: '#C496A1' }
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
