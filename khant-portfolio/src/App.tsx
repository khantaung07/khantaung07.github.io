import { portfolio, type Highlight, type PortfolioLink, type TimelineEntry } from './portfolio'
import PlayerCard from './PlayerCard'
import WaveBackground from './components/pixel-waves/WaveBackground'
import './App.css'

const iconPaths = {
  arrow: <path d="M5 15 15 5M5 5h10v10" />,
  mail: <><rect x="3" y="5" width="14" height="10" rx="1" /><path d="m3 6 7 5 7-5" /></>,
  github: <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.304-5.467-1.334-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 5.804c1.02.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.654 1.652.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.48 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12Z" />,
  linkedin: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />,
  code: <path d="m6 5-4 5 4 5m8-10 4 5-4 5M12 3 8 17" />,
}

type IconName = keyof typeof iconPaths

function Icon({ name }: { name: IconName }) {
  const isBrand = name === 'github' || name === 'linkedin'
  return <svg className="icon" viewBox={isBrand ? '0 0 24 24' : '0 0 20 20'} fill={isBrand ? 'currentColor' : 'none'} stroke={isBrand ? 'none' : 'currentColor'} strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">{iconPaths[name]}</svg>
}

function ContentLink({ link }: { link: PortfolioLink }) {
  return (
    <a className="content-link" href={link.href}>
      <Icon name={link.icon} />
      {link.label}
      {!link.href.startsWith('mailto:') && <Icon name="arrow" />}
    </a>
  )
}

function SectionHeading({ number, title, note, id }: { number: string; title: string; note?: string; id: string }) {
  return <div className="section-heading"><div className="section-title"><span className="section-number" aria-hidden="true">{number}</span><h2 id={id}>{title}</h2></div>{note && <p>{note}</p>}</div>
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  return (
    <li className="timeline-row">
      <span className="timeline-marker" aria-hidden="true" />
      <div className="timeline-content">
        <h4>{entry.title}</h4>
        <p>{entry.organisation}</p>
        {entry.description && <p className="timeline-description">{entry.description}</p>}
      </div>
      <div className="timeline-meta">
        <span className="timeline-period">{entry.period}</span>
        <span className="timeline-location">{entry.location}</span>
      </div>
    </li>
  )
}

function HighlightCard({ clip, index }: { clip: Highlight; index: number }) {
  return <li className="highlight-card">
    <div className="clip-preview">
      <video controls playsInline preload="none" poster={clip.poster} aria-label={clip.title}>
        <source src={clip.src} type="video/mp4" />
        <a href={clip.src}>Watch {clip.title}</a>
      </video>
      <span className="clip-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
    </div>
    <div className="clip-caption"><h4>{clip.title}</h4></div>
  </li>
}

function App() {
  return (
    <>
      <a className="skip-link" href="#main">{portfolio.navigation.skipLabel}</a>
      <div className="site-shell" id="top">
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label={portfolio.navigation.homeLabel}>{portfolio.navigation.logo}<span aria-hidden="true">.</span></a>
          <nav aria-label={portfolio.navigation.label}>
            {portfolio.navigation.items.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
        </header>

        <main id="main">
          <section className="hero" aria-labelledby="hero-title">
            <WaveBackground spriteSrc="/shiny-pikachu.png" waveHeight={250} speed={2.4} />
            <div className="hero-content">
              <h1 id="hero-title">{portfolio.hero.name}<span className="name-period" aria-hidden="true">.</span></h1>
              <p className="hero-introduction">{portfolio.hero.introduction}</p>
              <div className="hero-links">{portfolio.hero.links.map(link => <ContentLink key={link.label} link={link} />)}</div>
              <p className="hero-currently">
                <span className="hero-currently-label">{portfolio.currently.label}</span>{' '}
                {portfolio.currently.summary}
              </p>
            </div>
          </section>

          <section className="content-section" id="experience" aria-labelledby="experience-title">
            <SectionHeading number="01" title={portfolio.experience.title} id="experience-title" />
            <ul className="experience-list">
              {portfolio.experience.items.map(entry => <TimelineRow key={entry.id} entry={entry} />)}
            </ul>
          </section>

          <section className="content-section" id="projects" aria-labelledby="projects-title">
            <SectionHeading number="02" title={portfolio.projects.title} note={portfolio.projects.note} id="projects-title" />
            <div className="project-grid">{portfolio.projects.items.map((project, index) => <article className="project-card" key={project.id}>
              <div className="project-card-top"><span className="project-index">{String(index + 1).padStart(2, '0')}</span>{project.inProgress && <span className="project-status">In progress</span>}<Icon name="code" /></div>
              <h3><a className="content-link project-title-link" href={project.href} onClick={event => { if (!project.href) event.preventDefault() }}><span>{project.title}</span><Icon name="arrow" /></a></h3><p>{project.description}</p>
            </article>)}</div>
          </section>

          <section className="content-section" id="stats" aria-labelledby="gaming-title">
            <SectionHeading number="03" title={portfolio.gaming.title} note={portfolio.gaming.note} id="gaming-title" />
            <PlayerCard />
            <h3 className="highlights-heading">{portfolio.gaming.highlightsTitle}</h3>
            <ul className="highlights-grid">{portfolio.gaming.highlights.map((clip, index) => <HighlightCard key={clip.id} clip={clip} index={index} />)}</ul>
          </section>
        </main>

        <footer className="site-footer"><div><span className="footer-name">{portfolio.footer.name}<span aria-hidden="true">.</span></span></div><a href="#top">{portfolio.footer.backToTop}<span aria-hidden="true">↑</span></a></footer>
      </div>
    </>
  )
}

export default App
