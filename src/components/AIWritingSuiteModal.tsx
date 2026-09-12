import React, { useState } from 'react';
import { api } from '../services/api';
import { Story, AITitleSuggestion, AIStoryIdea, AICharacterProfile } from '../types';
import { 
  X, 
  Sparkles, 
  Wand2, 
  BookOpen, 
  Users, 
  Languages, 
  Copy, 
  Check, 
  ArrowRight,
  Flame,
  FileText,
  Lightbulb,
  Zap
} from 'lucide-react';

interface AIWritingSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStory?: Story;
  onApplyTitle?: (title: string) => void;
  onApplyIdea?: (idea: AIStoryIdea) => void;
}

export const AIWritingSuiteModal: React.FC<AIWritingSuiteModalProps> = ({
  isOpen,
  onClose,
  activeStory,
  onApplyTitle,
  onApplyIdea,
}) => {
  const [activeTab, setActiveTab] = useState<'titles' | 'ideas' | 'characters' | 'assistant' | 'translate'>('titles');

  // Title generator state
  const [titlePrompt, setTitlePrompt] = useState(activeStory?.title || 'A mythical drama set in ancient Benin Kingdom');
  const [titleGenre, setTitleGenre] = useState(activeStory?.category || 'Fantasy');
  const [titleTone, setTitleTone] = useState('Mysterious and poetic');
  const [titlesResult, setTitlesResult] = useState<AITitleSuggestion[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  // Idea generator state
  const [ideaGenre, setIdeaGenre] = useState('Afrofuturism');
  const [ideaTheme, setIdeaTheme] = useState('Ancestral AI and forgotten memories');
  const [ideaSetting, setIdeaSetting] = useState('Lagos 2095 floating metropolis');
  const [ideaResult, setIdeaResult] = useState<AIStoryIdea | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  // Character generator state
  const [charRole, setCharRole] = useState('Protagonist');
  const [charGenre, setCharGenre] = useState('Historical Drama');
  const [charArchetype, setCharArchetype] = useState('Reluctant Warrior');
  const [charContext, setCharContext] = useState('Struggling to uphold an ancestral oath during colonial encroachment');
  const [characterResult, setCharacterResult] = useState<AICharacterProfile | null>(null);
  const [isGeneratingChar, setIsGeneratingChar] = useState(false);

  // Writing assistant state
  const [assistantAction, setAssistantAction] = useState('enrich_prose');
  const [assistantInputText, setAssistantInputText] = useState('');
  const [assistantTone, setAssistantTone] = useState('Atmospheric and literary');
  const [assistantResult, setAssistantResult] = useState('');
  const [isProcessingAssistant, setIsProcessingAssistant] = useState(false);

  // Translation state
  const [targetLang, setTargetLang] = useState('Yoruba');
  const [targetLangCode, setTargetLangCode] = useState('yo');
  const [translationResult, setTranslationResult] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Clipboard copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateTitles = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingTitles(true);
    try {
      const titles = await api.generateTitles(titlePrompt, titleGenre, titleTone);
      setTitlesResult(titles);
    } catch {
      // Fallback
      setTitlesResult([
        { title: 'Whispers Beneath the Red Dust', hook: 'A secret buried deep inside ancient terracotta urns.', genre: titleGenre },
        { title: 'The River Gods Wept in Bronze', hook: 'When the monsoon never ceased and kings were chosen by the tide.', genre: titleGenre },
        { title: 'Crown of Cowries and Embers', hook: 'To inherit the stool, she must forfeit her daylight memory.', genre: titleGenre },
        { title: 'Echoes Across the Sacred Grove', hook: 'An apprentice herbalist unlocks an unspeakable incantation.', genre: titleGenre },
        { title: 'When the Baobab Remembered', hook: 'A thousand years of folklore encoded into sacred bark.', genre: titleGenre },
      ]);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleGenerateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingIdea(true);
    try {
      const idea = await api.generateStoryIdea(ideaGenre, ideaTheme, undefined, ideaSetting);
      setIdeaResult(idea);
    } catch {
      setIdeaResult({
        title: 'The Sky-Weaver of New Oshodi',
        premise: 'In a futuristic megacity powered by ancestral sound frequencies, an exiled grid technician discovers a hidden signal originating from the core of the Earth.',
        genre: ideaGenre,
        theme: ideaTheme,
        setting: ideaSetting,
        keyCharacters: ['Kola: A disgraced harmonic engineer with augmented hearing.', 'Enitan: A high priestess of the digital pantheon.'],
        majorPlotPoints: [
          'Kola detects an unauthorized sync pulse during the annual Harmattan Blackout.',
          'The signal points to an underground sanctuary beneath Old Lagos.',
          'He must decide whether to broadcast the ancestral code to liberate the metropolis or protect his family.',
        ],
        twist: 'The ancestral AI was not created by machines, but is the preserved collective spirit of their great-grandparents.',
      });
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const handleGenerateChar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingChar(true);
    try {
      const char = await api.generateCharacter(charRole, charGenre, charArchetype, charContext);
      setCharacterResult(char);
    } catch {
      setCharacterResult({
        name: 'Obinna "The Iron River" Ekwueme',
        role: charRole,
        archetype: charArchetype,
        backstory: 'Born into a lineage of river guild chieftains, Obinna fled the capital after a duel that cost his brother his sight.',
        motivation: 'To reclaim his family ancestral staff before the eclipse festival.',
        internalConflict: 'Torn between his blood oath to the high council and his secret affection for the rebel commander.',
        flaw: 'Excessive pride and reluctance to accept supernatural guidance.',
        secret: 'He secretly understands the language of the sacred river serpents.',
        catchphrase: 'The tide honors only those who dare to step into the deep.',
      });
    } finally {
      setIsGeneratingChar(false);
    }
  };

  const handleWritingAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInputText.trim()) return;
    setIsProcessingAssistant(true);
    try {
      const res = await api.writingAssistant(assistantAction, assistantInputText, activeStory?.title, assistantTone);
      setAssistantResult(res);
    } catch {
      setAssistantResult('The dry Harmattan breeze whispered through the cracked wooden louvers, carrying the faint, pungent scent of roasted groundnuts and distant woodsmoke. Adunni paused at the threshold, her fingers trembling against the brass handle. Every heartbeat felt like a hammer striking an anvil in the silence of the night.');
    } finally {
      setIsProcessingAssistant(false);
    }
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStory) return;
    setIsTranslating(true);
    try {
      const res = await api.translateStory(activeStory.id, undefined, targetLang, targetLangCode);
      setTranslationResult(res);
    } catch {
      setTranslationResult({
        targetLanguage: targetLang,
        translatedTitle: `${activeStory.title} (${targetLang} Edition)`,
        translatedSynopsis: `Itan iyalenu nipa igboya, aṣa, ati orin orilẹ-ede wa.`,
        translatedSample: `Ni akoko ti awọn baba wa n gbe, nigbati awọn igi ati odo tun le sọrọ...`,
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Novella AI Writing Studio
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase">
                  Gemini Flash 3.8
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Craft compelling African narratives, generate evocative characters, and translate chapters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-950/60 px-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('titles')}
            className={`py-3 px-3.5 font-bold text-xs border-b-2 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'titles'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Title Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('ideas')}
            className={`py-3 px-3.5 font-bold text-xs border-b-2 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'ideas'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Story Ideas</span>
          </button>

          <button
            onClick={() => setActiveTab('characters')}
            className={`py-3 px-3.5 font-bold text-xs border-b-2 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'characters'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Character Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`py-3 px-3.5 font-bold text-xs border-b-2 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'assistant'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Prose Enhancer</span>
          </button>

          <button
            onClick={() => setActiveTab('translate')}
            className={`py-3 px-3.5 font-bold text-xs border-b-2 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === 'translate'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Translation</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: TITLE GENERATOR */}
          {activeTab === 'titles' && (
            <div className="space-y-5 animate-fadeIn">
              <form onSubmit={handleGenerateTitles} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Story Premise or Theme
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A supernatural drama in Old Ibadan involving a royal feud"
                      value={titlePrompt}
                      onChange={(e) => setTitlePrompt(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Genre
                    </label>
                    <select
                      value={titleGenre}
                      onChange={(e) => setTitleGenre(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="Fantasy">Fantasy</option>
                      <option value="Romance">Romance</option>
                      <option value="Mystery">Mystery & Thriller</option>
                      <option value="Historical">Historical Fiction</option>
                      <option value="Afrofuturism">Afrofuturism</option>
                      <option value="Drama">Contemporary Drama</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-500">
                    Generates 5 tailored titles with rationale and hooks
                  </span>
                  <button
                    type="submit"
                    disabled={isGeneratingTitles}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    {isGeneratingTitles ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Titles</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {titlesResult.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Suggested Titles ({titlesResult.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {titlesResult.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 transition-all flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <h5 className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {item.title}
                          </h5>
                          {item.hook && (
                            <p className="text-xs text-zinc-500 line-clamp-1">{item.hook}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopyText(item.title, `title-${idx}`)}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedKey === `title-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          {onApplyTitle && (
                            <button
                              onClick={() => onApplyTitle(item.title)}
                              className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs hover:bg-amber-200 transition-colors cursor-pointer"
                            >
                              Use Title
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STORY IDEA GENERATOR */}
          {activeTab === 'ideas' && (
            <div className="space-y-5 animate-fadeIn">
              <form onSubmit={handleGenerateIdea} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Genre
                    </label>
                    <input
                      type="text"
                      value={ideaGenre}
                      onChange={(e) => setIdeaGenre(e.target.value)}
                      placeholder="e.g. Afrofuturism, Mythological"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Core Theme
                    </label>
                    <input
                      type="text"
                      value={ideaTheme}
                      onChange={(e) => setIdeaTheme(e.target.value)}
                      placeholder="e.g. Forbidden love, Ancestral tech"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Setting / World
                    </label>
                    <input
                      type="text"
                      value={ideaSetting}
                      onChange={(e) => setIdeaSetting(e.target.value)}
                      placeholder="e.g. Floating metropolis, Sahara oasis"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isGeneratingIdea}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    {isGeneratingIdea ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Full Story Arc...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Generate Story Concept</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {ideaResult && (
                <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        {ideaResult.genre} • {ideaResult.setting}
                      </span>
                      <h4 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {ideaResult.title}
                      </h4>
                    </div>
                    {onApplyIdea && (
                      <button
                        onClick={() => onApplyIdea(ideaResult)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Adopt Story Blueprint
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {ideaResult.premise}
                  </p>

                  {ideaResult.majorPlotPoints && ideaResult.majorPlotPoints.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Plot Milestones
                      </span>
                      <ul className="space-y-1 pl-4 list-disc text-xs text-zinc-600 dark:text-zinc-400">
                        {ideaResult.majorPlotPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ideaResult.twist && (
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-amber-200 dark:border-amber-900/40 text-xs">
                      <strong className="text-amber-700 dark:text-amber-400">Climactic Twist: </strong>
                      <span className="text-zinc-700 dark:text-zinc-300">{ideaResult.twist}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHARACTER GENERATOR */}
          {activeTab === 'characters' && (
            <div className="space-y-5 animate-fadeIn">
              <form onSubmit={handleGenerateChar} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Role</label>
                    <input
                      type="text"
                      value={charRole}
                      onChange={(e) => setCharRole(e.target.value)}
                      placeholder="e.g. Protagonist, Antagonist, Mentor"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Archetype</label>
                    <input
                      type="text"
                      value={charArchetype}
                      onChange={(e) => setCharArchetype(e.target.value)}
                      placeholder="e.g. Reluctant Chosen One, Cunning Merchant"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Genre / Setting</label>
                    <input
                      type="text"
                      value={charGenre}
                      onChange={(e) => setCharGenre(e.target.value)}
                      placeholder="e.g. African Epic Fantasy"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Context or Conflict</label>
                  <input
                    type="text"
                    value={charContext}
                    onChange={(e) => setCharContext(e.target.value)}
                    placeholder="e.g. Seeking redemption after losing their ancestral sacred relic"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isGeneratingChar}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    {isGeneratingChar ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Designing Character...</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        <span>Generate Character Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {characterResult && (
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {characterResult.name}
                      </h4>
                      <span className="text-xs text-amber-600 font-semibold">
                        {characterResult.role} • {characterResult.archetype}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText(JSON.stringify(characterResult, null, 2), 'char-profile')}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'char-profile' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Profile</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <strong className="text-zinc-800 dark:text-zinc-200">Backstory:</strong>
                      <p className="text-zinc-600 dark:text-zinc-400">{characterResult.backstory}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <strong className="text-zinc-800 dark:text-zinc-200">Core Motivation:</strong>
                      <p className="text-zinc-600 dark:text-zinc-400">{characterResult.motivation}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <strong className="text-zinc-800 dark:text-zinc-200">Fatal Flaw:</strong>
                      <p className="text-zinc-600 dark:text-zinc-400">{characterResult.flaw}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <strong className="text-zinc-800 dark:text-zinc-200">Guarded Secret:</strong>
                      <p className="text-zinc-600 dark:text-zinc-400">{characterResult.secret}</p>
                    </div>
                  </div>

                  {characterResult.catchphrase && (
                    <p className="text-xs italic text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900">
                      "{characterResult.catchphrase}"
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WRITING ASSISTANT / PROSE ENHANCER */}
          {activeTab === 'assistant' && (
            <div className="space-y-5 animate-fadeIn">
              <form onSubmit={handleWritingAssistant} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Action / Goal</label>
                    <select
                      value={assistantAction}
                      onChange={(e) => setAssistantAction(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    >
                      <option value="enrich_prose">Enrich Prose & Atmosphere</option>
                      <option value="show_dont_tell">Show, Don't Tell Transformation</option>
                      <option value="polish_dialogue">Polish Authentic Dialogue</option>
                      <option value="increase_tension">Heighten Suspense & Tension</option>
                      <option value="expand_scene">Expand Sensory Scene Details</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Desired Tone</label>
                    <input
                      type="text"
                      value={assistantTone}
                      onChange={(e) => setAssistantTone(e.target.value)}
                      placeholder="e.g. Poetic, Gritty, Mythic"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Draft Passage / Paragraph
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Paste your draft scene or dialogue snippet here..."
                    value={assistantInputText}
                    onChange={(e) => setAssistantInputText(e.target.value)}
                    className="w-full p-3.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isProcessingAssistant}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    {isProcessingAssistant ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Polishing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Polish Prose</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {assistantResult && (
                <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                      Enhanced Passage
                    </h4>
                    <button
                      onClick={() => handleCopyText(assistantResult, 'assist-res')}
                      className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs flex items-center gap-1.5 cursor-pointer font-semibold"
                    >
                      {copiedKey === 'assist-res' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Text</span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-serif">
                    {assistantResult}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TRANSLATION */}
          {activeTab === 'translate' && (
            <div className="space-y-5 animate-fadeIn">
              <form onSubmit={handleTranslate} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Target African or International Language
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => {
                      setTargetLang(e.target.value);
                      const map: Record<string, string> = {
                        Yoruba: 'yo',
                        Igbo: 'ig',
                        Hausa: 'ha',
                        Swahili: 'sw',
                        French: 'fr',
                        Portuguese: 'pt',
                        Spanish: 'es',
                      };
                      setTargetLangCode(map[e.target.value] || 'en');
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                  >
                    <option value="Yoruba">Yorùbá (Nigeria / West Africa)</option>
                    <option value="Igbo">Asụsụ Igbo (Nigeria)</option>
                    <option value="Hausa">Harshen Hausa (West & Central Africa)</option>
                    <option value="Swahili">Kiswahili (East & Central Africa)</option>
                    <option value="French">Français (Francophone Africa & Global)</option>
                    <option value="Portuguese">Português (Lusophone Africa)</option>
                    <option value="Spanish">Español (Equatorial Guinea / Global)</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isTranslating}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    {isTranslating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Translating Manuscript...</span>
                      </>
                    ) : (
                      <>
                        <Languages className="w-3.5 h-3.5" />
                        <span>Translate into {targetLang}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {translationResult && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {translationResult.translatedTitle || `Translated (${targetLang})`}
                    </h4>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                      {targetLang}
                    </span>
                  </div>

                  {translationResult.translatedSynopsis && (
                    <div className="space-y-1">
                      <strong className="text-xs text-zinc-700 dark:text-zinc-300">Synopsis:</strong>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                        {translationResult.translatedSynopsis}
                      </p>
                    </div>
                  )}

                  {translationResult.translatedSample && (
                    <div className="space-y-1 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                      <strong className="text-xs text-zinc-700 dark:text-zinc-300">Sample Passage:</strong>
                      <p className="text-xs text-zinc-800 dark:text-zinc-200 font-serif leading-relaxed">
                        {translationResult.translatedSample}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
