import { useState } from "react";

// Enhanced chart components
const PriceRelationshipChart = ({ isAlive }: { isAlive: boolean }) => {
  const barColor = isAlive ? '#8b5cf6' : '#a78bfa';
  const aliveColor = isAlive ? '#10b981' : '#34d399';
  const deadColor = isAlive ? '#ef4444' : '#f87171';
  const gridColor = isAlive ? "#e5e7eb" : "#374151";
  const textColor = isAlive ? "#000" : "#fff";
  const accentColor = isAlive ? "#9333ea" : "#c084fc";
  
  return (
    <div className="w-full">
      <svg viewBox="0 0 400 280" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Background */}
        <rect x="0" y="0" width="400" height="280" fill="transparent"/>
        
        {/* Grid lines */}
        <line x1="60" y1="30" x2="60" y2="200" stroke={gridColor} strokeWidth="2"/>
        <line x1="60" y1="200" x2="360" y2="200" stroke={gridColor} strokeWidth="2"/>
        
        {/* Horizontal grid lines for reference */}
        <line x1="55" y1="80" x2="360" y2="80" stroke={gridColor} strokeWidth="1" opacity="0.3" strokeDasharray="4"/>
        <line x1="55" y1="140" x2="360" y2="140" stroke={gridColor} strokeWidth="1" opacity="0.3" strokeDasharray="4"/>
        
        {/* Y-axis labels */}
        <text x="50" y="35" textAnchor="end" fill={textColor} fontSize="11" opacity="0.7">$1.00</text>
        <text x="50" y="85" textAnchor="end" fill={textColor} fontSize="11" opacity="0.7">$0.75</text>
        <text x="50" y="145" textAnchor="end" fill={textColor} fontSize="11" opacity="0.7">$0.50</text>
        <text x="50" y="205" textAnchor="end" fill={textColor} fontSize="11" opacity="0.7">$0.00</text>
        
        {/* Bars with gradient effect */}
        <defs>
          <linearGradient id="gradCatbox" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={barColor} stopOpacity="1" />
            <stop offset="100%" stopColor={barColor} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="gradAlive" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={aliveColor} stopOpacity="1" />
            <stop offset="100%" stopColor={aliveColor} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="gradDead" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={deadColor} stopOpacity="1" />
            <stop offset="100%" stopColor={deadColor} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        
        {/* CATBOX Bar */}
        <rect x="100" y="30" width="55" height="170" fill="url(#gradCatbox)" stroke={barColor} strokeWidth="2" rx="4"/>
        
        {/* LIVECAT Bar */}
        <rect x="190" y="37" width="55" height="163" fill="url(#gradAlive)" stroke={aliveColor} strokeWidth="2" rx="4"/>
        
        {/* DEADCAT Bar */}
        <rect x="280" y="37" width="55" height="163" fill="url(#gradDead)" stroke={deadColor} strokeWidth="2" rx="4"/>
        
        {/* Value labels on bars */}
        <text x="127.5" y="20" textAnchor="middle" fill={barColor} fontSize="16" fontWeight="bold">$1.00</text>
        <text x="217.5" y="28" textAnchor="middle" fill={aliveColor} fontSize="16" fontWeight="bold">$0.96</text>
        <text x="307.5" y="28" textAnchor="middle" fill={deadColor} fontSize="16" fontWeight="bold">$0.96</text>
        
        {/* X-axis labels */}
        <text x="127.5" y="220" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">CATBOX</text>
        <text x="217.5" y="220" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">LIVECAT</text>
        <text x="307.5" y="220" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">DEADCAT</text>
        
        {/* Equilibrium bracket */}
        <path d="M 190 45 L 190 35 L 335 35 L 335 45" stroke={accentColor} strokeWidth="2.5" fill="none"/>
        <text x="262.5" y="52" textAnchor="middle" fill={accentColor} fontSize="13" fontWeight="bold">Sum = $1.92</text>
        
        {/* Annotation */}
        <text x="200" y="255" textAnchor="middle" fill={textColor} fontSize="12" opacity="0.8">
          Equilibrium: P_CATBOX × 1.92 = P_LIVE + P_DEAD
        </text>
      </svg>
    </div>
  );
};

