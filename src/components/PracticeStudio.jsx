import { useEffect, useMemo, useRef, useState } from 'react'
import { phonemes } from '../data/phonemes'
import { Mic, Play, Square } from 'lucide-react'

export default function PracticeStudio(){
  const [target, setTarget] = useState(phonemes[0]?.ipa || '')
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [rms, setRms] = useState(0)
  const [zcr, setZcr] = useState(0)
  const [score, setScore] = useState(null)
  const chunksRef = useRef([])
  const analyserRef = useRef(null)
  const rafRef = useRef(0)

  const targetPhoneme = useMemo(()=> phonemes.find(p=>p.ipa===target),[target])

  useEffect(()=>()=>{ cancelAnimationFrame(rafRef.current) },[])

  const start = async ()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e)=>{ if(e.data.size>0) chunksRef.current.push(e.data) }
      mr.onstop = ()=>{
        const blob = new Blob(chunksRef.current, {type:'audio/webm'})
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        // simple scoring based on loudness and voicing estimate
        const loudness = Math.min(1, rms/60)
        const voicing = 1 - Math.min(1, zcr/0.25)
        const s = Math.round((0.6*loudness + 0.4*voicing) * 100)
        setScore(s)
        const key = `score_${target}`
        const prev = Number(localStorage.getItem(key)||0)
        if(s>prev) localStorage.setItem(key, String(s))
      }
      setMediaRecorder(mr)
      setRecording(true)
      mr.start()

      const ctx = new AudioContext()
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      src.connect(analyser)
      analyserRef.current = analyser

      const buf = new Uint8Array(analyser.fftSize)
      const tick = ()=>{
        analyser.getByteTimeDomainData(buf)
        // RMS
        let sum=0
        for(let i=0;i<buf.length;i++){
          const v = (buf[i]-128)/128
          sum += v*v
        }
        const rmsVal = Math.sqrt(sum/buf.length)
        setRms(Math.round(rmsVal*100))
        // ZCR
        let crossings=0
        for(let i=1;i<buf.length;i++){
          const a = buf[i-1]-128
          const b = buf[i]-128
          if((a>=0 && b<0) || (a<0 && b>=0)) crossings++
        }
        setZcr(crossings/buf.length)
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    }catch(e){
      alert('Microphone access is required for practice.')
    }
  }

  const stop = ()=>{
    if(mediaRecorder && recording){
      mediaRecorder.stop()
      setRecording(false)
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold">Select target phoneme</h3>
        <div className="mt-3 grid grid-cols-6 gap-2">
          {phonemes.map(p=> (
            <button key={p.ipa} onClick={()=>setTarget(p.ipa)} className={`px-2 py-2 rounded-lg text-sm border transition ${target===p.ipa ? 'bg-violet-600 text-white border-violet-600' : 'bg-white hover:bg-slate-50 border-slate-200'}`} title={p.name}>
              {p.ipa}
            </button>
          ))}
        </div>
        <div className="mt-4 text-sm text-slate-600">
          <p>Tip: Aim for steady airflow and clear articulator placement. Use the articulatory checklist while recording.</p>
        </div>
      </aside>

      <section className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-semibold">Practice: {targetPhoneme?.ipa} <span className="text-slate-500 text-base">{targetPhoneme?.name}</span></h4>
            <p className="text-sm text-slate-600">Articulatory checklist</p>
          </div>
          <div className="flex items-center gap-2">
            {!recording ? (
              <button onClick={start} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700">
                <Mic size={16}/> Start
              </button>
            ) : (
              <button onClick={stop} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700">
                <Square size={16}/> Stop
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <ul className="text-sm text-slate-700 space-y-2">
              {targetPhoneme?.checklist?.map((c,i)=> (
                <li key={i} className="flex items-start gap-2">
                  <input type="checkbox" id={`c_${i}`} className="mt-1 rounded border-slate-300 text-violet-600 focus:ring-violet-500"/>
                  <label htmlFor={`c_${i}`}>{c}</label>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-xs text-slate-500">Examples: {(targetPhoneme?.examples?.US||[]).slice(0,3).join(', ')}</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <div>Loudness (RMS)</div>
              <div className="font-medium">{rms}</div>
            </div>
            <div className="w-full h-2 bg-white border border-slate-200 rounded mt-1 overflow-hidden">
              <div className="h-full bg-violet-600" style={{width: `${Math.min(100, rms)}%`}}/>
            </div>
            <div className="flex items-center justify-between text-sm mt-3">
              <div>Voicing estimate (lower ZCR = more voicing)</div>
              <div className="font-medium">{zcr.toFixed(3)}</div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              {audioUrl && (
                <audio src={audioUrl} controls className="w-full"/>
              )}
              <button disabled={!audioUrl} onClick={()=>{
                const a = new Audio(audioUrl); a.play()
              }} className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-sm disabled:opacity-50">
                <Play size={16}/> Play
              </button>
            </div>
            <div className="mt-4">
              <div className="text-sm">Score (prototype)</div>
              <div className="text-3xl font-semibold">{score ?? '--'}</div>
              <div className="text-xs text-slate-500 mt-1">We estimate clarity using loudness and voicing; for expert feedback, follow the coaching cues.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
