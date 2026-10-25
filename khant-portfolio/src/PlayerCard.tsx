import { useEffect, useState } from 'react'
import { bestRank, formatRating, formatStat, isStat, loadCs2Data, type Cs2Data, type MaybeStat } from './cs2'
import { portfolio } from './portfolio'

const profiles = portfolio.gaming.profiles

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className={`player-metric${value === '—' ? ' is-unavailable' : ''}`} title={note}>
    <dt>{label}</dt><dd>{value}<span className="sr-only">{value === '—' ? ' unavailable' : ''}</span></dd>
  </div>
}

function rankValue(value: MaybeStat | undefined, loading: boolean) {
  if (loading) return '—'
  if (!isStat(value) || value <= 0) return 'Unranked'
  return value.toLocaleString('en-AU')
}

export default function PlayerCard() {
  const [data, setData] = useState<Cs2Data | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'rate-limited'>('loading')
  const [request, setRequest] = useState(0)

  useEffect(() => {
    let active = true
    loadCs2Data().then(result => {
      if (active) { setData(result); setState('ready') }
    }).catch(reason => {
      if (active) {
        setData(null)
        setState(reason instanceof Error && reason.message === 'rate_limited' ? 'rate-limited' : 'error')
      }
    })
    return () => { active = false }
  }, [request])

  const refresh = () => {
    setData(null)
    setState('loading')
    setRequest(value => value + 1)
  }
  const loading = state === 'loading'
  const failed = state === 'error' || state === 'rate-limited'
  const profile = data?.profile
  const recent = data?.recent
  const sample = recent && isStat(recent.matchesPlayed)
    ? `Last ${recent.matchesPlayed} 5v5 matches` : 'Recent 5v5 matches'
  const summaryNote = 'Leetify profile summary. Scores and units follow Leetify’s display.'
  const recentNote = recent ? `${sample}, as supplied by Leetify.` : 'Leetify’s recent 5v5 summary is unavailable.'
  const premierBest = bestRank(data, 'matchmaking')
  const faceitBest = bestRank(data, 'faceit')
  const faceitElo = isStat(data?.faceit?.elo) && data.faceit.elo > 0 ? data.faceit.elo : null
  const faceitEloNote = faceitElo !== null ? 'Latest FACEIT Elo reported on Leetify’s profile'
    : 'Current FACEIT Elo unavailable'
  const winRate = isStat(recent?.winRate) ? recent.winRate : profile?.winrate
  // The public profile's rating is already formatted to the app's display scale.
  const rating = isStat(recent?.leetifyRating) ? formatRating(recent.leetifyRating)
    : isStat(profile?.ranks.leetify)
      ? `${profile.ranks.leetify >= 0 ? '+' : ''}${profile.ranks.leetify.toFixed(2)}` : '—'

  return <article className="player-card" aria-label={`${portfolio.gaming.game} player statistics`}>
    <header className="player-header">
      <div className="player-details">
        <p className="item-label">{portfolio.gaming.game}</p>
        <h3>{portfolio.gaming.handle}</h3>
      </div>
      <div className="player-profile-links" aria-label="Player profiles">
        <a href={profiles.steam} className="player-profile-link" aria-label="Steam profile" title="Steam profile"><img src="/brands/steam.svg" width="20" height="20" alt="" /></a>
        <a href={profiles.faceit} className="player-profile-link" aria-label="FACEIT profile" title="FACEIT profile"><img src="/brands/faceit.svg" width="20" height="20" alt="" /></a>
        <a href={profiles.leetify} className="player-profile-link" aria-label="View on Leetify" title="View on Leetify"><img src="/brands/leetify.svg" width="20" height="20" alt="" /></a>
      </div>
    </header>

    <div className="player-data" aria-busy={loading}>
      <div className="player-ranks">
        <section className="player-rank premier-rank" aria-label="Premier rank">
          <p className="rank-label"><span className="rank-marker" aria-hidden="true">CS</span>Premier</p>
          <div className="rank-values"><div><span className="rank-caption">Current</span><strong>{failed ? '—' : rankValue(profile?.ranks.premier, loading)}</strong></div>
            <div className="rank-best" title="Highest Premier rating returned across Leetify’s tracked CS2 seasons"><span className="rank-caption">Best</span><strong>{isStat(premierBest) ? premierBest.toLocaleString('en-AU') : '—'}</strong></div></div>
        </section>
        <section className="player-rank faceit-rank" aria-label="FACEIT rank">
          <p className="rank-label"><img src="/brands/faceit.svg" width="16" height="16" alt="" />FACEIT</p>
          <div className="rank-values"><div title={faceitEloNote}><span className="rank-caption">Current Elo</span><strong>{faceitElo !== null ? faceitElo.toLocaleString('en-AU') : '—'}</strong></div>
            <div className="rank-best" title="Highest FACEIT level returned across Leetify’s tracked CS2 seasons"><span className="rank-caption">Best level</span><strong>{formatStat(faceitBest)}</strong></div></div>
        </section>
      </div>

      <dl className="player-stats">
        <Metric label="Leetify Rating" value={rating} note={isStat(recent?.leetifyRating) ? recentNote : summaryNote} />
        <Metric label="Win Rate" value={isStat(winRate) ? `${(winRate * 100).toFixed(0)}%` : '—'} note={recent ? recentNote : summaryNote} />
        <Metric label="K/D" value={formatStat(recent?.kdRatio, 2)} note={recentNote} />
        <Metric label="Aim" value={formatStat(profile?.rating.aim)} note={summaryNote} />
        <Metric label="Utility" value={formatStat(profile?.rating.utility)} note={summaryNote} />
        <Metric label="Positioning" value={formatStat(profile?.rating.positioning)} note={summaryNote} />
        <Metric label="Clutch" value={formatRating(profile?.rating.clutch)} note={`${summaryNote} Clutch rating, not clutch win percentage.`} />
        <Metric label="Preaim" value={formatStat(profile?.stats.preaim, 2, '°')} note={`${summaryNote} Crosshair placement in degrees.`} />
        <Metric label="Time to Damage" value={formatStat(profile?.stats.reaction_time_ms, 0, ' ms')} note={`${summaryNote} Time to first damage after spotting an enemy.`} />
        <Metric label="HS Kill %" value={formatStat(recent?.headshotKillPercentage, 1, '%')} note={`${recentNote} Headshot kills as a percentage of kills.`} />
      </dl>
    </div>

    <footer className="player-footer">
      <div className="player-source-status">
        <p className={`player-status${failed ? ' has-error' : ''}`} role="status">
          {loading ? 'Loading statistics…' : failed
            ? state === 'rate-limited' ? 'Leetify rate limit reached. Try again shortly.' : 'Statistics temporarily unavailable.'
            : recent ? sample : 'Leetify profile summary'}
        </p>
        {state === 'ready' && (!recent || !data?.seasons) && <p className="player-partial-note">{!recent && !data?.seasons ? 'Recent stats and best ranks unavailable.' : !recent ? 'K/D and HS Kill % unavailable.' : 'Best ranks unavailable.'}</p>}
        <button type="button" className="player-refresh" onClick={refresh} disabled={loading}>{failed ? 'Try again' : 'Refresh'}<span aria-hidden="true"> ↻</span></button>
      </div>
      <a className="leetify-attribution" href="https://leetify.com/" aria-label="Data Provided by Leetify"><img src="/brands/leetify-data-provided-by.png" alt="Data Provided by Leetify" width="135" height="58" /></a>
    </footer>
  </article>
}