const ArbitrageFlowChart = ({ isAlive }: { isAlive: boolean }) => {
  const boxColor = isAlive ? '#3b82f6' : '#60a5fa';
  const greenColor = isAlive ? '#10b981' : '#34d399';
  const redColor = isAlive ? '#ef4444' : '#f87171';
  const arrowColor = isAlive ? '#1f2937' : '#e5e7eb';
  const textColor = isAlive ? '#000' : '#fff';
  const bgBox = isAlive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(96, 165, 250, 0.15)';
  const bgGreen = isAlive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(52, 211, 153, 0.15)';
  const bgRed = isAlive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(248, 113, 113, 0.15)';
  
  return (
    <div className="w-full">
      <svg viewBox="0 0 500 320" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Arrow markers */}
        <defs>
          <marker id="arrowhead" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <polygon points="0 0, 12 6, 0 12" fill={arrowColor} />
          </marker>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Top box - CATBOX Overpriced */}
        <rect x="180" y="20" width="140" height="55" fill={bgBox} stroke={boxColor} strokeWidth="3" rx="8" filter="url(#shadow)"/>
        <text x="250" y="42" textAnchor="middle" fill={boxColor} fontSize="16" fontWeight="bold">CATBOX</text>
        <text x="250" y="60" textAnchor="middle" fill={textColor} fontSize="13">Overpriced @ $1.10</text>
        
        {/* Arrow down with label */}
        <path d="M 250 75 L 250 115" stroke={arrowColor} strokeWidth="3" markerEnd="url(#arrowhead)"/>
        <rect x="260" y="85" width="75" height="20" fill={isAlive ? 'white' : 'black'} opacity="0.9" rx="4"/>
        <text x="297.5" y="99" textAnchor="middle" fill={boxColor} fontSize="12" fontWeight="bold">OBSERVE</text>
        
        {/* Middle boxes - 50/50 Outcomes */}
        <g>
          <rect x="40" y="125" width="150" height="55" fill={bgGreen} stroke={greenColor} strokeWidth="3" rx="8" filter="url(#shadow)"/>
          <text x="115" y="145" textAnchor="middle" fill={greenColor} fontSize="15" fontWeight="bold">LIVECAT</text>
          <text x="115" y="165" textAnchor="middle" fill={textColor} fontSize="12">50% chance → $0.60</text>
        </g>
        
        <g>
          <rect x="310" y="125" width="150" height="55" fill={bgRed} stroke={redColor} strokeWidth="3" rx="8" filter="url(#shadow)"/>
          <text x="385" y="145" textAnchor="middle" fill={redColor} fontSize="15" fontWeight="bold">DEADCAT</text>
          <text x="385" y="165" textAnchor="middle" fill={textColor} fontSize="12">50% chance → $0.60</text>
        </g>
        
        {/* Probability labels */}
        <text x="115" y="120" textAnchor="middle" fill={greenColor} fontSize="11" fontWeight="bold">50%</text>
        <text x="385" y="120" textAnchor="middle" fill={redColor} fontSize="11" fontWeight="bold">50%</text>
        
        {/* Arrows to sell */}
        <path d="M 115 180 L 115 215" stroke={arrowColor} strokeWidth="3" markerEnd="url(#arrowhead)"/>
        <path d="M 385 180 L 385 215" stroke={arrowColor} strokeWidth="3" markerEnd="url(#arrowhead)"/>
        
        {/* Bottom boxes - Sell */}
        <g>
          <rect x="40" y="225" width="150" height="50" fill={greenColor} opacity="0.8" stroke={greenColor} strokeWidth="3" rx="8" filter="url(#shadow)"/>
          <text x="115" y="245" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">SELL</text>
          <text x="115" y="263" textAnchor="middle" fill="white" fontSize="13">@ Market Price</text>
        </g>
        
        <g>
          <rect x="310" y="225" width="150" height="50" fill={redColor} opacity="0.8" stroke={redColor} strokeWidth="3" rx="8" filter="url(#shadow)"/>
          <text x="385" y="245" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">SELL</text>
          <text x="385" y="263" textAnchor="middle" fill="white" fontSize="13">@ Market Price</text>
        </g>
        
        {/* Result box */}
        <rect x="150" y="285" width="200" height="28" fill={greenColor} opacity="0.2" stroke={greenColor} strokeWidth="2" rx="6"/>
        <text x="250" y="304" textAnchor="middle" fill={greenColor} fontSize="14" fontWeight="bold">Expected Profit: +$0.05</text>
      </svg>
    </div>
  );
};

