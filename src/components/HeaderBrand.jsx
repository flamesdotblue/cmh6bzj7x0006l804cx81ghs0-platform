import { useEffect, useState } from 'react'
import { Settings, Volume2 } from 'lucide-react'

export default function HeaderBrand(){
  const [logoUrl, setLogoUrl] = useState('')
  const [profUrl, setProfUrl] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(()=>{
    const l = localStorage.getItem('vf_logo_url')
    const p = localStorage.getItem('vf_prof_url')
    if(l) setLogoUrl(l)
    if(p) setProfUrl(p)
  },[])

  const save = ()=>{
    localStorage.setItem('vf_logo_url', logoUrl)
    localStorage.setItem('vf_prof_url', profUrl)
    setEditing(false)
  }

  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-slate-200 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="VocalFitness logo" className="w-full h-full object-cover"/>
            ) : (
              <Volume2 className="text-white"/>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">DappersClass by <span className="text-violet-700">VocalFitness</span></h1>
            <p className="text-sm text-slate-600">Professor Steve Dapper’s ESOL eloquence SPEAKING method</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full ring-1 ring-slate-200 overflow-hidden bg-slate-100">
            {profUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profUrl} alt="Professor Steve Dapper" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Prof</div>
            )}
          </div>
          <button onClick={()=>setEditing(v=>!v)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-sm">
            <Settings size={16}/> Branding
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t border-slate-200 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">VocalFitness logo URL</label>
              <input value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-md border-slate-300 focus:border-violet-500 focus:ring-violet-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Professor Dapper image URL</label>
              <input value={profUrl} onChange={e=>setProfUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-md border-slate-300 focus:border-violet-500 focus:ring-violet-500"/>
            </div>
            <div className="md:col-span-2">
              <button onClick={save} className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm">Save branding</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
