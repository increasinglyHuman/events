import type { OrganizerProfile } from "@/types/social";

export const FAKE_ORGANIZERS: OrganizerProfile[] = [
  {
    id: "org-001", name: "DJ Luna", bio: "Resident DJ and music curator for poqpoq nightlife. Spinning tracks since day one.",
    followerCount: 342, eventCount: 87, rating: 4.8, reputationScore: 92, eventsCompleted: 82,
  },
  {
    id: "org-002", name: "Aria Vex", bio: "Digital artist and gallery curator. Building beautiful spaces in the metaverse.",
    followerCount: 218, eventCount: 45, rating: 4.6, reputationScore: 78, eventsCompleted: 41,
  },
  {
    id: "org-003", name: "Professor Quill", bio: "Educator and workshop host. Teaching scripting, building, and world design.",
    followerCount: 567, eventCount: 120, rating: 4.9, reputationScore: 95, eventsCompleted: 115,
  },
  {
    id: "org-004", name: "Raven Nightshade", bio: "Master storyteller and roleplay event coordinator. Weaving tales since the early grid days.",
    followerCount: 189, eventCount: 62, rating: 4.7, reputationScore: 85, eventsCompleted: 58,
  },
  {
    id: "org-005", name: "Kai Storm", bio: "Quest designer and game master. Creator of the Akashic Trials series.",
    followerCount: 421, eventCount: 34, rating: 4.5, reputationScore: 72, eventsCompleted: 30,
  },
  {
    id: "org-006", name: "Solace", bio: "Community leader and governance advocate. Keeping poqpoq's community strong.",
    followerCount: 890, eventCount: 156, rating: 4.9, reputationScore: 98, eventsCompleted: 150,
  },
  {
    id: "org-007", name: "Zephyr Blaze", bio: "Competition organizer and build contest judge. If it can be built, it can be judged.",
    followerCount: 134, eventCount: 28, rating: 4.3, reputationScore: 65, eventsCompleted: 24,
  },
  {
    id: "org-008", name: "Mystic Ember", bio: "Ceremony host and ritual guide. Connecting the digital and spiritual.",
    followerCount: 276, eventCount: 73, rating: 4.8, reputationScore: 88, eventsCompleted: 69,
  },
  {
    id: "org-009", name: "Nyx Merchant", bio: "Marketplace mogul and auction house operator. Commerce is an art form.",
    followerCount: 198, eventCount: 41, rating: 4.4, reputationScore: 70, eventsCompleted: 38,
  },
  {
    id: "org-010", name: "Atlas Wanderer", bio: "Explorer and tour guide. Discovering hidden gems across the metaverse.",
    followerCount: 312, eventCount: 55, rating: 4.7, reputationScore: 82, eventsCompleted: 51,
  },
  {
    id: "org-011", name: "Pixel Dream", bio: "Performance artist and theater director. Every stage is a canvas.",
    followerCount: 167, eventCount: 22, rating: 4.6, reputationScore: 68, eventsCompleted: 19,
  },
  {
    id: "org-012", name: "Nova Flux", bio: "Special events coordinator. Holidays, milestones, and spectacles.",
    followerCount: 445, eventCount: 18, rating: 4.9, reputationScore: 90, eventsCompleted: 16,
  },
];

export function getOrganizer(id: string): OrganizerProfile | undefined {
  return FAKE_ORGANIZERS.find((o) => o.id === id);
}
