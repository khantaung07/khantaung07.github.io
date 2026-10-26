/**
 * Edit portfolio content here.
 */
export interface PortfolioLink {
  label: string
  href: string
  icon: 'mail' | 'github' | 'linkedin'
}

export interface TimelineEntry {
  id: string
  title: string
  organisation: string
  location: string
  period: string
  description: string | null
}

export interface Project {
  id: string
  title: string
  description: string
  href: string
  inProgress?: boolean
}

export interface Highlight {
  id: string
  title: string
  src: string
  poster: string
}

const name = 'Khant Aung'

export const portfolio = {
  meta: {
    title: "khant's page",
    description: `${name}.`,
  },
  navigation: {
    logo: 'ka',
    label: 'Main navigation',
    homeLabel: `${name} — back to top`,
    skipLabel: 'Skip to content',
    items: [
      { label: 'Experience', href: '#experience' },
      { label: 'Projects', href: '#projects' },
      { label: 'Stats', href: '#stats' },
    ],
  },
  hero: {
    name,
    introduction: 'Programmer, lawyer in an alternate timeline, professional CS2 amateur.',
    links: [
      { label: 'Email', href: 'mailto:khantaung07@gmail.com', icon: 'mail' },
      { label: 'GitHub', href: 'https://github.com/khantaung07', icon: 'github' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/khantaung07/', icon: 'linkedin' },
    ] satisfies PortfolioLink[],
  },
  currently: {
    label: 'Currently:',
    summary: 'law at USyd · learning C++',
  },
  experience: {
    title: 'Experience',
    items: [
      {
        id: 'google-swe-intern',
        title: '(Incoming) Software Engineering Intern',
        organisation: 'Google',
        location: 'Sydney, Australia',
        period: 'Nov 2026 - Feb 2027',
        description: null,
      },
      {
        id: 'usyd-ca',
        title: 'Casual Academic',
        organisation: 'University of Sydney',
        location: 'Sydney, Australia',
        period: 'Aug 2025 - Jun 2026',
        description: 'Helped first-year students with CS coursework through university Learning Hub.',
      },
      {
        id: 'google-asdi',
        title: 'Associate Software Developer Intern',
        organisation: 'Google',
        location: 'Sydney, Australia',
        period: 'Nov 2025 - Feb 2026',
        description: 'Improved internal infrastructure tooling at Google Cloud Storage.',
      },
    ] satisfies TimelineEntry[],
  },
  projects: {
    title: 'Projects',
    note: '(see github for more)',
    items: Array.of<Project>(
      {
        id: 'p2p-file-transfer',
        title: 'Peer-to-Peer File Transfer',
        description: 'A multithreaded file-transfer system in C with parallel peer connections and cryptographic integrity verification.',
        href: 'https://github.com/khantaung07/p2p_file_transfer',
      },
      {
        id: 'cs2-match-predictor',
        title: 'CS2 Match Predictor',
        description: 'Predicts CS2 match outcomes using team ratings, recent form, and map-specific performance.',
        href: 'https://github.com/khantaung07/cs2-forecast',
      },
      {
        id: 'tower-defence-game',
        title: 'Tower Defence Game',
        description: 'A Java tower defence game with modular architecture and smooth 60 FPS gameplay.',
        href: 'https://github.com/khantaung07/wtd',
      },
      {
        id: 'cross-platform-stickies',
        title: 'Cross-platform improved stickies',
        description: 'A cross-platform sticky notes app.',
        href: '',
        inProgress: true,
      },
    ),
  },
  gaming: {
    title: 'Stats',
    note: 'The only stats that matter',
    game: 'Counter-Strike 2',
    handle: 'k4tt3n',
    profiles: {
      steam: 'https://steamcommunity.com/id/ceedeez/',
      faceit: 'https://www.faceit.com/en/players/k4tt3n',
      leetify: 'https://leetify.com/public/profile/76561198156780616',
    },
    highlightsTitle: 'Highlights',
    highlights: [
      { id: 'clip-01', title: 'USP 1v4 (Ace)', src: '/clips/clip1.mp4', poster: '/clips/clip1.jpg' },
      { id: 'clip-02', title: 'AWP 4K', src: '/clips/clip2.mp4', poster: '/clips/clip2.jpg' },
      { id: 'clip-03', title: 'Deagle 1v4', src: '/clips/clip3.mp4', poster: '/clips/clip3.jpg' },
      { id: 'clip-04', title: 'AWP 1v4', src: '/clips/clip4.mp4', poster: '/clips/clip4.jpg' },
    ] satisfies Highlight[],
  },
  footer: {
    name,
    backToTop: 'Back to top',
  },
}
