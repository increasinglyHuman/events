export type RSVPStatus = "going" | "interested" | "maybe" | "not_going";

export interface Attendee {
  userId: string;
  userName: string;
  avatar?: string;
  rsvpStatus: RSVPStatus;
  isPublic: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  text: string;
  createdAt: string;
}

export interface OrganizerProfile {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  followerCount: number;
  eventCount: number;
  rating: number;
  reputationScore: number;
  eventsCompleted: number;
}