const DeflationaryChart = ({ isAlive }: { isAlive: boolean }) => {
  const lineColor = isAlive ? '#ef4444' : '#f87171';
  const areaColor = isAlive ? '#ef4444' : '#f87171';
  const gridColor = isAlive ? "#e5e7eb" : "#374151";
  const textColor = isAlive ? "#000" : "#fff";
  const pointColor = isAlive ? '#dc2626' : '#fca5a5';
  
  // Data points for supply decay over 12 months
  const points = [
    { x: 60, y: 180, month: 0, percent: 100 },
    { x: 100, y: 168, month: 1, percent: 98.8 },
    { x: 140, y: 157, month: 2, percent: 97.6 },
    { x: 180, y: 147, month: 3, percent: 96.5 },
    { x: 220, y: 137, month: 4, percent: 95.3 },
    { x: 260, y: 128, month: 5, percent: 94.2 },
    { x: 300, y: 119, month: 6, percent: 93.1 },
  ];
  
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaData = `M 60,180 ${points.map(p => `L ${p.x},${p.y}`).join(' ')} L 300,180 Z`;
  
  return (
    <div className="w-full">
      <svg viewBox="0 0 400 240" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Background */}
        <rect x="0" y="0" width="400" height="240" fill="transparent"/>
        
        {/* Grid */}
        <line x1="50" y1="30" x2="50" y2="180" stroke={gridColor} strokeWidth="2"/>
        <line x1="50" y1="180" x2="350" y2="180" stroke={gridColor} strokeWidth="2"/>
        
        {/* Horizontal grid lines */}
        <line x1="45" y1="60" x2="350" y2="60" stroke={gridColor} strokeWidth="1" opacity="0.3" strokeDasharray="4"/>
        <line x1="45" y1="90" x2="350" y2="90" stroke={gridColor} strokeWidth="1" opacity="0.3" strokeDasharray="4"/>
        <line x1="45" y1="120" x2="350" y2="120" stroke={gridColor} strokeWidth="1" opacity="0.3" strokeDasharray="4"/>
        <line x1="45" y1="150" x2="350" y2="150" stroke={gridColor} strokeWidth="1" opacity="0.3" strokeDasharray="4"/>
        
        {/* Y-axis labels */}
        <text x="42" y="35" textAnchor="end" fill={textColor} fontSize="11" fontWeight="600">100%</text>
        <text x="42" y="65" textAnchor="end" fill={textColor} fontSize="11" fontWeight="600">98%</text>
        <text x="42" y="95" textAnchor="end" fill={textColor} fontSize="11" fontWeight="600">96%</text>
        <text x="42" y="125" textAnchor="end" fill={textColor} fontSize="11" fontWeight="600">94%</text>
        <text x="42" y="155" textAnchor="end" fill={textColor} fontSize="11" fontWeight="600">92%</text>
        
        {/* Area under curve */}
        <defs>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={areaColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={areaColor} stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <path d={areaData} fill="url(#areaGrad)"/>
        
        {/* Line with glow */}
        <path d={pathData} fill="none" stroke={lineColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
        
        {/* Points with animation effect */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill={pointColor} stroke="white" strokeWidth="2"/>
            {i % 2 === 0 && (
              <text x={p.x} y={p.y - 12} textAnchor="middle" fill={lineColor} fontSize="11" fontWeight="bold">
                {p.percent}%
              </text>
            )}
          </g>
        ))}
        
        {/* X-axis labels */}
        {points.map((p, i) => (
          <text key={`label-${i}`} x={p.x} y="200" textAnchor="middle" fill={textColor} fontSize="11" fontWeight="600">
            Mo {p.month}
          </text>
        ))}
        
        {/* Title */}
        <text x="200" y="225" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">
          Token Supply Decay (4% rebox fee, 30% monthly volume)
        </text>
      </svg>
    </div>
  );
};

