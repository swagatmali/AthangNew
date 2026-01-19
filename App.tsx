
import React, { useState } from 'react';
import { Scenario, AppState, GeneratedResult, ShotType, ExpansionShot } from './types';
import { analyzeJewelry, generateVisualization } from './services/geminiService';
import Uploader from './components/Uploader';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    uploadedImage: null,
    analysis: null,
    results: {
      [Scenario.TRADITIONAL]: null,
      [Scenario.CASUAL]: null,
      [Scenario.FESTIVE]: null,
    },
    loadingScenarios: {
      [Scenario.TRADITIONAL]: false,
      [Scenario.CASUAL]: false,
      [Scenario.FESTIVE]: false,
    },
    expansionResults: {
      [Scenario.TRADITIONAL]: null,
      [Scenario.CASUAL]: null,
      [Scenario.FESTIVE]: null,
    },
    loadingExpansion: {
      [Scenario.TRADITIONAL]: false,
      [Scenario.CASUAL]: false,
      [Scenario.FESTIVE]: false,
    },
    isAnalyzing: false,
    status: '',
    selectedExpansionScenario: null,
  });

  const handleError = (err: any) => {
    console.error("API Error:", err);
    setState(prev => ({ ...prev, status: 'An error occurred. Please try again.' }));
  };

  const handleUpload = async (base64: string) => {
    // Reset state for new upload
    setState(prev => ({ 
      ...prev, 
      uploadedImage: base64, 
      isAnalyzing: true, 
      status: 'Analyzing jewelry craftsmanship...',
      analysis: null,
      results: { [Scenario.TRADITIONAL]: null, [Scenario.CASUAL]: null, [Scenario.FESTIVE]: null },
      expansionResults: { [Scenario.TRADITIONAL]: null, [Scenario.CASUAL]: null, [Scenario.FESTIVE]: null },
      loadingScenarios: { [Scenario.TRADITIONAL]: false, [Scenario.CASUAL]: false, [Scenario.FESTIVE]: false },
      selectedExpansionScenario: null,
    }));

    try {
      // Step 1: Analyze
      const analysis = await analyzeJewelry(base64);
      
      // Step 2: Set analysis and trigger all generations immediately
      setState(prev => ({ 
        ...prev, 
        analysis, 
        isAnalyzing: false, 
        status: 'Generating curated looks...',
        loadingScenarios: {
           [Scenario.TRADITIONAL]: true,
           [Scenario.CASUAL]: true,
           [Scenario.FESTIVE]: true
        }
      }));

      // Trigger parallel generation for all 3 scenarios
      [Scenario.TRADITIONAL, Scenario.CASUAL, Scenario.FESTIVE].forEach(async (scenario) => {
        try {
          const imageUrl = await generateVisualization(base64, analysis, scenario, ShotType.MIDLENGTH);
          const result: GeneratedResult = {
            id: `${Date.now()}-${scenario}`,
            scenario,
            imageUrl,
            prompt: scenario
          };
          
          setState(prev => ({
            ...prev,
            results: { ...prev.results, [scenario]: result },
            loadingScenarios: { ...prev.loadingScenarios, [scenario]: false }
          }));
        } catch (err) {
          console.error(`Error generating ${scenario}:`, err);
          setState(prev => ({
            ...prev,
            loadingScenarios: { ...prev.loadingScenarios, [scenario]: false }
          }));
        }
      });

    } catch (error) {
      handleError(error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleExpandScenario = async (scenario: Scenario) => {
    if (!state.uploadedImage || !state.analysis) return;

    setState(prev => ({
      ...prev,
      selectedExpansionScenario: scenario,
      loadingExpansion: { ...prev.loadingExpansion, [scenario]: true }
    }));

    try {
      const shots: ShotType[] = [ShotType.CLOSEUP, ShotType.MIDLENGTH, ShotType.EXTREME_CLOSEUP];
      const expansionShots: ExpansionShot[] = [];

      for (const type of shots) {
        const imageUrl = await generateVisualization(state.uploadedImage, state.analysis, scenario, type);
        expansionShots.push({ type, imageUrl });
        // Progressive update
        setState(prev => ({
          ...prev,
          expansionResults: {
            ...prev.expansionResults,
            [scenario]: [...expansionShots]
          }
        }));
      }

      setState(prev => ({
        ...prev,
        loadingExpansion: { ...prev.loadingExpansion, [scenario]: false }
      }));
    } catch (err) {
      handleError(err);
      setState(prev => ({
        ...prev,
        loadingExpansion: { ...prev.loadingExpansion, [scenario]: false }
      }));
    }
  };

  const closeExpansion = () => {
    setState(prev => ({ ...prev, selectedExpansionScenario: null }));
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#3d2b1f]">
      {/* Header */}
      <header className="bg-[#2d1b0f] text-amber-50 py-10 px-6 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold tracking-tighter font-serif">SWARNAM</h1>
            <p className="text-amber-500/80 font-light text-xs tracking-[0.3em] uppercase mt-1">AI Luxury Visualization Suite</p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4 items-center">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                <span className="text-sm font-semibold tracking-wide text-amber-200 uppercase">System Online</span>
              </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">
        {/* Step 1: Upload */}
        <section className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif text-[#4a2e19]">Digitize Your Elegance</h2>
            <p className="text-[#6d4c3d] text-lg max-w-lg mx-auto leading-relaxed">
              Upload a clear photograph of your jewelry piece to instantly generate styling portfolios.
            </p>
          </div>
          
          <Uploader onUpload={handleUpload} disabled={state.isAnalyzing} />
          
          {state.status && (
            <div className={`text-sm font-medium tracking-wide transition-all duration-300 p-4 rounded-xl ${state.status.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'text-amber-600 animate-pulse'}`}>
              {state.status}
            </div>
          )}
        </section>

        {/* Visual Results (Auto-generated) */}
        {state.analysis && (
          <section className="space-y-12 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-serif text-[#2d1b0f]">Curated Visualizations</h2>
              <p className="text-amber-600 font-medium">Click on a look to see portfolio details</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[Scenario.TRADITIONAL, Scenario.CASUAL, Scenario.FESTIVE].map(scenario => {
                const res = state.results[scenario];
                const isLoading = state.loadingScenarios[scenario];
                
                if (isLoading) {
                  return (
                    <div key={scenario} className="aspect-[3/4] bg-white rounded-3xl border border-amber-100 flex flex-col items-center justify-center p-10 text-center animate-pulse shadow-xl">
                      <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-6"></div>
                      <p className="text-2xl font-serif text-[#2d1b0f]">Styling {scenario}...</p>
                      <p className="text-[#8a6b5d] mt-2 italic tracking-wide">
                        Creating model visualization...
                      </p>
                    </div>
                  );
                }

                if (res) return (
                  <div key={res.id} onClick={() => handleExpandScenario(scenario)} className="cursor-pointer group">
                    <ResultCard result={res} />
                    <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Click to Expand Portfolio</span>
                    </div>
                  </div>
                );
                
                // Fallback (shouldn't really happen if logic is tight, but useful for error states)
                return (
                   <div key={scenario} className="aspect-[3/4] bg-gray-50 rounded-3xl border border-gray-200 flex flex-col items-center justify-center text-center opacity-50">
                      <p className="text-gray-400">Generation Failed</p>
                   </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Expansion Overlay */}
        {state.selectedExpansionScenario && (
          <div className="fixed inset-0 z-[60] bg-[#2d1b0f]/95 backdrop-blur-xl overflow-y-auto pt-10 pb-20 px-6 animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="flex justify-between items-end border-b border-white/10 pb-8">
                <div>
                  <h2 className="text-5xl font-serif text-white">{state.selectedExpansionScenario} Portfolio</h2>
                  <p className="text-amber-400 mt-2 tracking-widest uppercase text-xs font-bold">Multi-Perspective Visual Expansion</p>
                </div>
                <button 
                  onClick={closeExpansion}
                  className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[ShotType.CLOSEUP, ShotType.MIDLENGTH, ShotType.EXTREME_CLOSEUP].map((type, idx) => {
                  const shot = state.expansionResults[state.selectedExpansionScenario!]?.find(s => s.type === type);
                  const isGenerating = state.loadingExpansion[state.selectedExpansionScenario!];
                  
                  return (
                    <div key={type} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="text-amber-500 font-serif text-3xl">0{idx + 1}</span>
                        <h4 className="text-xl text-white font-medium">{type}</h4>
                      </div>
                      
                      <div className="aspect-[3/4] bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl">
                        {shot ? (
                          <img src={shot.imageUrl} alt={type} className="w-full h-full object-cover animate-fade-in" />
                        ) : isGenerating ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-amber-100/50">
                            <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-serif">Rendering Shot Perspective...</p>
                            <p className="text-[10px] mt-2 uppercase tracking-widest">
                              Harnessing Generative AI
                            </p>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <p>Pending Generation</p>
                          </div>
                        )}
                        
                        {shot && (
                          <div className="absolute bottom-6 right-6">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = shot.imageUrl;
                                link.download = `Swarnam-${type}.png`;
                                link.click();
                              }}
                              className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-amber-500 transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-amber-100/60 text-sm italic leading-relaxed">
                        {type === ShotType.CLOSEUP ? "Focus on facial harmony and primary jewelry piece with beauty lighting." :
                         type === ShotType.MIDLENGTH ? "Full editorial context showing the ensemble and curated environment." :
                         "Macro detail of craftsmanship, gemstone clarity, and metallic texture as worn."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#2d1b0f] text-amber-100/40 py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <h4 className="text-white font-serif text-2xl tracking-tight">SWARNAM</h4>
            <p className="text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              The pinnacle of jewelry visualization technology. Designed for the discerning Indian craftsmanship heritage.
            </p>
          </div>
          <div className="flex flex-col gap-3 justify-center md:justify-start text-xs uppercase tracking-widest">
            <h5 className="text-white font-bold mb-2">Digital Concierge</h5>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-amber-400 transition-colors">Billing Documentation</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Digital Atelier Terms</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Contact Expert</a>
          </div>
          <div className="flex flex-col gap-4 justify-center md:justify-end items-center md:items-end">
            <div className="px-4 py-2 border border-white/10 rounded-lg text-[10px] tracking-widest uppercase">
              Secure Cloud Processing Enabled
            </div>
            <p className="text-[10px]">&copy; 2024 Swarnam AI. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
