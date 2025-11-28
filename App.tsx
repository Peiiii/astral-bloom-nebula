import React, { useState, useEffect } from 'react';
import Garden from './components/Garden';
import { generateGardenTheme } from './services/geminiService';
import { FlowerTheme } from './types';

// Icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
const PlayPauseIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  isPlaying ? 
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> :
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<FlowerTheme>({
    name: "Cosmic Garden",
    description: "Drag your finger to plant flowers from another dimension.",
    palette: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF9F1C", "#F7FFF7"],
    petalShape: "round",
    centerColor: "#FFFFFF"
  });
  
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const newTheme = await generateGardenTheme(promptInput || undefined);
    setTheme(newTheme);
    setIsGenerating(false);
    setShowPrompt(false);
    setPromptInput("");
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-white font-sans selection:bg-pink-500 selection:text-white">
      
      <Garden theme={theme} isAutoPlay={isAutoPlay} />

      {/* Top Overlay: Title & Description */}
      <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-slate-900/80 to-transparent pointer-events-none z-10">
        <h1 className="text-3xl font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-violet-300 drop-shadow-lg">
          {theme.name}
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-md opacity-80 italic">
          "{theme.description}"
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        
        {/* Magic Button */}
        <div className="relative group">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            disabled={isGenerating}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full 
              backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300
              ${isGenerating ? 'bg-pink-500/20 cursor-wait' : 'bg-white/10 hover:bg-white/20 hover:scale-105'}
            `}
          >
            <SparklesIcon />
            <span className="text-sm font-medium tracking-wide">
              {isGenerating ? "Mutating..." : "Change World"}
            </span>
          </button>

          {/* Prompt Popover */}
          {showPrompt && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-4 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-fade-in-up">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Describe a mood or style
              </label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Underwater neon bioluminescence..."
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-pink-500/50 resize-none h-20 mb-3"
              />
              <button
                onClick={handleGenerate}
                className="w-full py-2 bg-gradient-to-r from-pink-500 to-violet-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Bloom
              </button>
            </div>
          )}
        </div>

        {/* Play/Pause Auto-Bloom */}
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`
            p-3 rounded-full backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300
            ${isAutoPlay ? 'bg-green-500/20 text-green-200' : 'bg-white/10 text-slate-200 hover:bg-white/20'}
          `}
          title={isAutoPlay ? "Pause Auto-Bloom" : "Start Auto-Bloom"}
        >
          <PlayPauseIcon isPlaying={isAutoPlay} />
        </button>
        
      </div>

      {/* Palette Indicator */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/5">
        {theme.palette.map((color, idx) => (
          <div 
            key={idx} 
            className="w-4 h-4 rounded-full shadow-sm border border-white/10" 
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        <div 
          className="w-4 h-4 rounded-full shadow-sm border border-white/30 mt-2" 
          style={{ backgroundColor: theme.centerColor }} 
          title="Center Color"
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 text-right pointer-events-none opacity-50 hidden md:block">
        <p className="text-xs text-slate-400">Touch & Drag to Create</p>
      </div>

    </div>
  );
};

export default App;
