import { useEffect, useMemo, useState } from 'react'
import { phonemes } from '../data/phonemes'
import { Trophy } from 'lucide-react'

function buildQuestions(){
  const qs = []
  for(const p of phonemes){
    // feature question
    qs.push({
      type: 'feature',
      prompt: `Which feature applies to ${p.ipa} (${p.name})?`,
      correct: p.features[0],
      options: shuffle([p.features[0], ...sampleOtherFeatures(p.features[0])])
    })
    // category question
    qs.push({
      type: 'category',
      prompt: `What category is ${p.ipa}?`,
      correct: p.category,
      options: shuffle(['vowel','consonant','diphthong'].sort(()=>Math.random()-0.5).slice(0,3))
    })
    // example word question
    if(p.examples.US.length>0){
      qs.push({
        type: 'example',
        prompt: `Which word contains ${p.ipa} in US English?`,
        correct: p.examples.US[0],
        options: shuffle([p.examples.US[0], ...sampleOtherWords(p.examples.US[0])])
      })
    }
  }
  return shuffle(qs).slice(0,10)
}

function shuffle(a){ return a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]) }
function sampleOtherFeatures(exclude){
  const pool = Array.from(new Set(phonemes.flatMap(p=>p.features))).filter(f=>f!==exclude)
  return shuffle(pool).slice(0,3)
}
function sampleOtherWords(exclude){
  const pool = Array.from(new Set(phonemes.flatMap(p=>p.examples.US))).filter(w=>w!==exclude)
  return shuffle(pool).slice(0,3)
}

export default function QuizProgress(){
  const [questions, setQuestions] = useState(buildQuestions())
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState([])

  const current = questions[idx]
  const correctCount = useMemo(()=> answers.filter(a=>a.correct).length, [answers])
  const progress = useMemo(()=> Math.round((idx/questions.length)*100), [idx, questions.length])

  useEffect(()=>{
    const best = Number(localStorage.getItem('quiz_best')||0)
    const currentScore = Math.round((correctCount/Math.max(1,questions.length))*100)
    if(idx===questions.length && currentScore>best){
      localStorage.setItem('quiz_best', String(currentScore))
    }
  },[idx, questions.length, correctCount])

  const pick = (opt)=>{
    if(!current) return
    const isCorrect = opt===current.correct
    setAnswers(a=>[...a,{q: current, a: opt, correct: isCorrect}])
    setIdx(i=>i+1)
  }

  const restart = ()=>{
    setQuestions(buildQuestions())
    setIdx(0)
    setAnswers([])
  }

  const best = Number(localStorage.getItem('quiz_best')||0)

  if(idx>=questions.length){
    const score = Math.round((correctCount/questions.length)*100)
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
          <Trophy/>
        </div>
        <h3 className="mt-4 text-2xl font-semibold">Test complete</h3>
        <p className="mt-1 text-slate-600">Your score: <span className="font-medium">{score}</span>. Best: {best}.</p>
        <button onClick={restart} className="mt-4 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Try another set</button>
        <div className="mt-6 text-left max-w-2xl mx-auto">
          <h4 className="font-medium">Review</h4>
          <ul className="mt-2 text-sm text-slate-700 space-y-2">
            {answers.map((a,i)=> (
              <li key={i} className={`p-3 rounded-lg border ${a.correct? 'bg-green-50 border-green-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="font-medium">{a.q.prompt}</div>
                <div className="text-slate-600">Your answer: {a.a} {a.correct? '✓':'✕'} {a.correct? '' : `(correct: ${a.q.correct})`}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-600">Evaluation test</div>
          <div className="text-2xl font-semibold">Question {idx+1} of {questions.length}</div>
        </div>
        <div className="w-48 h-2 bg-slate-100 rounded overflow-hidden">
          <div className="h-full bg-violet-600" style={{width: `${progress}%`}}/>
        </div>
      </div>

      <div className="mt-6 text-lg">{current.prompt}</div>
      <div className="mt-4 grid md:grid-cols-2 gap-3">
        {current.options.map((o,i)=> (
          <button key={i} onClick={()=>pick(o)} className="text-left px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
            {o}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h4 className="font-medium">Your progression</h4>
        <ProgressBoard/>
      </div>
    </div>
  )
}

function ProgressBoard(){
  const items = phonemes.slice(0, 24)
  return (
    <div className="mt-3 grid grid-cols-8 sm:grid-cols-12 gap-2">
      {items.map(p=>{
        const s = Number(localStorage.getItem(`score_${p.ipa}`)||0)
        return (
          <div key={p.ipa} className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-center">
            <div className="text-sm font-medium">{p.ipa}</div>
            <div className="text-xs text-slate-600">{s ? `${s}` : '--'}</div>
          </div>
        )
      })}
    </div>
  )
}
