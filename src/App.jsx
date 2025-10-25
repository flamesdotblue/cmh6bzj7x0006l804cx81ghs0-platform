import { useState } from 'react'
import HeaderBrand from './components/HeaderBrand'
import PhonemeExplorer from './components/PhonemeExplorer'
import PracticeStudio from './components/PracticeStudio'
import QuizProgress from './components/QuizProgress'
import { BookOpen, Mic, Trophy } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('learn')
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <HeaderBrand />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-2 mt-4">
          <button onClick={() => setActiveTab('learn')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${activeTab==='learn' ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100 border border-slate-200'}`}>
            <BookOpen size={18}/> Learn
          </button>
          <button onClick={() => setActiveTab('practice')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${activeTab==='practice' ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100 border border-slate-200'}`}>
            <Mic size={18}/> Practice
          </button>
          <button onClick={() => setActiveTab('quiz')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${activeTab==='quiz' ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100 border border-slate-200'}`}>
            <Trophy size={18}/> Test & Progress
          </button>
        </nav>

        <div className="mt-6">
          {activeTab === 'learn' && <PhonemeExplorer />}
          {activeTab === 'practice' && <PracticeStudio />}
          {activeTab === 'quiz' && <QuizProgress />}
        </div>
      </div>

      <footer className="mt-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-600">
          <p>DappersClass by VocalFitness. Uses Professor Steve Dapper’s proprietary ESOL eloquence SPEAKING method. For more information, visit vocalfitness.org.</p>
          <p className="mt-1">This educational app focuses on articulatory phonetics to learn UK and US IPA phonemes with practice and evaluation.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
