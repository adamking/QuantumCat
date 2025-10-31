import { useState } from "react";
import { useFlickerEffect } from "@/hooks/use-flicker-effect";
import { useSoundEffects } from "@/hooks/use-sound-effects";

export default function Economics() {
  const [isAlive, setIsAlive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const { playFlickerBuzz } = useSoundEffects(isMuted);
  const { showBothFlicker, flickerIntensity } = useFlickerEffect(playFlickerBuzz, isPaused);

  // Helper function to generate flicker and shake styles
  const getFlickerShakeStyle = (seedX: number, seedY: number, shakeAmount: number = 1) => {
    const currentIntensity = flickerIntensity;
    
    return {
      opacity: showBothFlicker ? currentIntensity : 1,
      filter: showBothFlicker ? `brightness(${0.8 + currentIntensity * 0.4})` : 'none',
      transform: showBothFlicker 
        ? `translate(${Math.sin(currentIntensity * seedX) * shakeAmount}px, ${Math.cos(currentIntensity * seedY) * shakeAmount}px)` 
        : 'none',
      transition: 'none',
    };
  };

  return (
    <div 
      className={`min-h-screen ${isAlive ? 'bg-white' : 'bg-black'}`}
    >
      {/* Floating Pause Button */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className={`fixed bottom-4 right-20 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isPaused
            ? 'bg-white/90 hover:bg-white text-black border-2 border-black'
            : 'bg-black/90 hover:bg-black text-white border-2 border-white'
        }`}
        aria-label={isPaused ? "Resume animations" : "Pause animations"}
      >
        {isPaused ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        )}
      </button>

      {/* Floating Mute Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className={`fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isMuted
            ? 'bg-white/90 hover:bg-white text-black border-2 border-black'
            : 'bg-black/90 hover:bg-black text-white border-2 border-white'
        }`}
        aria-label={isMuted ? "Unmute sound" : "Mute sound"}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* Back to Home Button */}
      <a
        href="#/"
        className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
          isAlive
            ? 'bg-black text-white hover:bg-gray-800'
            : 'bg-white text-black hover:bg-gray-200'
        }`}
      >
        ← Back to Home
      </a>

      {/* Toggle Light/Dark Mode Button */}
      <button
        onClick={() => setIsAlive(!isAlive)}
        className={`fixed top-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isAlive
            ? 'bg-black text-white hover:bg-gray-800'
            : 'bg-white text-black hover:bg-gray-200'
        }`}
        aria-label="Toggle theme"
      >
        {isAlive ? '🌙' : '☀️'}
      </button>

      {/* Header */}
      <div className={`relative pt-24 pb-12 px-4 md:px-8`}>
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className={`text-4xl md:text-6xl font-bold mb-4 ${isAlive ? 'text-black' : 'text-white'}`}
            style={getFlickerShakeStyle(12, 8, 2)}
          >
            ɆĐ₳₦Ø₥ł₵₴ & ₳Ɽ฿ł₮Ɽ₳₲Ɇ
          </h1>
          <p className={`text-xl md:text-2xl ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
            Deep Dive into the Math Behind Quantum Cat
          </p>
        </div>
      </div>

      {/* System Overview Section */}
      <section className={`py-12 px-4 md:px-8 ${isAlive ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="max-w-5xl mx-auto" style={getFlickerShakeStyle(14, 9)}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${isAlive ? 'text-white' : 'text-black'}`}>
            System Overview
          </h2>
          <p className={`text-lg mb-6 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
            Quantum Cat is a three-token system based on Schrödinger's cat paradox:
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg border-2 ${isAlive ? 'bg-purple-900/20 border-purple-400' : 'bg-purple-100 border-purple-600'}`}>
              <h3 className={`text-xl font-bold mb-2 ${isAlive ? 'text-purple-300' : 'text-purple-700'}`}>CATBOX</h3>
              <p className={`text-sm ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>The superposed, unobserved token</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${isAlive ? 'bg-green-900/20 border-green-400' : 'bg-green-100 border-green-600'}`}>
              <h3 className={`text-xl font-bold mb-2 ${isAlive ? 'text-green-300' : 'text-green-700'}`}>LIVECAT</h3>
              <p className={`text-sm ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Observed alive state</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${isAlive ? 'bg-red-900/20 border-red-400' : 'bg-red-100 border-red-600'}`}>
              <h3 className={`text-xl font-bold mb-2 ${isAlive ? 'text-red-300' : 'text-red-700'}`}>DEADCAT</h3>
              <p className={`text-sm ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Observed dead state</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Mathematics Section */}
      <section className={`py-12 px-4 md:px-8 ${isAlive ? 'bg-white text-black' : 'bg-black text-white'}`}>
        <div className="max-w-5xl mx-auto" style={getFlickerShakeStyle(13, 7)}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${isAlive ? 'text-black' : 'text-white'}`}>
            Core Mathematical Mechanics
          </h2>

          {/* Observation Process */}
          <div className={`mb-12 p-6 rounded-xl border-2 ${isAlive ? 'bg-blue-50 border-blue-300' : 'bg-blue-950/30 border-blue-700'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-blue-900' : 'text-blue-300'}`}>
              1. Observation Process (CATBOX → LIVECAT or DEADCAT)
            </h3>
            <div className={`font-mono text-sm mb-4 p-4 rounded ${isAlive ? 'bg-white' : 'bg-black/40'}`}>
              <div className={`mb-2 ${isAlive ? 'text-gray-800' : 'text-gray-200'}`}>Input: N CATBOX tokens</div>
              <div className={`mb-2 ${isAlive ? 'text-gray-800' : 'text-gray-200'}`}>Output (50/50 random):</div>
              <div className={`ml-4 mb-1 ${isAlive ? 'text-green-700' : 'text-green-400'}`}>• EITHER N LIVECAT + 0 DEADCAT</div>
              <div className={`ml-4 mb-2 ${isAlive ? 'text-red-700' : 'text-red-400'}`}>• OR 0 LIVECAT + N DEADCAT</div>
            </div>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
              <strong>Expected Value:</strong>
            </p>
            <div className={`font-mono text-sm p-4 rounded ${isAlive ? 'bg-white' : 'bg-black/40'}`}>
              <div className={`${isAlive ? 'text-gray-800' : 'text-gray-200'}`}>E[LIVECAT] = 0.5 × N</div>
              <div className={`${isAlive ? 'text-gray-800' : 'text-gray-200'}`}>E[DEADCAT] = 0.5 × N</div>
              <div className={`${isAlive ? 'text-gray-800' : 'text-gray-200'}`}>Total expected tokens = N (same as input)</div>
            </div>
            <p className={`text-sm mt-4 italic ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
              Note: While the expected value is balanced, each observation yields 100% of one type, not a split. This is a true binary outcome.
            </p>
          </div>

          {/* Rebox Process */}
          <div className={`mb-12 p-6 rounded-xl border-2 ${isAlive ? 'bg-orange-50 border-orange-300' : 'bg-orange-950/30 border-orange-700'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-orange-900' : 'text-orange-300'}`}>
              2. Rebox Process (LIVECAT + DEADCAT → CATBOX)
            </h3>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
              This is where the <strong>deflationary fee</strong> enters the system:
            </p>
            <div className={`font-mono text-sm mb-4 p-4 rounded ${isAlive ? 'bg-white' : 'bg-black/40'}`}>
              <div className={`mb-2 ${isAlive ? 'text-gray-800' : 'text-gray-200'}`}>Input: P pairs (P LIVECAT + P DEADCAT)</div>
              <div className={`mb-2 ${isAlive ? 'text-gray-800' : 'text-gray-200'}`}>Calculation:</div>
              <div className={`ml-4 mb-1 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>base = 2 × P</div>
              <div className={`ml-4 mb-1 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>feeTokens = (base × REBOX_FEE_BPS) / 10,000</div>
              <div className={`ml-4 mb-2 ${isAlive ? 'text-purple-700' : 'text-purple-400'}`}>catboxOut = base - feeTokens</div>
            </div>
            <div className={`p-4 rounded-lg ${isAlive ? 'bg-amber-100 border border-amber-300' : 'bg-amber-900/20 border border-amber-700'}`}>
              <p className={`text-base font-semibold mb-2 ${isAlive ? 'text-amber-900' : 'text-amber-300'}`}>
                Example with 4% fee (400 BPS):
              </p>
              <ul className={`text-sm space-y-1 ${isAlive ? 'text-amber-800' : 'text-amber-200'}`}>
                <li>• Burn 100 LIVECAT + 100 DEADCAT (200 total)</li>
                <li>• Mint = 200 × (1 - 0.04) = <strong>192 CATBOX</strong></li>
                <li>• <strong>8 tokens permanently destroyed</strong> (deflationary sink)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Arbitrage Opportunities Section */}
      <section className={`py-12 px-4 md:px-8 ${isAlive ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="max-w-5xl mx-auto" style={getFlickerShakeStyle(11, 6)}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${isAlive ? 'text-white' : 'text-black'}`}>
            Critical Arbitrage Opportunities
          </h2>

          {/* Arbitrage #1 */}
          <div className={`mb-8 p-6 rounded-xl border-2 ${isAlive ? 'bg-purple-900/20 border-purple-400' : 'bg-purple-100 border-purple-600'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-purple-300' : 'text-purple-700'}`}>
              Arbitrage #1: Price Imbalance Between LIVECAT and DEADCAT
            </h3>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Scenario:</strong> LIVECAT trading at $1.00, DEADCAT trading at $0.80
            </p>
            <div className={`p-4 rounded-lg mb-4 ${isAlive ? 'bg-black/40' : 'bg-white/60'}`}>
              <p className={`text-sm font-semibold mb-2 ${isAlive ? 'text-purple-300' : 'text-purple-700'}`}>Arbitrage Strategy:</p>
              <ol className={`text-sm space-y-1 list-decimal list-inside ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Buy DEADCAT for $0.80</li>
                <li>Buy LIVECAT for $1.00</li>
                <li>Rebox pair → get ~1.92 CATBOX (with 4% fee)</li>
                <li>If CATBOX trading at $1.00, you get ~$1.92 worth</li>
              </ol>
            </div>
            <div className={`font-mono text-sm p-4 rounded ${isAlive ? 'bg-black/40' : 'bg-white/60'}`}>
              <div className={`mb-2 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Profit calculation:</div>
              <div className={`ml-4 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Cost: $0.80 + $1.00 = $1.80</div>
              <div className={`ml-4 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Revenue: 1.92 × $1.00 = $1.92</div>
              <div className={`ml-4 font-bold ${isAlive ? 'text-green-400' : 'text-green-600'}`}>Profit: $0.12 (6.7%)</div>
            </div>
            <div className={`mt-4 p-4 rounded-lg ${isAlive ? 'bg-purple-800/30' : 'bg-purple-200'}`}>
              <p className={`text-sm font-semibold ${isAlive ? 'text-purple-200' : 'text-purple-800'}`}>
                Equilibrium condition (Put-Call Parity):
              </p>
              <p className={`font-mono text-sm mt-2 ${isAlive ? 'text-purple-100' : 'text-purple-900'}`}>
                P<sub>LIVECAT</sub> + P<sub>DEADCAT</sub> = 2 × P<sub>CATBOX</sub> × (1 - fee%)
              </p>
              <p className={`text-sm mt-2 ${isAlive ? 'text-purple-200' : 'text-purple-800'}`}>
                Or: P<sub>LIVECAT</sub> + P<sub>DEADCAT</sub> ≈ 1.92 × P<sub>CATBOX</sub> (with 4% fee)
              </p>
            </div>
          </div>

          {/* Arbitrage #2 */}
          <div className={`mb-8 p-6 rounded-xl border-2 ${isAlive ? 'bg-green-900/20 border-green-400' : 'bg-green-100 border-green-600'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-green-300' : 'text-green-700'}`}>
              Arbitrage #2: CATBOX Overvalued vs (LIVECAT + DEADCAT)
            </h3>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Scenario:</strong> CATBOX at $1.10, LIVECAT at $0.45, DEADCAT at $0.45
            </p>
            <div className={`font-mono text-sm p-4 rounded mb-4 ${isAlive ? 'bg-black/40' : 'bg-white/60'}`}>
              <div className={`mb-2 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Cost: $0.45 + $0.45 = $0.90 (to buy 1 pair)</div>
              <div className={`mb-2 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Output: 2 × 0.96 = 1.92 CATBOX (4% fee)</div>
              <div className={`mb-2 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Revenue: 1.92 × $1.10 = $2.112</div>
              <div className={`font-bold ${isAlive ? 'text-green-400' : 'text-green-600'}`}>Profit: $2.112 - $0.90 = $1.212 (135%!)</div>
            </div>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
              This drives arbitrageurs to:
            </p>
            <ul className={`text-sm space-y-2 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• <strong>BUY</strong> LIVECAT + DEADCAT pairs</li>
              <li>• <strong>REBOX</strong> them into CATBOX</li>
              <li>• <strong>SELL</strong> CATBOX at the inflated price</li>
            </ul>
            <p className={`text-base mt-4 font-semibold ${isAlive ? 'text-green-300' : 'text-green-700'}`}>
              This drives CATBOX price DOWN until equilibrium is restored.
            </p>
          </div>

          {/* Arbitrage #3 */}
          <div className={`mb-8 p-6 rounded-xl border-2 ${isAlive ? 'bg-blue-900/20 border-blue-400' : 'bg-blue-100 border-blue-600'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-blue-300' : 'text-blue-700'}`}>
              Arbitrage #3: CATBOX Undervalued (Observation is Profitable)
            </h3>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Scenario:</strong> CATBOX at $0.80, both LIVECAT and DEADCAT at $0.60
            </p>
            <div className={`font-mono text-sm p-4 rounded mb-4 ${isAlive ? 'bg-black/40' : 'bg-white/60'}`}>
              <div className={`mb-2 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Cost: $0.80 (buy 1 CATBOX)</div>
              <div className={`mb-2 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Expected output: $0.60 (you get either LIVECAT or DEADCAT)</div>
              <div className={`font-bold ${isAlive ? 'text-red-400' : 'text-red-600'}`}>Expected profit: $0.60 - $0.80 = -$0.20 (unprofitable)</div>
            </div>
            <div className={`p-4 rounded-lg ${isAlive ? 'bg-blue-800/30' : 'bg-blue-200'}`}>
              <p className={`text-sm font-semibold mb-2 ${isAlive ? 'text-blue-200' : 'text-blue-800'}`}>
                For observation to be profitable:
              </p>
              <p className={`font-mono text-sm ${isAlive ? 'text-blue-100' : 'text-blue-900'}`}>
                P<sub>CATBOX</sub> &lt; min(P<sub>LIVECAT</sub>, P<sub>DEADCAT</sub>)
              </p>
              <p className={`text-sm mt-2 ${isAlive ? 'text-blue-200' : 'text-blue-800'}`}>
                Because you're guaranteed to get ONE of them, not both!
              </p>
            </div>
          </div>

          {/* Arbitrage #4 */}
          <div className={`mb-8 p-6 rounded-xl border-2 ${isAlive ? 'bg-red-900/20 border-red-400' : 'bg-red-100 border-red-600'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-red-300' : 'text-red-700'}`}>
              Arbitrage #4: One Token Much More Valuable (Volatility Play)
            </h3>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Scenario:</strong> LIVECAT at $2.00, DEADCAT at $0.10, CATBOX at $1.00
            </p>
            <div className={`p-4 rounded-lg mb-4 ${isAlive ? 'bg-black/40' : 'bg-white/60'}`}>
              <p className={`text-sm font-semibold mb-2 ${isAlive ? 'text-red-300' : 'text-red-700'}`}>Expected value of observing:</p>
              <div className={`font-mono text-sm ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="mb-1">Cost: $1.00 (buy 1 CATBOX)</div>
                <div className="mb-1">Expected output: 0.5 × $2.00 + 0.5 × $0.10 = $1.05</div>
                <div className={`font-bold ${isAlive ? 'text-green-400' : 'text-green-600'}`}>Expected profit: $0.05 (5%)</div>
              </div>
            </div>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
              This creates <strong>observation pressure</strong> when tokens diverge significantly.
            </p>
            <div className={`p-4 rounded-lg mb-4 ${isAlive ? 'bg-black/40' : 'bg-white/60'}`}>
              <p className={`text-sm font-semibold mb-2 ${isAlive ? 'text-red-300' : 'text-red-700'}`}>For reboxing:</p>
              <div className={`font-mono text-sm ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="mb-1">Cost: $2.00 + $0.10 = $2.10 (buy 1 pair)</div>
                <div className="mb-1">Output: 1.92 CATBOX (4% fee)</div>
                <div className="mb-1">Revenue: 1.92 × $1.00 = $1.92</div>
                <div className={`font-bold ${isAlive ? 'text-red-400' : 'text-red-600'}`}>Loss: -$0.18 (unprofitable)</div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isAlive ? 'bg-red-800/30' : 'bg-red-200'}`}>
              <p className={`text-base font-semibold ${isAlive ? 'text-red-200' : 'text-red-800'}`}>
                Key Insight: When LIVECAT and DEADCAT diverge significantly, <strong>observation increases</strong> but <strong>reboxing decreases</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equilibrium Pricing Model Section */}
      <section className={`py-12 px-4 md:px-8 ${isAlive ? 'bg-white text-black' : 'bg-black text-white'}`}>
        <div className="max-w-5xl mx-auto" style={getFlickerShakeStyle(10, 5)}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${isAlive ? 'text-black' : 'text-white'}`}>
            Equilibrium Pricing Model
          </h2>
          <p className={`text-lg mb-6 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
            At equilibrium with rational arbitrageurs:
          </p>
          <div className={`p-6 rounded-xl mb-8 ${isAlive ? 'bg-gradient-to-r from-purple-100 to-blue-100' : 'bg-gradient-to-r from-purple-900/30 to-blue-900/30'}`}>
            <p className={`text-2xl font-mono font-bold text-center mb-4 ${isAlive ? 'text-purple-900' : 'text-purple-300'}`}>
              P<sub>CATBOX</sub> × (1 - rebox_fee) = (P<sub>LIVECAT</sub> + P<sub>DEADCAT</sub>) / 2
            </p>
            <p className={`text-center text-base ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>Or rearranging:</p>
            <p className={`text-2xl font-mono font-bold text-center mt-4 ${isAlive ? 'text-blue-900' : 'text-blue-300'}`}>
              P<sub>LIVECAT</sub> + P<sub>DEADCAT</sub> = 2 × P<sub>CATBOX</sub> × (1 - rebox_fee)
            </p>
          </div>

          <div className={`p-6 rounded-xl border-2 ${isAlive ? 'bg-amber-50 border-amber-300' : 'bg-amber-900/20 border-amber-700'}`}>
            <p className={`text-lg font-semibold mb-4 ${isAlive ? 'text-amber-900' : 'text-amber-300'}`}>
              Example with 4% rebox fee:
            </p>
            <ul className={`space-y-2 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
              <li>• If CATBOX = $1.00</li>
              <li>• Then LIVECAT + DEADCAT should equal 2 × $1.00 × 0.96 = <strong>$1.92</strong></li>
              <li>• The $0.08 discount (4%) represents the permanent token destruction from the rebox fee</li>
            </ul>
          </div>

          <div className={`mt-8 p-6 rounded-xl ${isAlive ? 'bg-blue-50' : 'bg-blue-900/20'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-blue-900' : 'text-blue-300'}`}>
              Arbitrage Bounds
            </h3>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
              The fee creates permanent arbitrage bounds:
            </p>
            <p className={`text-xl font-mono font-semibold text-center p-4 rounded ${isAlive ? 'bg-white text-blue-900' : 'bg-black/40 text-blue-300'}`}>
              min(P<sub>LIVECAT</sub>, P<sub>DEADCAT</sub>) ≤ P<sub>CATBOX</sub> ≤ (P<sub>LIVECAT</sub> + P<sub>DEADCAT</sub>) / (2 × (1 - fee))
            </p>
            <p className={`text-base mt-4 font-semibold ${isAlive ? 'text-blue-800' : 'text-blue-300'}`}>
              Any price outside these bounds enables profitable arbitrage!
            </p>
          </div>
        </div>
      </section>

      {/* Fee Impact Section */}
      <section className={`py-12 px-4 md:px-8 ${isAlive ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="max-w-5xl mx-auto" style={getFlickerShakeStyle(9, 4)}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${isAlive ? 'text-white' : 'text-black'}`}>
            Fee Impact on Supply Dynamics
          </h2>
          <p className={`text-lg mb-6 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
            The fee tokens are <strong>permanently destroyed</strong> — they're never minted back. This creates:
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl border-2 ${isAlive ? 'bg-red-900/20 border-red-400' : 'bg-red-100 border-red-600'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isAlive ? 'text-red-300' : 'text-red-700'}`}>Deflationary Pressure</h3>
              <p className={`text-sm ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                Every rebox permanently removes tokens from circulation
              </p>
            </div>
            <div className={`p-6 rounded-xl border-2 ${isAlive ? 'bg-orange-900/20 border-orange-400' : 'bg-orange-100 border-orange-600'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isAlive ? 'text-orange-300' : 'text-orange-700'}`}>Friction Cost</h3>
              <p className={`text-sm ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                Round-trip arbitrage (observe → rebox) costs 4% of principal
              </p>
            </div>
            <div className={`p-6 rounded-xl border-2 ${isAlive ? 'bg-green-900/20 border-green-400' : 'bg-green-100 border-green-600'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isAlive ? 'text-green-300' : 'text-green-700'}`}>Value Accrual</h3>
              <p className={`text-sm ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                Reduced supply benefits remaining token holders
              </p>
            </div>
          </div>

          <div className={`p-6 rounded-xl ${isAlive ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-purple-300' : 'text-purple-700'}`}>
              Estimated Deflation Rate
            </h3>
            <p className={`text-base mb-4 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
              Monthly token burn ≈ 4% fee × monthly rebox volume
            </p>
            <div className={`font-mono text-sm p-4 rounded ${isAlive ? 'bg-black/40' : 'bg-white/60'}`}>
              <div className={`mb-2 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>With 30% of supply reboxed monthly:</div>
              <div className={`ml-4 mb-1 ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>Burn = 0.04 × 0.30 = 0.012 (1.2% of total supply)</div>
              <div className={`ml-4 font-bold ${isAlive ? 'text-purple-300' : 'text-purple-700'}`}>≈ 1.2% monthly decay</div>
            </div>
            <p className={`text-sm mt-4 italic ${isAlive ? 'text-gray-400' : 'text-gray-600'}`}>
              Market incentives (arbitrage opportunities) drive rebox volume, creating a natural, predictable deflationary sink.
            </p>
          </div>
        </div>
      </section>

      {/* Trading Strategies Section */}
      <section className={`py-12 px-4 md:px-8 ${isAlive ? 'bg-white text-black' : 'bg-black text-white'}`}>
        <div className="max-w-5xl mx-auto" style={getFlickerShakeStyle(8, 3)}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${isAlive ? 'text-black' : 'text-white'}`}>
            Risk-Adjusted Trading Strategies
          </h2>

          <div className={`mb-8 p-6 rounded-xl border-2 ${isAlive ? 'bg-green-50 border-green-300' : 'bg-green-950/30 border-green-700'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-green-900' : 'text-green-300'}`}>
              Risk-Free Arbitrage (when available)
            </h3>
            <ol className={`space-y-2 list-decimal list-inside ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
              <li>Monitor price inequality: <code className={`px-2 py-1 rounded ${isAlive ? 'bg-white' : 'bg-black/40'}`}>P<sub>LIVECAT</sub> + P<sub>DEADCAT</sub> ≠ 2 × P<sub>CATBOX</sub> × (1 - fee)</code></li>
              <li>If sum too high: buy pairs → rebox → sell CATBOX</li>
              <li>If sum too low: buy CATBOX → observe → sell result</li>
            </ol>
          </div>

          <div className={`mb-8 p-6 rounded-xl border-2 ${isAlive ? 'bg-blue-50 border-blue-300' : 'bg-blue-950/30 border-blue-700'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-blue-900' : 'text-blue-300'}`}>
              Speculative/Hedging Strategies
            </h3>
            <ul className={`space-y-3 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
              <li>
                <strong className={`${isAlive ? 'text-blue-700' : 'text-blue-300'}`}>Buy CATBOX:</strong> If you believe volatility will create observation opportunities
              </li>
              <li>
                <strong className={`${isAlive ? 'text-blue-700' : 'text-blue-300'}`}>Buy LIVECAT + DEADCAT pairs:</strong> If you want exposure without observation risk
              </li>
              <li>
                <strong className={`${isAlive ? 'text-blue-700' : 'text-blue-300'}`}>Market Making:</strong> Provide liquidity on both sides, profit from spread
              </li>
            </ul>
          </div>

          <div className={`p-6 rounded-xl ${isAlive ? 'bg-gradient-to-r from-purple-100 via-blue-100 to-green-100' : 'bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-green-900/30'}`}>
            <h3 className={`text-2xl font-bold mb-4 text-center ${isAlive ? 'text-gray-900' : 'text-gray-100'}`}>
              🔑 Key Insight
            </h3>
            <p className={`text-lg text-center ${isAlive ? 'text-gray-800' : 'text-gray-200'}`}>
              This system is essentially a <strong>synthetic options market</strong> where CATBOX is like a binary option 
              that pays out either 100% LIVECAT or 100% DEADCAT, and the rebox mechanism is the "settlement" that enforces 
              <strong> put-call parity</strong> with a friction cost.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 md:px-8 ${isAlive ? 'bg-black text-gray-300' : 'bg-white text-gray-700'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm mb-4">
            <strong className={`${isAlive ? 'text-white' : 'text-black'}`}>Disclaimer:</strong> This analysis is for educational purposes only. 
            Arbitrage opportunities may or may not exist in practice due to market conditions, slippage, gas fees, and timing. 
            Trade at your own risk. This is not financial advice.
          </p>
          <p className={`text-xs ${isAlive ? 'text-gray-400' : 'text-gray-600'}`}>
            © Quantum Cat. All states superposed. Math never lies.
          </p>
        </div>
      </footer>
    </div>
  );
}