const TriangleArbitrageChart = ({ isAlive }: { isAlive: boolean }) => {
  const catboxColor = isAlive ? '#8b5cf6' : '#a78bfa';
  const aliveColor = isAlive ? '#10b981' : '#34d399';
  const deadColor = isAlive ? '#ef4444' : '#f87171';
  const arrowColor = isAlive ? '#1f2937' : '#e5e7eb';
  const textColor = isAlive ? '#fff' : '#fff';
  
  return (
    <div className="w-full">
      <svg viewBox="0 0 400 380" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Definitions */}
        <defs>
          <marker id="arrow2" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <polygon points="0 0, 12 6, 0 12" fill={arrowColor} />
          </marker>
          <marker id="arrow-dashed" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <polygon points="0 0, 12 6, 0 12" fill={arrowColor} opacity="0.7" />
          </marker>
          <filter id="shadow2">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.3"/>
          </filter>
          <linearGradient id="gradCatbox2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={catboxColor} />
            <stop offset="100%" stopColor={catboxColor} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="gradAlive2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={aliveColor} />
            <stop offset="100%" stopColor={aliveColor} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="gradDead2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={deadColor} />
            <stop offset="100%" stopColor={deadColor} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        
        {/* Connection lines (background) */}
        {/* CATBOX to LIVECAT - observe */}
        <path d="M 150 85 L 90 250" stroke={arrowColor} strokeWidth="3" fill="none" markerEnd="url(#arrow2)" opacity="0.7"/>
        
        {/* CATBOX to DEADCAT - observe */}
        <path d="M 250 85 L 310 250" stroke={arrowColor} strokeWidth="3" fill="none" markerEnd="url(#arrow2)" opacity="0.7"/>
        
        {/* LIVECAT + DEADCAT to CATBOX - rebox (dashed) */}
        <path d="M 110 260 L 180 95" stroke={arrowColor} strokeWidth="3" fill="none" strokeDasharray="8 4" markerEnd="url(#arrow-dashed)" opacity="0.6"/>
        <path d="M 290 260 L 220 95" stroke={arrowColor} strokeWidth="3" fill="none" strokeDasharray="8 4" markerEnd="url(#arrow-dashed)" opacity="0.6"/>
        
        {/* Direct trade between LIVECAT and DEADCAT */}
        <path d="M 130 280 L 270 280" stroke={arrowColor} strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="4"/>
        
        {/* Token circles */}
        {/* CATBOX - top */}
        <circle cx="200" cy="60" r="50" fill="url(#gradCatbox2)" stroke={catboxColor} strokeWidth="4" filter="url(#shadow2)"/>
        <text x="200" y="60" textAnchor="middle" fill={textColor} fontSize="18" fontWeight="bold">CAT</text>
        <text x="200" y="78" textAnchor="middle" fill={textColor} fontSize="18" fontWeight="bold">BOX</text>
        
        {/* LIVECAT - bottom left */}
        <circle cx="80" cy="280" r="50" fill="url(#gradAlive2)" stroke={aliveColor} strokeWidth="4" filter="url(#shadow2)"/>
        <text x="80" y="278" textAnchor="middle" fill={textColor} fontSize="16" fontWeight="bold">LIVE</text>
        <text x="80" y="295" textAnchor="middle" fill={textColor} fontSize="16" fontWeight="bold">CAT</text>
        
        {/* DEADCAT - bottom right */}
        <circle cx="320" cy="280" r="50" fill="url(#gradDead2)" stroke={deadColor} strokeWidth="4" filter="url(#shadow2)"/>
        <text x="320" y="278" textAnchor="middle" fill={textColor} fontSize="16" fontWeight="bold">DEAD</text>
        <text x="320" y="295" textAnchor="middle" fill={textColor} fontSize="16" fontWeight="bold">CAT</text>
        
        {/* Labels on paths */}
        {/* Observe labels */}
        <g>
          <rect x="105" y="155" width="70" height="32" fill={isAlive ? 'white' : 'black'} opacity="0.95" rx="6" stroke={aliveColor} strokeWidth="2"/>
          <text x="140" y="170" textAnchor="middle" fill={aliveColor} fontSize="12" fontWeight="bold">Observe</text>
          <text x="140" y="183" textAnchor="middle" fill={isAlive ? '#000' : '#fff'} fontSize="10">(50%)</text>
        </g>
        
        <g>
          <rect x="225" y="155" width="70" height="32" fill={isAlive ? 'white' : 'black'} opacity="0.95" rx="6" stroke={deadColor} strokeWidth="2"/>
          <text x="260" y="170" textAnchor="middle" fill={deadColor} fontSize="12" fontWeight="bold">Observe</text>
          <text x="260" y="183" textAnchor="middle" fill={isAlive ? '#000' : '#fff'} fontSize="10">(50%)</text>
        </g>
        
        {/* Rebox label */}
        <g>
          <rect x="155" y="165" width="90" height="36" fill={isAlive ? 'white' : 'black'} opacity="0.95" rx="6" stroke={catboxColor} strokeWidth="2"/>
          <text x="200" y="182" textAnchor="middle" fill={catboxColor} fontSize="13" fontWeight="bold">REBOX</text>
          <text x="200" y="197" textAnchor="middle" fill={isAlive ? '#000' : '#fff'} fontSize="10">(4% fee)</text>
        </g>
        
        {/* Direct trade label */}
        <text x="200" y="268" textAnchor="middle" fill={isAlive ? '#374151' : '#9ca3af'} fontSize="10" opacity="0.7">Direct Trade</text>
        
        {/* Title */}
        <text x="200" y="360" textAnchor="middle" fill={isAlive ? '#000' : '#fff'} fontSize="15" fontWeight="bold">
          Three-Token Arbitrage Triangle
        </text>
      </svg>
    </div>
  );
};

