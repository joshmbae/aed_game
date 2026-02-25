import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ACTIONS, 
  ActionType, 
  ViewState, 
  SessionRecord, 
  HistoryEvent 
} from './types';
import { FIXED_SCENARIO, ACTION_COLORS } from './constants';
import ActionKey from './components/ActionKey';
// MetricsChart removed: replaced by explanatory info in Analysis view
import RedLogo from './assets/Red.svg';
import STSLogo from './assets/sts_logo.svg';
import DFLLogo from './assets/dfl_logo.svg';
import AWSLogo from './assets/aws_logo.svg';

const STORAGE_KEY = 'aed_pro_db_v2';
const AED_EVENTS_PER_MATCH = 116;

// --- Helper Functions ---
const createEmptyCounts = (): Record<ActionType, number> =>
  ACTIONS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as Record<ActionType, number>);

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Robust ID generator that works in all environments (including non-HTTPS)
const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
     return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const EVENT_DESCRIPTIONS: Record<string, string> = {
   Touch: "Any controlled or uncontrolled ball contact, that is not a pass or shot.",
   Pass: "Ball release intended to reach a teammate.",
   Shot: "Ball release intended to strike a goal.",
   Duel: "1v1 contest for ball control on the ground or in the air.",
   Carry: "Controlled on-ball run over 5 meters."
};

// --- Sub-Components ---

