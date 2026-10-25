import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import { track } from '../lib/track'
import { useTitle } from '../lib/useTitle'

interface Question {
  id: number
  statement: string
  is_true: boolean
  explanation: string
  condition_slug: string | null
}

export default function Quiz() {
  useTitle('Idées reçues')
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const questionRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    supabase
      .from('quiz_questions')
      .select('id, statement, is_true, explanation, condition_slug')
      .order('position')
      .then(({ data, error }) => (error ? setFailed(true) : setQuestions(data)))
  }, [])

  const done = questions !== null && index >= questions.length

  useEffect(() => {
    if (done) track('quiz_complete')
  }, [done])

  if (failed) return <div className="container loading"><p className="notice notice-err" role="alert">Le quiz n’a pas pu être chargé.</p></div>
  if (!questions) return <div className="container loading" role="status">Chargement…</div>

  const q = questions[index]

  const respond = (value: boolean) => {
    setAnswer(value)
    if (value === q.is_true) setScore((s) => s + 1)
    window.setTimeout(() => feedbackRef.current?.focus(), 0)
  }

  const nextQuestion = () => {
    setAnswer(null)
    setIndex((n) => n + 1)
    window.setTimeout(() => questionRef.current?.focus(), 0)
  }

  const restart = () => { setIndex(0); setScore(0); setAnswer(null) }

  return (
    <div className="container" style={{ paddingTop: 64 }}>
      <div className="quiz">
        <div className="section-head">
          <span className="overtitle">Idées reçues · vrai ou faux ?</span>
          <h1 className="h1">On croit savoir.</h1>
        </div>

        {!done ? (
          <>
            <div>
              <p className="mono muted" style={{ fontSize: 13, marginBottom: 8 }}>Question {index + 1} sur {questions.length}</p>
              <div className="progress" role="progressbar" aria-label="Progression" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index}>
                <div style={{ width: `${(index / questions.length) * 100}%` }} />
              </div>
            </div>
            <div className="panel" key={q.id}>
              <h2 ref={questionRef} tabIndex={-1} className="h2 crossfade">« {q.statement} »</h2>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary" onClick={() => respond(true)} disabled={answer !== null} aria-pressed={answer === true}>Vrai</button>
                <button type="button" className="btn btn-secondary" onClick={() => respond(false)} disabled={answer !== null} aria-pressed={answer === false}>Faux</button>
              </div>
              {answer !== null && (
                <div ref={feedbackRef} tabIndex={-1} className="crossfade" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p className={answer === q.is_true ? 'answer-ok h3' : 'answer-ko h3'}>
                    {answer === q.is_true ? 'Bien vu.' : 'Eh non.'} C’est {q.is_true ? 'vrai' : 'faux'}.
                  </p>
                  <p style={{ color: 'var(--texte-2)' }}>{q.explanation}</p>
                  {q.condition_slug && <Link to={`/handicap/${q.condition_slug}`} viewTransition>Voir la fiche</Link>}
                  <div>
                    <button type="button" className="btn btn-primary btn-sm" onClick={nextQuestion}>
                      {index + 1 < questions.length ? 'Question suivante' : 'Voir mon résultat'} <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="panel crossfade" role="status">
            <p className="overtitle">Résultat</p>
            <p className="h2">{score} sur {questions.length}</p>
            <p style={{ color: 'var(--texte-2)' }}>
              {score === questions.length
                ? 'Sans faute. Et maintenant, partagez ce que vous savez.'
                : 'Personne ne sait tout : l’important, c’est ce qu’on fait ensuite.'}
            </p>
            <div className="btn-row">
              <Link className="btn btn-primary btn-sm" to="/" viewTransition>Explorer les fiches</Link>
              <button type="button" className="btn btn-secondary btn-sm" onClick={restart}>Recommencer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