export default function Economics() {
  const [isAlive, setIsAlive] = useState(true);

  return (
    <div 
      className={`min-h-screen ${isAlive ? 'bg-white' : 'bg-black'}`}
    >
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
        <div className="max-w-5xl mx-auto">
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

          {/* Key Insight */}
          <div className={`mt-8 p-4 md:p-6 rounded-xl ${isAlive ? 'bg-gradient-to-r from-purple-100 via-blue-100 to-green-100' : 'bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-green-900/30'}`}>
            <h3 className={`text-2xl font-bold mb-6 text-center ${isAlive ? 'text-gray-900' : 'text-gray-100'}`}>
              🔑 Key Insight
            </h3>
            <p className={`text-base md:text-lg text-center mb-6 px-2 md:px-4 ${isAlive ? 'text-gray-800' : 'text-gray-200'}`}>
              This system is essentially a <strong>synthetic options market</strong> where CATBOX is like a binary option 
              that pays out either 100% LIVECAT or 100% DEADCAT, and the rebox mechanism is the "settlement" that enforces 
              <strong> put-call parity</strong> with a friction cost.
            </p>
            <div className="max-w-2xl mx-auto">
              <TriangleArbitrageChart isAlive={isAlive} />
            </div>
          </div>
        </div>
      </section>

      {/* Core Mathematics Section */}
      <section className={`py-12 px-4 md:px-8 ${isAlive ? 'bg-white text-black' : 'bg-black text-white'}`}>
        <div className="max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto">
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
            
            {/* Arbitrage Flow Chart */}
            <div className={`mb-6 p-4 md:p-6 rounded-xl ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
              <div className="max-w-2xl mx-auto">
                <ArbitrageFlowChart isAlive={isAlive} />
              </div>
            </div>

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
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${isAlive ? 'text-black' : 'text-white'}`}>
            Equilibrium Pricing Model
          </h2>
          <p className={`text-lg mb-6 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
            At equilibrium with rational arbitrageurs:
          </p>

          {/* Price Relationship Chart */}
          <div className={`mb-8 p-4 md:p-6 rounded-xl ${isAlive ? 'bg-gradient-to-br from-purple-50 to-blue-50' : 'bg-gradient-to-br from-purple-900/20 to-blue-900/20'}`}>
            <h3 className={`text-xl font-bold mb-6 text-center ${isAlive ? 'text-gray-900' : 'text-gray-100'}`}>
              Equilibrium Price Relationship
            </h3>
            <div className="max-w-3xl mx-auto">
              <PriceRelationshipChart isAlive={isAlive} />
            </div>
            <p className={`text-center mt-6 text-sm md:text-base ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
              LIVECAT + DEADCAT ≈ 2 × CATBOX × 0.96 = $1.92
            </p>
          </div>

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
        <div className="max-w-5xl mx-auto">
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
            
            {/* Deflationary Chart */}
            <div className={`mb-6 p-4 md:p-6 rounded-xl ${isAlive ? 'bg-black/10' : 'bg-white/10'}`}>
              <div className="max-w-3xl mx-auto">
                <DeflationaryChart isAlive={isAlive} />
              </div>
            </div>

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
        <div className="max-w-5xl mx-auto">
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
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 md:px-8 ${isAlive ? 'bg-black text-gray-300' : 'bg-white text-gray-700'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className={`mb-8 p-6 rounded-xl border-2 ${isAlive ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-400'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${isAlive ? 'text-red-300' : 'text-red-700'}`}>
              ⚠️ CRITICAL DISCLAIMER
            </h3>
            <div className={`space-y-3 text-left ${isAlive ? 'text-gray-200' : 'text-gray-800'}`}>
              <p className="font-semibold">
                <strong className={`${isAlive ? 'text-red-300' : 'text-red-600'}`}>THIS ANALYSIS IS THEORETICAL AND EDUCATIONAL ONLY.</strong>
              </p>
              <p>
                The mathematical models, arbitrage strategies, and pricing relationships described on this page are <strong>purely theoretical</strong>. 
                They assume ideal market conditions that <strong>DO NOT exist in reality</strong>.
              </p>
              <p>
                <strong className={`${isAlive ? 'text-red-300' : 'text-red-600'}`}>NO GUARANTEES:</strong> This analysis does not guarantee any outcomes, profits, or price relationships. 
                Real markets include slippage, gas fees, front-running, low liquidity, timing delays, and countless other factors that make 
                theoretical arbitrage impossible or unprofitable in practice.
              </p>
              <p>
                <strong className={`${isAlive ? 'text-red-300' : 'text-red-600'}`}>NOT FINANCIAL ADVICE:</strong> Nothing on this page constitutes financial, investment, or trading advice. 
                Do not make any financial decisions based on this information. These tokens are memecoins with no intrinsic value.
              </p>
              <p>
                <strong className={`${isAlive ? 'text-red-300' : 'text-red-600'}`}>EXTREME RISK:</strong> Trading cryptocurrency is extremely risky and speculative. 
                You could lose 100% of your investment at any time. Market conditions can change instantly, and theoretical arbitrage 
                opportunities may never materialize or be instantly arbitraged away by bots.
              </p>
              <p>
                <strong className={`${isAlive ? 'text-red-300' : 'text-red-600'}`}>FOR ENTERTAINMENT ONLY:</strong> This entire project exists purely for entertainment and educational purposes. 
                Treat any participation as you would any other form of entertainment spending—assume total loss.
              </p>
            </div>
          </div>
          
          <p className="text-sm mb-4">
            <strong className={`${isAlive ? 'text-white' : 'text-black'}`}>Additional Disclaimer:</strong> This analysis is for educational purposes only. 
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

