export interface Destination {
  id: string;
  name: string;
  province: string;
  coords: string;
  tag: string;
  tilt: string;
  image: string;
  postmark: string;
  desc: string;
}

export interface Dish {
  name: string;
  price: string;
  note: string;
}

export interface TransitInfo {
  distance: string;
  duration: string;
  mode: string;
  haversineOk: boolean;
}

export interface BackupOption {
  name: string;
  address: string;
  reason: string;
  lat: number;
  lng: number;
}

export interface StopCandidate {
  id: string;
  name: string;
  categoryTag: string;
  categoryColor: string;
  address: string;
  cost: string;
  image?: string;
  desc: string;
  lat: number;
  lng: number;
  matchedDesire?: { member: string; desire: string };
  votes: string[];
  hearts: number;
  dishes?: Dish[];
  isIndoorBackup?: boolean;
}

export interface Stop {
  id: string;
  name: string;
  time: string;
  category: string;
  categoryTag: string;
  categoryColor: string;
  address: string;
  cost: string;
  image?: string;
  desc: string;
  lat: number;
  lng: number;
  transitFromPrev?: TransitInfo | null;
  votesUp: number;
  votesDown: number;
  hearts: number;
  voters: string[];
  isHero?: boolean;
  isSwapped?: boolean;
  backupOption?: BackupOption;
  dishes?: Dish[];
  suggestedBy?: string;
  matchedDesire?: { member: string; desire: string };
  candidates?: StopCandidate[];
  selectedCandidateId?: string;
  isSlotConfirmed?: boolean;
}

export interface ProposalOption {
  key: string;
  title: string;
  tag: string;
  stopsCount: number;
  highlights: string[];
  daysOverview?: { day: number; title: string; desc: string }[];
  estCost: string;
  totalTripEst?: string;
  vibe: string;
  votes?: string[];
}

export interface FilterValidation {
  location: string;
  duration: string;
  budget: string;
  constraints: string[];
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'concierge' | 'friend';
  name: string;
  time: string;
  text: string;
  avatarColor?: string;
  isSystemEvent?: boolean;
  filterValidation?: FilterValidation;
  options?: ProposalOption[];
  actionType?: 'rain-swap';
  actionText?: string;
}

export interface ChecklistItem {
  id: number;
  text: string;
  category: string;
  assignedTo: string;
  done: boolean;
}
