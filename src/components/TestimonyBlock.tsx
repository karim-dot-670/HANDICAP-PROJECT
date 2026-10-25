import { useEffect, useRef } from 'react'
import type { Testimony } from '../lib/content'
import { track } from '../lib/track'

interface Props {
  testimony: Testimony
  conditionSlug: string
}

export default function TestimonyBlock({ testimony: t, conditionSlug }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  // Indicateur « témoignage terminé » : la fin de la transcription est atteinte.
  useEffect(() => {
    const el = endRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        track('testimony_complete', conditionSlug)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [conditionSlug])

  const who = `${t.witness_name}${t.witness_age ? `, ${t.witness_age} ans` : ''}`

  return (
    <article className="testimony" aria-labelledby={`temoin-${t.id}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {t.portrait_url
          ? <img className="portrait" src={t.portrait_url} alt={`Portrait de ${t.witness_name}`} style={{ objectFit: 'cover' }} />
          : <div className="portrait" role="img" aria-label={`Illustration à la place d’une photo de ${t.witness_name}`} />}
        <div>
          <h3 id={`temoin-${t.id}`} className="h3">{who}</h3>
          {t.is_pseudonym && <p className="muted" style={{ fontSize: 15 }}>Prénom modifié à sa demande</p>}
        </div>
        <div className="tags">
          {t.is_example && <span className="tag tag-corail">Exemple de ton · à réécrire avec le témoin</span>}
          {t.media_url && <span className="tag">Sous-titré</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <blockquote className="quote">« {t.quote} »</blockquote>

        {t.media_url && t.media_kind === 'video' && (
          <video controls preload="none" src={t.media_url} onEnded={() => track('testimony_complete', conditionSlug)}>
            {t.captions_url && <track kind="captions" srcLang="fr" label="Français" src={t.captions_url} default />}
          </video>
        )}
        {t.media_url && t.media_kind === 'audio' && (
          <audio controls preload="none" src={t.media_url} onEnded={() => track('testimony_complete', conditionSlug)} />
        )}

        <div className="transcript">
          <h4 className="overtitle" style={{ margin: 0 }}>Transcription</h4>
          {t.transcript.split(/\n\s*\n/).map((para, n) => <p key={n}>{para}</p>)}
        </div>

        {t.day_story.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 className="overtitle" style={{ margin: 0 }}>Une journée type</h4>
            <ul className="day-list">
              {t.day_story.map((line, n) => {
                const [time, ...rest] = line.split(' · ')
                return (
                  <li key={n}>
                    {rest.length ? <><span className="mono">{time}</span>{rest.join(' · ')}</> : line}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <div ref={endRef} aria-hidden="true" />
      </div>
    </article>
  )
}
