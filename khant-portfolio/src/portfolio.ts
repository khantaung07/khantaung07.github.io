/**
 * Edit portfolio content here.
 */
export interface PortfolioLink {
  label: string
  href: string | null
  icon?: 'mail' | 'github' | 'linkedin'
}

export interface TimelineEntry {
  id: string
  title: string | null
  organisation: string | null
  location: string | null
  period: string | null
  description: string | null
  href: string | null
}

export interface Project {
  id: string
  title: string | null
  description: string | null
  tags: string[]
  links: PortfolioLink[]
}

export interface Highlight {
  id: string
  title: string | null
  description: string | null
  href: string | null
  poster: string | null
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
    introduction: 'Programmer, lawyer in an alternate timeline, and professional CS2 amateur.',
    links: [
      { label: 'Email', href: 'mailto:khantaung07@gmail.com', icon: 'mail' },
      { label: 'GitHub', href: 'https://github.com/khantaung07', icon: 'github' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/khantaung07/', icon: 'linkedin' },
    ] satisfies PortfolioLink[],
    artwork: {
      src: null as string | null,
      label: 'placeholder',
      title: 'Pikachu',
      note: 'Art & animation todo',
      alt: 'Shiny Pikachu surfing above the waves',
    },
  },
  currently: {
    label: 'Currently:',
    summary: 'law at USyd · learning C++ for CP',
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
        href: null,
      },
      {
        id: 'usyd-ca',
        title: 'Casual Academic',
        organisation: 'University of Sydney',
        location: 'Sydney, Australia',
        period: 'Aug 2025 - Jun 2026',
        description: 'Helped first-year students with CS coursework through university Learning Hub.',
        href: null,
      },
      {
        id: 'google-asdi',
        title: 'Associate Software Developer Intern',
        organisation: 'Google',
        location: 'Sydney, Australia',
        period: 'Nov 2025 - Feb 2026',
        description: 'Improved internal infrastructure tooling at Google Cloud Storage.',
        href: null,
      },
    ] satisfies TimelineEntry[],
  },
  projects: {
    title: 'Projects',
    note: '(including this website)',
    items: Array.of<Project>(
      { id: 'project-01', title: null, description: null, tags: [], links: [] },
      { id: 'project-02', title: null, description: null, tags: [], links: [] },
    ),
  },
  gaming: {
    title: 'Stats',
    note: 'The only stats that matter',
    game: 'Counter-Strike 2',
    playerName: name,
    handle: 'k4tt3n' as string | null,
    links: [
      { label: 'FACEIT', href: null },
      { label: 'Leetify', href: null },
    ] satisfies PortfolioLink[],
    highlightsTitle: 'Highlights',
    highlights: [
      { id: 'clip-01', title: null, description: null, href: null, poster: null },
      { id: 'clip-02', title: null, description: null, href: null, poster: null },
      { id: 'clip-03', title: null, description: null, href: null, poster: null },
      { id: 'clip-04', title: null, description: null, href: null, poster: null },
    ] satisfies Highlight[],
  },
  placeholders: {
    badge: 'To add',
    role: 'Your experience goes here',
    organisation: 'Role & organisation to add',
    dates: 'Dates to add',
    location: 'Location to add',
    project: 'Project',
    projectDescription: 'Description',
    projectLink: 'Project links to add',
    playerHandle: 'Player handle to add',
    profileLink: 'Link to add',
    clip: 'Highlight',
    clipDescription: 'Clip description',
    clipMedia: 'Clip placeholder',
  },
  footer: {
    name,
    backToTop: 'Back to top',
  },
}