interface HeaderProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  onStationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, setView, onStationClick }) => (
  <nav className="w-full flex items-center justify-between py-8 z-50 relative border-b border-white/10 mb-10">
    <div className="flex items-center gap-8">
      {/* Main Title / Logo */}
         <div className="flex items-center gap-4 cursor-pointer group" onClick={onStationClick}>
            <img
               src={RedLogo}
               alt="AED Sportec Solutions"
               className="w-15 h-12 rounded-xl bg-white object-contain p-0.4 shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:scale-105 transition-transform duration-300"
            />
        <div>
           <h1 className="text-3xl font-black tracking-tight leading-none text-white">AED<span className="text-red-500"> Sportec Solutions</span></h1>
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-1">Annotation Game</p>
        </div>
      </div>
    </div>
    <div className="flex gap-4">
       <button onClick={onStationClick} className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all border ${view !== ViewState.LEADERBOARD ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 bg-zinc-900/50'}`}>Station</button>
       <button onClick={() => setView(ViewState.LEADERBOARD)} className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all border ${view === ViewState.LEADERBOARD ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 bg-zinc-900/50'}`}>Leaderboard</button>
    </div>
  </nav>
);

interface IntroViewProps {
  onProceed: () => void;
}

const IntroView: React.FC<IntroViewProps> = ({ onProceed }) => (
   <div className="w-full h-full flex flex-col justify-center items-center py-8 relative">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* Top Section: Hero & Events */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
           {/* Left: Hero Text */}
           <div className="space-y-6 lg:pt-6">
              <div>
                <h1 className="text-6xl xl:text-7xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
                   <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-600">AED</span> CHALLENGE
                </h1>
                <p className="text-zinc-400 text-xl max-w-2xl font-medium border-l-4 border-red-600 pl-6 leading-relaxed">
                  Try to compete with Sportec Solutions Automated Event Detection (AED). 
                  <br />
                  AED is an AI-based annotation system that automatically detects 5,000+ football events per match. 
                  <br /><br />
                  Can you compete with AED and annotate events as fast and accurately as the AI? You have 60 seconds, Good Luck!
                </p>
              </div>
           </div>

           {/* Right: Event Definitions */}
           <div className="grid gap-3">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Event Definitions</h3>
                 <span className="text-[10px] text-zinc-600 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded">Glossary</span>
              </div>
              {ACTIONS.map(action => (
                  <div key={action} className="bg-[#111111] border border-white/10 rounded-xl p-4 flex items-center gap-5 hover:border-white/20 transition-colors group">
                     <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-zinc-900 border border-white/5 shadow-inner">
                        <div className="w-3 h-3 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: ACTION_COLORS[action], boxShadow: `0 0 12px ${ACTION_COLORS[action]}` }}></div>
                     </div>
                     <div>
                        <h4 className="font-bold text-white text-xl uppercase tracking-wide">{action}</h4>
                        <p className="text-zinc-500 text-base font-medium leading-snug">
                            {EVENT_DESCRIPTIONS[action] || "Standard football event action."}
                        </p>
                     </div>
                  </div>
              ))}
           </div>
       </div>

       {/* Bottom Section: Instructions & CTA */}
       <div className="w-full bg-[#111111] border border-white/10 rounded-3xl p-8 lg:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[380px] h-[380px] bg-white/5 rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row gap-8 items-center justify-between">
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                 <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-lg text-zinc-600 group-hover:text-white group-hover:border-white/30 transition-colors">1</div>
                    <div>
                       <h4 className="font-bold text-white text-lg">Start</h4>
                       <p className="text-zinc-500 text-sm mt-1">Press start and enter your name.</p>
                    </div>
                 </div>
                 <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-lg text-zinc-600 group-hover:text-white group-hover:border-white/30 transition-colors">2</div>
                    <div>
                       <h4 className="font-bold text-white text-lg">Annotate</h4>
                       <p className="text-zinc-500 text-sm mt-1">Log events in real-time by pressing the matching button.</p>
                    </div>
                 </div>
                 <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-lg text-zinc-600 group-hover:text-white group-hover:border-white/30 transition-colors">3</div>
                    <div>
                       <h4 className="font-bold text-white text-lg">Verify</h4>
                       <p className="text-zinc-500 text-sm mt-1">Check results and verify if you are as good as AI.</p>
                    </div>
                 </div>
              </div>

              <div className="shrink-0 w-full xl:w-auto">
                  <button 
                    onClick={onProceed}
                    className="group relative w-full xl:w-auto px-12 py-5 bg-white text-black rounded-xl font-black uppercase tracking-[0.2em] text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform overflow-hidden"
                  >
                     <span className="relative z-10">Start Now</span>
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </button>
              </div>

          </div>
       </div>

    </div>

    {/* POWERED BY FOOTER */}
   <div className="fixed bottom-8 right-12 z-50 flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Powered By</span>
      <div className="flex items-center gap-5">
         <img src={STSLogo} alt="Sportec Solutions" className="h-6 w-auto object-contain drop-shadow" />
         <img src={DFLLogo} alt="DFL" className="h-8 w-auto object-contain drop-shadow" />
         <img src={AWSLogo} alt="AWS" className="h-6 w-auto object-contain drop-shadow" />
      </div>
    </div>

  </div>
);

interface NameInputViewProps {
  operator: string;
  setOperator: (val: string) => void;
  handleStart: () => void;
}

const NameInputView: React.FC<NameInputViewProps> = ({ operator, setOperator, handleStart }) => (
  <div className="w-full h-full flex flex-col justify-center items-center animate-in zoom-in-95 duration-500">
      <div className="w-full max-w-2xl">
          <div className="pro-card p-12 rounded-3xl bg-[#111111] border border-white/10 relative overflow-hidden text-center">
             {/* Background glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>

             <div className="relative z-10">
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-8">
                    Ready to Start
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2">{FIXED_SCENARIO.name}</h2>
                <p className="text-zinc-500 mb-10">{FIXED_SCENARIO.context}</p>

                <div className="space-y-6 text-left">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3 ml-2">Enter Operator Name</label>
                    <input 
                      type="text" 
                      value={operator}
                      onChange={e => setOperator(e.target.value)}
                      placeholder="NAME / ALIAS"
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 text-3xl text-center text-white font-black placeholder:text-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all uppercase tracking-widest shadow-inner"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && operator && handleStart()}
                    />
                  </div>
                  <button 
                    onClick={handleStart}
                    disabled={!operator}
                    className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-base hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] mt-4"
                  >
                    Start Annotation
                  </button>
               </div>
             </div>
          </div>
          
          <div className="text-center mt-8">
             <p className="text-zinc-600 text-xs font-mono uppercase">Session ID: {generateId().slice(0,8)}</p>
          </div>
      </div>
  </div>
);

interface ActiveViewProps {
    elapsed: number;
    operator: string;
    eventCount: number;
    counts: Record<ActionType, number>;
    handleAction: (t: ActionType) => void;
    handleUndo: () => void;
    handleStop: () => void;
    scenarioVideoUrl?: string;
}

const ActiveView: React.FC<ActiveViewProps> = ({
    elapsed,
    operator,
    eventCount,
    counts,
    handleAction,
    handleUndo,
    handleStop,
    scenarioVideoUrl
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoUnavailable = !scenarioVideoUrl;

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
        setIsVideoPlaying(false);
    }, [scenarioVideoUrl]);

    const handleVideoPlay = () => {
        if (!videoRef.current) return;
        videoRef.current.play().catch(() => {});
    };

    const handleVideoPause = () => {
        if (!videoRef.current) return;
        videoRef.current.pause();
    };

    const handleVideoReset = () => {
        if (!videoRef.current) return;
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsVideoPlaying(false);
    };

    return (
        <div className="w-full max-w-[1920px] mx-auto animate-in zoom-in-95 duration-300 flex flex-col h-full">
           <div className="flex items-center justify-between mb-6 bg-[#111111] border border-white/10 p-4 md:p-5 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent pointer-events-none"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-4 h-4 bg-red-600 rounded-sm animate-pulse shadow-[0_0_15px_#ef4444]"></div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Session Clock</span>
                    <span className="text-3xl md:text-4xl font-mono font-black text-white tabular-nums tracking-tighter">{formatTime(elapsed)}</span>
                 </div>
              </div>
              
              <div className="relative z-10">
                 <div className="px-8 py-2.5 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-1 text-center">Operator</span>
                    <span className="text-xl font-black uppercase tracking-widest text-white text-center block">{operator}</span>
                 </div>
              </div>

              <div className="flex flex-col text-right relative z-10">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Total Events</span>
                 <span className="text-3xl md:text-4xl font-mono font-black text-white tabular-nums tracking-tighter">{eventCount}</span>
              </div>
           </div>

           <div className="flex flex-col lg:flex-row flex-1 gap-6 items-stretch">
              <div className="flex-1 flex flex-col">
                 <div
                    className="bg-black rounded-[32px] border border-white/10 overflow-hidden relative shadow-2xl w-full"
                    style={{ aspectRatio: '16 / 9', maxHeight: '620px' }}
                 >
                    {scenarioVideoUrl ? (
                        <video
                            ref={videoRef}
                            src={scenarioVideoUrl}
                            className="w-full h-full object-cover"
                            playsInline
                            preload="auto"
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                            onEnded={() => setIsVideoPlaying(false)}
                        >
                            Your browser does not support embedded videos.
                        </video>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center text-zinc-500 font-black uppercase tracking-[0.3em]">
                            <span>No video configured</span>
                            <span className="text-[10px] text-zinc-600">Add a videoUrl to FIXED_SCENARIO</span>
                        </div>
                    )}

                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
               </div>
              </div>

              <div className="w-full lg:max-w-[420px] lg:self-stretch">
                 <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 h-full flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">Event Actions</h3>
                       <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">Tap or press 1–5</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                       {ACTIONS.map((action, i) => (
                          <ActionKey 
                            key={action}
                            action={action}
                            count={counts[action]}
                            onClick={() => handleAction(action)}
                            disabled={false}
                            shortcut={(i+1).toString()}
                            variant="compact"
                          />
                       ))}
                    </div>
                 </div>
              </div>
           </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                 onClick={handleVideoPlay}
                 disabled={videoUnavailable || isVideoPlaying}
                 className="px-6 py-3 rounded-xl border border-white/10 bg-white text-black font-black uppercase tracking-widest text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              >
                 Start Clip
              </button>
              <button
                 onClick={handleVideoPause}
                 disabled={videoUnavailable || !isVideoPlaying}
                 className="px-6 py-3 rounded-xl border border-white/10 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                 Pause Clip
              </button>
              <button
                 onClick={handleVideoReset}
                 disabled={videoUnavailable}
                 className="px-6 py-3 rounded-xl border border-white/10 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                 Reset Clip
              </button>
            </div>

           <div className="flex gap-6 border-t border-white/10 pt-10 mt-10">
              <button onClick={handleUndo} disabled={eventCount === 0} className="px-12 py-6 rounded-xl border border-zinc-700 bg-[#18181b] text-zinc-400 font-black uppercase tracking-widest text-sm hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-30 shadow-lg hover:shadow-xl hover:-translate-y-0.5">Undo Last Action</button>
              <button onClick={handleStop} className="flex-1 py-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black uppercase tracking-[0.2em] text-lg shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all transform hover:-translate-y-1 border border-red-500/50">Complete Session</button>
           </div>
        </div>
    );
};

interface AnalysisViewProps {
    lastRecord: SessionRecord;
    leaderboard: SessionRecord[];
    handleResetToIdle: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ lastRecord, leaderboard, handleResetToIdle }) => {
     const currentRank = leaderboard.findIndex(r => r.id === lastRecord.id) + 1;
     
     // Calculate total truth events
     const totalTruth = Object.values(lastRecord.targets).reduce((a, b) => a + b, 0);
     const totalDetected = lastRecord.totalEvents;
     const aedPerMatch = AED_EVENTS_PER_MATCH;
     const volumeComparison = [
        {
           label: 'Number of manual events',
           value: totalTruth,
           gradient: 'linear-gradient(90deg, #f87171 0%, #b91c1c 100%)'
        },
        {
           label: 'Number of AED events',
           value: aedPerMatch,
           gradient: 'linear-gradient(90deg, #22d3ee 0%, #0ea5e9 100%)'
        }
     ];

     // Feedback Logic
     let feedbackText = "";
     let feedbackColor = "";
     
     if (lastRecord.totalVariance < 10) {
        feedbackText = `Eagle Eye - ${lastRecord.operatorName}! Top-level annotation accuracy!`;
        feedbackColor = "text-emerald-400";
     } else if (lastRecord.totalVariance <= 30) {
        feedbackText = `Good game, ${lastRecord.operatorName}. A bit more training is needed.`;
        feedbackColor = "text-blue-400";
     } else {
        feedbackText = `AI wins this round, ${lastRecord.operatorName}. More focus next time.`;
        feedbackColor = "text-amber-500";
     }

     return (
       <div className="w-full max-w-[1600px] mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
             <div>
                <div className="flex items-baseline gap-4 mb-2">
                    <h2 className="text-4xl font-black text-white tracking-tight">Session Report</h2>
                    <span className="text-xl font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-4 py-1 rounded-lg border border-red-500/20">{lastRecord.operatorName}</span>
                </div>
                <p className="text-zinc-400 font-bold text-lg">Performance analysis vs Ground Truth</p>
                <p className={`text-lg font-black mt-4 uppercase tracking-wide ${feedbackColor}`}>
                   {feedbackText}
                </p>
             </div>
             <button onClick={handleResetToIdle} className="px-10 py-5 bg-white text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105">Start New Session</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Left: Stats */}
             <div className="space-y-6">
                 <div className="grid grid-cols-3 gap-6">
                     {/* Card 1: Variance */}
                     <div className="pro-card p-6 rounded-3xl bg-[#111111]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total Variance</p>
                        <p className={`text-5xl font-mono font-black tracking-tighter ${lastRecord.totalVariance === 0 ? 'text-emerald-500' : 'text-red-500'}`}>{lastRecord.totalVariance}</p>
                        <p className="text-zinc-500 text-xs mt-2 font-medium">Error Score</p>
                     </div>
                     
                     {/* Card 2: Volume */}
                     <div className="pro-card p-6 rounded-3xl bg-[#111111]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total Events</p>
                        <p className="text-5xl font-mono font-black tracking-tighter text-white whitespace-nowrap">
                            <span className={totalDetected !== totalTruth ? 'text-zinc-300' : 'text-emerald-500'}>{totalDetected}</span>
                            <span className="text-zinc-700 text-3xl mx-1">/</span>
                            <span className="text-zinc-500 text-3xl">{totalTruth}</span>
                        </p>
                        <p className="text-zinc-500 text-xs mt-2 font-medium">Detected / Truth</p>
                     </div>

                     {/* Card 3: Rank */}
                     <div className="pro-card p-6 rounded-3xl bg-[#111111] border-l-4 border-l-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Global Rank</p>
                        <div className="flex items-baseline gap-1">
                            <p className="text-5xl font-mono font-black text-white tracking-tighter">#{currentRank}</p>
                            <span className="text-xs font-bold text-zinc-600">/ {leaderboard.length}</span>
                        </div>
                        <p className="text-zinc-500 text-xs mt-2 font-medium">Based on precision</p>
                     </div>
                 </div>

                 <div className="pro-card p-8 rounded-3xl bg-[#111111]">
                    <div className="flex justify-between items-center mb-8">
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Event Breakdown</p>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Captured / Truth</div>
                    </div>
                    <div className="space-y-4">
                        {ACTIONS.map(a => {
                            const diff = lastRecord.counts[a] - lastRecord.targets[a];
                            return (
                                <div key={a} className="flex justify-between items-center text-lg border-b border-white/5 pb-4 last:border-0 hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: ACTION_COLORS[a], boxShadow: `0 0 10px ${ACTION_COLORS[a]}` }}></div>
                                        <span className="font-bold text-zinc-200 tracking-tight">{a}</span>
                                    </div>
                                    <div className="flex gap-8 items-center">
                                        <span className="text-zinc-500 font-mono font-bold">{lastRecord.counts[a]} / {lastRecord.targets[a]}</span>
                                        <span className={`font-mono font-black w-12 text-right ${diff === 0 ? 'text-zinc-800' : 'text-red-500'}`}>
                                            {diff > 0 ? '+' : ''}{diff}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 </div>
             </div>

             {/* Right: AED Context / Comparison */}
             <div className="pro-card p-8 rounded-3xl flex flex-col bg-[#0f0f0f] min-h-[420px] border border-white/10">
                <div className="space-y-3 mb-8">
                   <h3 className="text-2xl font-black text-white tracking-tight">AED detects 50+ more events in the same minute.</h3>
                </div>

                <div className="mb-8">
                   <div className="space-y-4">
                      {volumeComparison.map(bar => {
                         const isAEDBar = bar.label.toLowerCase().includes('aed');
                         const normalizedValue = isAEDBar ? 100 : (bar.value / aedPerMatch) * 100;
                         const widthPercent = Math.min(100, Math.max(18, normalizedValue));
                         return (
                            <div key={bar.label} className="space-y-2">
                               <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-zinc-500">
                                  <span>{bar.label}</span>
                                  <span className="text-white text-base tracking-tight font-black">{bar.value.toLocaleString()}</span>
                               </div>
                               <div className="h-4 md:h-5 rounded-full bg-[#151515] border border-white/5 overflow-hidden">
                                  <div
                                     className="h-full rounded-full transition-all"
                                     style={{
                                        background: bar.gradient,
                                        width: `${widthPercent}%`
                                     }}
                                  ></div>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                   <div className="rounded-2xl p-4 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-white/10">
                      <p className="text-[1.2rem] font-black text-white tracking-wide">Scans</p>
                      <p className="text-[1.2rem] text-zinc-100 font-black tracking-tight">+37</p>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">tracked actions</p>
                   </div>
                   <div className="rounded-2xl p-4 bg-gradient-to-b from-[#101e26] to-[#0a1318] border border-cyan-500/20">
                      <p className="text-[1.25rem] font-black text-white tracking-wide">Off-ball runs</p>
                      <p className="text-[1.25rem] text-cyan-100 font-black tracking-tight">+24</p>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/90">tracked actions</p>
                   </div>
                   <div className="rounded-2xl p-4 bg-gradient-to-b from-[#1a1024] to-[#0e0913] border border-purple-500/20">
                      <p className="text-[1.2rem] font-black text-white tracking-wide">Attributes</p>
                      <p className="text-[1.2rem] text-purple-100 font-black tracking-tight">+20</p>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-purple-200/80">per event</p>
                   </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0a0a0a] via-[#111111] to-[#090909] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-zinc-300">
                   <div className="space-y-2">
                      <p className="text-[15px] font-black uppercase tracking-[0.4em] text-zinc-500">Automated Event Detection</p>
                      <p className="text-[0.5rem] md:text-4xl font-black text-white leading-tight">5000+ events logged by AED</p>
                      <p className="text-[15px] uppercase tracking-[0.3em] text-zinc-500">per Bundesliga match</p>
                   </div>

                </div>
             </div>
          </div>
       </div>
     );
};

interface LeaderboardViewProps {
    leaderboard: SessionRecord[];
    handleClearLeaderboard: () => void;
    handleDeleteEntry: (id: string, e: React.MouseEvent) => void;
    isResetting: boolean;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboard, handleClearLeaderboard, handleDeleteEntry, isResetting }) => (
     <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="flex justify-between items-end mb-10 pb-8 border-b border-white/10">
           <div>
               <h2 className="text-5xl font-black text-white tracking-tight">Leaderboard</h2>
               <p className="text-zinc-400 text-lg mt-2 font-medium">Ranked by lowest variance (highest precision)</p>
           </div>
           <button 
                onClick={handleClearLeaderboard} 
                className={`text-xs font-bold uppercase transition-all px-6 py-3 rounded-lg border ${
                    isResetting 
                    ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                    : 'text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:text-red-400'
                }`}
           >
                {isResetting ? "Confirm Delete All?" : "Reset Database"}
           </button>
        </div>
        
        <div className="pro-card rounded-3xl overflow-hidden border border-white/10 bg-[#111111]">
           <table className="w-full text-left">
              <thead className="bg-[#18181b] border-b border-white/10 text-xs font-black uppercase tracking-widest text-zinc-500">
                 <tr>
                    <th className="px-10 py-8 w-32">Rank</th>
                    <th className="px-10 py-8">Operator</th>
                    <th className="px-10 py-8">Date</th>
                    <th className="px-10 py-8 text-center">Variance Score</th>
                    <th className="px-10 py-8 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-lg">
                 {leaderboard.map((row, idx) => {
                    const isLeader = idx === 0;
                    return (
                        <tr key={row.id} className={`transition-all group ${isLeader ? 'bg-amber-900/10 hover:bg-amber-900/20' : 'hover:bg-white/5'}`}>
                           <td className="px-10 py-6">
                                {isLeader ? (
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] transform group-hover:scale-110 transition-transform">1</div>
                                ) : (
                                    <span className="font-mono text-zinc-600 font-black ml-3 text-xl">{idx + 1}</span>
                                )}
                           </td>
                           <td className={`px-10 py-6 font-bold ${isLeader ? 'text-amber-400 text-2xl' : 'text-white'}`}>
                               {row.operatorName}
                               {isLeader && <span className="ml-4 text-[10px] uppercase tracking-widest border border-amber-500/30 text-amber-500 px-2 py-1 rounded-md bg-amber-500/10 align-middle">Champion</span>}
                           </td>
                           <td className={`px-10 py-6 text-base ${isLeader ? 'text-amber-500/60' : 'text-zinc-500 font-medium'}`}>{new Date(row.timestamp).toLocaleDateString()}</td>
                           <td className="px-10 py-6 text-center">
                              <span className={`inline-block px-5 py-2 rounded-xl font-black font-mono text-base ${isLeader ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-[#202023] border border-white/10 text-zinc-300'}`}>
                                 {row.totalVariance}
                              </span>
                           </td>
                           <td className="px-10 py-6 text-right">
                               <button 
                                onClick={(e) => handleDeleteEntry(row.id, e)}
                                className={`p-4 rounded-xl hover:bg-white/10 transition-colors ${isLeader ? 'text-amber-500/50 hover:text-amber-500' : 'text-zinc-700 hover:text-red-500'}`}
                                title="Remove Entry"
                               >
                                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                   </svg>
                               </button>
                           </td>
                        </tr>
                    );
                 })}
                 {leaderboard.length === 0 && (
                    <tr><td colSpan={5} className="py-32 text-center text-zinc-600 font-black uppercase tracking-widest text-sm">No Records Found</td></tr>
                 )}
              </tbody>
           </table>
        </div>
     </div>
);


const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.IDLE);
  const [operator, setOperator] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [counts, setCounts] = useState(createEmptyCounts());
  const [eventLog, setEventLog] = useState<HistoryEvent[]>([]);
  const [lastRecord, setLastRecord] = useState<SessionRecord | null>(null);
  const [leaderboard, setLeaderboard] = useState<SessionRecord[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { 
        const data = JSON.parse(saved) as SessionRecord[];
        const sorted = data.sort((a, b) => a.totalVariance - b.totalVariance);
        setLeaderboard(sorted); 
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    let interval: number;
    if (view === ViewState.ACTIVE && startTime) {
      interval = window.setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [view, startTime]);

  const handleStart = () => {
    if (!operator.trim()) return;
    setCounts(createEmptyCounts());
    setEventLog([]);
    setStartTime(Date.now());
    setElapsed(0);
    setView(ViewState.ACTIVE);
  };

  const handleStop = () => {
    setView(ViewState.ANALYSIS);
    
    const totalVariance = ACTIONS.reduce((acc, key) => 
      acc + Math.abs(counts[key] - FIXED_SCENARIO.targets[key]), 0
    );

    const record: SessionRecord = {
      id: generateId(),
      operatorName: operator,
      timestamp: Date.now(),
      scenarioId: FIXED_SCENARIO.id,
      totalEvents: eventLog.length,
      totalVariance,
      counts: { ...counts },
      targets: { ...FIXED_SCENARIO.targets },
    };

    setLastRecord(record);
    
    const newLeaderboard = [...leaderboard, record].sort((a, b) => a.totalVariance - b.totalVariance);
    setLeaderboard(newLeaderboard);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLeaderboard));
    
    setOperator('');
  };

  const handleAction = useCallback((type: ActionType) => {
    setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setEventLog(prev => [...prev, {
      id: Math.random().toString(36),
      action: type,
      timestamp: Date.now()
    }]);
  }, []);

  const handleUndo = () => {
    if (eventLog.length === 0) return;
    const lastEvent = eventLog[eventLog.length - 1];
    setCounts(prev => ({ ...prev, [lastEvent.action]: Math.max(0, prev[lastEvent.action] - 1) }));
    setEventLog(prev => prev.slice(0, -1));
  };

  const handleResetToIdle = () => {
    setView(ViewState.IDLE);
    setOperator('');
    setLastRecord(null);
  };

  const handleStationClick = () => {
      // Smart Navigation
      if (lastRecord && view !== ViewState.ANALYSIS) {
          setView(ViewState.ANALYSIS);
      } else {
          setView(ViewState.IDLE);
      }
  };

  const handleClearLeaderboard = () => {
    if (isResetting) {
        setLeaderboard([]);
        localStorage.removeItem(STORAGE_KEY);
        setIsResetting(false);
    } else {
        setIsResetting(true);
        setTimeout(() => setIsResetting(false), 3000);
    }
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Immediate delete to bypass potential environment restrictions on confirm()
    const newLeaderboard = leaderboard.filter(r => r.id !== id);
    setLeaderboard(newLeaderboard);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLeaderboard));
  };

  return (
    <div className="min-h-screen relative selection:bg-red-500/30">
      <div className="w-full px-8 md:px-16 pb-20 relative z-10 flex flex-col min-h-screen">
        <Header view={view} setView={setView} onStationClick={handleStationClick} />
        <main className="flex-1 flex flex-col justify-center">
            {view === ViewState.IDLE && (
              <IntroView onProceed={() => setView(ViewState.INPUT)} />
            )}
            {view === ViewState.INPUT && (
              <NameInputView 
                operator={operator} 
                setOperator={setOperator} 
                handleStart={handleStart} 
              />
            )}
            {view === ViewState.ACTIVE && (
              <ActiveView 
                elapsed={elapsed} 
                operator={operator} 
                eventCount={eventLog.length} 
                counts={counts} 
                handleAction={handleAction} 
                handleUndo={handleUndo} 
                        handleStop={handleStop}
                        scenarioVideoUrl={FIXED_SCENARIO.videoUrl}
              />
            )}
            {view === ViewState.ANALYSIS && lastRecord && (
              <AnalysisView 
                lastRecord={lastRecord} 
                leaderboard={leaderboard} 
                handleResetToIdle={handleResetToIdle} 
              />
            )}
            {view === ViewState.LEADERBOARD && (
              <LeaderboardView 
                leaderboard={leaderboard} 
                handleClearLeaderboard={handleClearLeaderboard} 
                handleDeleteEntry={handleDeleteEntry}
                isResetting={isResetting}
              />
            )}
        </main>
      </div>
    </div>
  );
};

export default App;