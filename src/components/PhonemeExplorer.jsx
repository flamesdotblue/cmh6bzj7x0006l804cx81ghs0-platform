import { useMemo, useState } from 'react'
import { phonemes } from '../data/phonemes'
import { ChevronDown, ChevronRight, Volume2 } from 'lucide-react'

export default function PhonemeExplorer(){
  const [accent, setAccent] = useState('US')
  const [openGroups, setOpenGroups] = useState({vowels: true, diphthongs: true, consonants: false})
  const [activePhoneme, setActivePhoneme] = useState(phonemes[0]?.ipa ?? '')

  const groups = useMemo(()=>{
    return {
      vowels: phonemes.filter(p=>p.category==='vowel' && (p.accents.includes(accent) || p.accents.includes('Both'))),
      diphthongs: phonemes.filter(p=>p.category==='diphthong' && (p.accents.includes(accent) || p.accents.includes('Both'))),
      consonants: phonemes.filter(p=>p.category==='consonant' && (p.accents.includes(accent) || p.accents.includes('Both'))),
    }
  },[accent])

  const active = phonemes.find(p=>p.ipa===activePhoneme)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Phoneme Inventory</h2>
          <select value={accent} onChange={e=>setAccent(e.target.value)} className="text-sm rounded-md border-slate-300 focus:border-violet-500 focus:ring-violet-500">
            <option value="US">US (General American)</option>
            <option value="UK">UK (Received Pronunciation)</option>
          </select>
        </div>

        <div className="mt-3 space-y-3">
          {(['vowels','diphthongs','consonants']).map((k)=>{
            const title = k.charAt(0).toUpperCase()+k.slice(1)
            const list = groups[k]
            const open = openGroups[k]
            return (
              <div key={k}>
                <button onClick={()=>setOpenGroups(s=>({...s,[k]:!s[k]}))} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-sm font-medium">{title}</span>
                  {open ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                </button>
                {open && (
                  <div className="mt-2 grid grid-cols-6 gap-2">
                    {list.map(p=> (
                      <button key={p.ipa} onClick={()=>setActivePhoneme(p.ipa)} className={`px-2 py-2 rounded-lg text-sm border transition ${activePhoneme===p.ipa ? 'bg-violet-600 text-white border-violet-600' : 'bg-white hover:bg-slate-50 border-slate-200'}`} title={p.name}>
                        {p.ipa}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      <section className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-6">
        {active ? (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">{active.ipa} <span className="text-slate-500 text-base">{active.name}</span></h3>
                <p className="text-slate-600 text-sm">Category: {active.category} • Features: {active.features.join(', ')}</p>
              </div>
              <button onClick={()=>speakExample(active, accent)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50 text-sm">
                <Volume2 size={16}/> Speak examples
              </button>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-medium">Articulation</h4>
                <ul className="mt-2 text-sm text-slate-700 list-disc list-inside space-y-1">
                  {active.articulation.map((a,i)=> <li key={i}>{a}</li>)}
                </ul>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-medium">Examples ({accent})</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(active.examples[accent]||[]).map((w,i)=> (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-slate-200 text-sm">{w}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium">Professor’s coaching cue</h4>
              <p className="mt-1 text-sm text-slate-700">{active.coaching}</p>
            </div>
          </div>
        ) : (
          <p>Select a phoneme to view details.</p>
        )}
      </section>
    </div>
  )
}

function speakExample(p, accent){
  const synth = window.speechSynthesis
  if(!synth) return
  const words = p.examples[accent] || []
  const text = words.join(', ')
  const u = new SpeechSynthesisUtterance(text)
  if(accent==='UK'){
    const voice = synth.getVoices().find(v=>/en-GB/i.test(v.lang))
    if(voice) u.voice = voice
  } else {
    const voice = synth.getVoices().find(v=>/en-US/i.test(v.lang))
    if(voice) u.voice = voice
  }
  synth.speak(u)
}
