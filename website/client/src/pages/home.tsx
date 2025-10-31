import { useState, useEffect, useRef, useCallback } from "react";
import aliveCat from "@assets/alive@4x.webp";
import deadCat from "@assets/dead@4x.webp";
import qcat from "@assets/qcat@4x.webp";
import { useToast } from "@/hooks/use-toast";
import { useFlickerEffect } from "@/hooks/use-flicker-effect";
import { useSoundEffects } from "@/hooks/use-sound-effects";

export default function Home() {

  const [isAlive, setIsAlive] = useState(true); // Initial state (will be set randomly after first glitch)
  const [isGlitching, setIsGlitching] = useState(false);
  const [nextState, setNextState] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [glitchFlickerIntensity, setGlitchFlickerIntensity] = useState(1);
  const [glitchText, setGlitchText] = useState({
    title: "QɄ₳₦₮Ʉ₥ ₵₳₮",
    status: "",
    aboutHeading: "₩Ⱨ₳₮'₴ ł₦ ₮ⱧɆ ฿ØӾ?",
    tokenomicsHeading: "₮Ø₭Ɇ₦Ø₥ł₵₴",
    howToCollectHeading: "ⱧØ₩ ₮Ø ₵ØⱠⱠɆ₵₮",
    faqHeading: "₣₳Q"
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const randomSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const glitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const glitchFlickerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const isPausedRef = useRef(isPaused);
  const { toast } = useToast();
  
  // Custom hooks for flicker and sound effects
  const { playGlitchSound, playFlickerBuzz } = useSoundEffects(isMuted);
  
  const { showBothFlicker, flickerIntensity } = useFlickerEffect(playFlickerBuzz, isPaused);
  
  // Contract address - update this when token is launched
  const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual contract address
  
  // Helper function to generate flicker and shake styles
  const getFlickerShakeStyle = (seedX: number, seedY: number, shakeAmount: number = 1) => {
    // Use glitch-specific flicker intensity during glitch, otherwise use periodic flicker intensity
    const currentIntensity = isGlitching ? glitchFlickerIntensity : flickerIntensity;
    // During glitch, clamp opacity to prevent text from disappearing (min 0.7)
    const effectiveIntensity = isGlitching ? Math.max(currentIntensity, 0.7) : currentIntensity;
    
    return {
      opacity: (showBothFlicker || isGlitching) ? effectiveIntensity : 1,
      filter: (showBothFlicker || isGlitching) ? `brightness(${0.8 + effectiveIntensity * 0.4})` : 'none',
      transform: (showBothFlicker || isGlitching) 
        ? `translate(${Math.sin(currentIntensity * seedX) * shakeAmount}px, ${Math.cos(currentIntensity * seedY) * shakeAmount}px)` 
        : 'none',
      transition: 'none',
    };
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    }
  };

  // Secure random 50/50 observation
  const getSecureRandom = (): boolean => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return (array[0] ?? 0) % 2 === 0;
  };

  // Observe a QCAT - randomly generates ALIVECAT or DEADCAT
  const observeQCat = () => {
    if (isGlitching || isPaused) return;
    const willBeAlive = getSecureRandom();
    triggerGlitch(willBeAlive);
  };

  // Function to scramble text during glitch
  const scrambleText = (text: string): string => {
    const chars = [...text];
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements
      const temp = chars[i];
      if (chars[j] !== undefined && temp !== undefined) {
        chars[i] = chars[j];
        chars[j] = temp;
      }
    }
    return chars.join('');
  };

  const triggerGlitch = useCallback((newState: boolean) => {
    // Prevent multiple simultaneous glitches or if paused
    if (!isMountedRef.current || isPausedRef.current) return;

    // Clear any existing glitch timers
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current);
      glitchIntervalRef.current = null;
    }
    if (glitchTimeoutRef.current) {
      clearTimeout(glitchTimeoutRef.current);
      glitchTimeoutRef.current = null;
    }
    if (glitchFlickerIntervalRef.current) {
      clearInterval(glitchFlickerIntervalRef.current);
      glitchFlickerIntervalRef.current = null;
    }

    // Random glitch duration between 800 and 1600 ms
    const glitchDuration = Math.floor(800 + Math.random() * 800);

    // Set the next state to show during flicker
    setNextState(newState);
    setIsGlitching(true);

    // Start flicker intensity animation (rapid flicker effect)
    const flickerPattern = [0.7, 0.3, 0.8, 0.4, 0.75, 0.5, 0.9, 0.6, 0.85];
    let flickerIndex = 0;
    const flickerInterval = setInterval(() => {
      if (!isMountedRef.current) return;
      const intensity = flickerPattern[flickerIndex % flickerPattern.length];
      if (intensity !== undefined) {
        setGlitchFlickerIntensity(intensity);
      }
      flickerIndex++;
    }, 40); // Update every 40ms for rapid flicker
    
    glitchFlickerIntervalRef.current = flickerInterval;

    // Start text scrambling
    const statusTexts = {
      alive: "QɄ₳₦₮Ʉ₥ ₴₮₳₮Ɇ: ₳ⱠłVɆ",
      dead: "QɄ₳₦₮Ʉ₥ ₴₮₳₮Ɇ: ĐɆ₳Đ"
    };

    const originalHeadings = {
      aboutHeading: "₩Ⱨ₳₮'₴ ł₦ ₮ⱧɆ ฿ØӾ?",
      tokenomicsHeading: "₮Ø₭Ɇ₦Ø₥ł₵₴",
      howToCollectHeading: "ⱧØ₩ ₮Ø ₵ØⱠⱠɆ₵₮",
      faqHeading: "₣₳Q"
    };

    let scrambleCount = 0;
    const textGlitchInterval = setInterval(() => {
      if (!isMountedRef.current) return;

      setGlitchText((prev) => ({
        title: scrambleText("QɄ₳₦₮Ʉ₥ ₵₳₮"),
        status: scrambleText(prev.status || (newState ? statusTexts.alive : statusTexts.dead)),
        aboutHeading: scrambleText(originalHeadings.aboutHeading),
        tokenomicsHeading: scrambleText(originalHeadings.tokenomicsHeading),
        howToCollectHeading: scrambleText(originalHeadings.howToCollectHeading),
        faqHeading: scrambleText(originalHeadings.faqHeading)
      }));
      scrambleCount++;

      // Stop scrambling after a few iterations
      if (scrambleCount > 8) {
        if (glitchIntervalRef.current) {
          clearInterval(glitchIntervalRef.current);
          glitchIntervalRef.current = null;
        }
        setGlitchText({
          title: "QɄ₳₦₮Ʉ₥ ₵₳₮",
          status: newState ? statusTexts.alive : statusTexts.dead,
          ...originalHeadings
        });
      }
    }, 75);

    glitchIntervalRef.current = textGlitchInterval;

    // Play glitch sound (will respect mute state)
    playGlitchSound(glitchDuration);

    // After glitch, transition to new state
    const glitchTimeout = setTimeout(() => {
      if (!isMountedRef.current) return;

      setIsAlive(newState);
      setIsGlitching(false);
      setGlitchFlickerIntensity(1); // Reset flicker intensity

      if (glitchIntervalRef.current) {
        clearInterval(glitchIntervalRef.current);
        glitchIntervalRef.current = null;
      }

      if (glitchFlickerIntervalRef.current) {
        clearInterval(glitchFlickerIntervalRef.current);
        glitchFlickerIntervalRef.current = null;
      }

      setGlitchText({
        title: "QɄ₳₦₮Ʉ₥ ₵₳₮",
        status: newState ? statusTexts.alive : statusTexts.dead,
        ...originalHeadings
      });

      glitchTimeoutRef.current = null;
    }, glitchDuration + 100);

    glitchTimeoutRef.current = glitchTimeout;
  }, [playGlitchSound]);

  useEffect(() => {
    isMountedRef.current = true;

    // Initial glitch effect on page load - stay alive
    const initialGlitchTimeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        triggerGlitch(true); // Glitch from alive to alive
      }
    }, 300);

    // Set up random auto-switch between 20-45 seconds
    const scheduleRandomSwitch = () => {
      if (!isMountedRef.current) return;

      const randomDelay = 20000 + Math.random() * 25000; // 20-45 seconds
      randomSwitchTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current || isPausedRef.current) {
          // Still schedule next switch even if paused
          scheduleRandomSwitch();
          return;
        }

        setIsAlive((currentIsAlive) => {
          setIsGlitching((currentIsGlitching) => {
            if (!currentIsGlitching && isMountedRef.current && !isPausedRef.current) {
              triggerGlitch(!currentIsAlive);
            }
            return currentIsGlitching;
          });
          return currentIsAlive;
        });
        // Schedule next random switch only if still mounted
        scheduleRandomSwitch();
      }, randomDelay);
    };

    // Start the random switch timer after initial glitch
    const startRandomSwitchTimeoutId = setTimeout(() => {
      scheduleRandomSwitch();
    }, 1000); // Start after initial glitch completes

    return () => {
      isMountedRef.current = false;

      clearTimeout(initialGlitchTimeoutId);
      clearTimeout(startRandomSwitchTimeoutId);
      if (randomSwitchTimeoutRef.current) {
        clearTimeout(randomSwitchTimeoutRef.current);
        randomSwitchTimeoutRef.current = null;
      }
      if (glitchIntervalRef.current) {
        clearInterval(glitchIntervalRef.current);
        glitchIntervalRef.current = null;
      }
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
        glitchTimeoutRef.current = null;
      }
    };
  }, [triggerGlitch]);

  // Handle pause state changes
  useEffect(() => {
    isPausedRef.current = isPaused;
    
    if (isPaused) {
      // Stop any ongoing glitch
      setIsGlitching(false);
      setGlitchFlickerIntensity(1);
      
      // Clear glitch intervals
      if (glitchIntervalRef.current) {
        clearInterval(glitchIntervalRef.current);
        glitchIntervalRef.current = null;
      }
      if (glitchFlickerIntervalRef.current) {
        clearInterval(glitchFlickerIntervalRef.current);
        glitchFlickerIntervalRef.current = null;
      }
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
        glitchTimeoutRef.current = null;
      }
      
      // Reset glitch text
      setGlitchText({
        title: "QɄ₳₦₮Ʉ₥ ₵₳₮",
        status: isAlive ? "QɄ₳₦₮Ʉ₥ ₴₮₳₮Ɇ: ₳ⱠłVɆ" : "QɄ₳₦₮Ʉ₥ ₴₮₳₮Ɇ: ĐɆ₳Đ",
        aboutHeading: "₩Ⱨ₳₮'₴ ł₦ ₮ⱧɆ ฿ØӾ?",
        tokenomicsHeading: "₮Ø₭Ɇ₦Ø₥ł₵₴",
        howToCollectHeading: "ⱧØ₩ ₮Ø ₵ØⱠⱠɆ₵₮",
        faqHeading: "₣₳Q"
      });
    }
  }, [isPaused, isAlive]);

  // Handle click to observe QCAT
  const handleClick = () => {
    if (!isGlitching && !isPaused) {
      observeQCat();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen  ${isAlive ? 'bg-white' : 'bg-black'}`}
      data-testid="quantum-container"
    >
      {/* Floating Pause Button - bottom right */}
      <button
          onClick={() => setIsPaused(!isPaused)}
          className={`fixed bottom-4 right-20 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
            isPaused
              ? 'bg-white/90 hover:bg-white text-black border-2 border-black'
              : 'bg-black/90 hover:bg-black text-white border-2 border-white'
          }`}
          aria-label={isPaused ? "Resume animations" : "Pause animations"}
          title={isPaused ? "Resume animations" : "Pause animations"}
          style={{
            ...getFlickerShakeStyle(21, 20, 1.5),
            transition: showBothFlicker ? 'none' : 'all 300ms',
          }}
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

      {/* Floating Mute Button - bottom right corner */}
      <button
          onClick={() => setIsMuted(!isMuted)}
          className={`fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
            isMuted
              ? 'bg-white/90 hover:bg-white text-black border-2 border-black'
              : 'bg-black/90 hover:bg-black text-white border-2 border-white'
          }`}
          aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          title={isMuted ? "Unmute sound" : "Mute sound"}
          style={{
            ...getFlickerShakeStyle(20, 19, 1.5),
            transition: showBothFlicker ? 'none' : 'all 300ms',
          }}
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

      {/* Hero Section - adjusted for banner */}
      <div className={`relative min-h-screen flex flex-col items-center justify-center px-4 md:px-8 pt-16 `}>
        <div className="relative mb-8 z-10 text-center">
          <h1  
            className={`text-5xl md:text-7xl font-bold whitespace-nowrap  ${isAlive ? 'text-black' : 'text-white'} ${isGlitching ? 'glitch-text' : ''}`}
            data-testid="text-title"
            data-text={glitchText.title}
            style={getFlickerShakeStyle(12, 8, 2)}
          >
            {isGlitching ? glitchText.title : "QɄ₳₦₮Ʉ₥ ₵₳₮"}
          </h1>
        </div>
        <div 
          className="relative w-full aspect-square max-w-[480px] z-10 cursor-pointer" 
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={`Quantum cat in ${isAlive ? 'alive' : 'dead'} state. Click to observe and trigger quantum state change.`}
        >
          {/* Current state image */}
          {!isGlitching ? (
            <>
              <div 
                className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-contain"
                style={{ 
                  backgroundImage: `url(${isAlive ? aliveCat : deadCat})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center center',
                }}
                data-testid="img-quantum-cat"
                role="img"
                aria-label={isAlive ? 'Cat in alive quantum state' : 'Cat in dead quantum state'}
              />
              {/* Periodic "both" state flicker overlay with glitch effect */}
              {showBothFlicker && (
                <div className="absolute inset-0 overflow-hidden">
                  {Array.from({ length: 20 }, (_, i) => {
                    const stripHeight = 5; // 5% height per strip
                    const topPosition = i * stripHeight;
                    const randomDelay = Math.random() * 0.05;
                    const randomX = (Math.random() - 0.5) * 15;
                    
                    return (
                      <div
                        key={`flicker-${i}`}
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${topPosition}%`,
                          height: `${stripHeight}%`,
                          overflow: 'hidden',
                          opacity: flickerIntensity,
                          transform: `translateX(${randomX}px)`,
                          transition: 'none',
                          // Background color matches current state
                          backgroundColor: isAlive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${-i * 100}%`,
                            height: '2000%',
                            backgroundImage: `url(${qcat})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            filter: `brightness(${0.8 + flickerIntensity * 0.4}) contrast(${0.9 + flickerIntensity * 0.2}) hue-rotate(${randomDelay * 100}deg)`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Glitch strips container */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Generate strips dynamically */}
                {Array.from({ length: 20 }, (_, i) => {
                  const stripHeight = 5; // 5% height per strip
                  const topPosition = i * stripHeight;
                  const randomDelay = Math.random() * 0.3;
                  const randomX1 = (Math.random() - 0.5) * 50;
                  const randomX2 = (Math.random() - 0.5) * 50;
                  const randomHue1 = Math.random() * 360;
                  const randomHue2 = Math.random() * 360;
                  
                  return (
                    <div
                      key={i}
                      className="glitch-strip"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: `${topPosition}%`,
                        height: `${stripHeight}%`,
                        overflow: 'hidden',
                        animationDelay: `${randomDelay}s`,
                        '--strip-x-1': `${randomX1}px`,
                        '--strip-x-2': `${randomX2}px`,
                        '--strip-hue-1': `${randomHue1}deg`,
                        '--strip-hue-2': `${randomHue2}deg`,
                      } as React.CSSProperties}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${-i * 100}%`,
                          height: '2000%',
                          backgroundImage: `url(${isAlive ? aliveCat : deadCat})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              {/* Next state glitch strips */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 20 }, (_, i) => {
                  const stripHeight = 5; // 5% height per strip
                  const topPosition = i * stripHeight;
                  const randomDelay = Math.random() * 0.2 + 0.3; // Delay after first glitch
                  const randomX1 = (Math.random() - 0.5) * 60;
                  const randomX2 = (Math.random() - 0.5) * 60;
                  
                  return (
                    <div
                      key={`next-${i}`}
                      className="next-glitch-strip"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: `${topPosition}%`,
                        height: `${stripHeight}%`,
                        overflow: 'hidden',
                        animationDelay: `${randomDelay}s`,
                        '--next-x-1': `${randomX1}px`,
                        '--next-x-2': `${randomX2}px`,
                      } as React.CSSProperties}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${-i * 100}%`,
                          height: '2000%',
                          backgroundImage: `url(${nextState ? aliveCat : deadCat})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="relative mt-8 z-10 text-center">
          {/* Current state text */}
          <h2 
            className={`text-2xl md:text-4xl font-bold whitespace-nowrap  ${isAlive ? 'text-black' : 'text-white'} ${isGlitching ? 'glitch-text' : ''}`}
            data-testid="text-tagline"
            data-text={isGlitching ? glitchText.status : (isAlive ? "₳ⱠłVɆ Ɇ₦ØɄ₲Ⱨ ₮Ø ₱Ʉ₥₱" : "ĐɆ₳Đ Ɇ₦ØɄ₲Ⱨ ₮Ø ₥Ɇ₥Ɇ")}
            style={getFlickerShakeStyle(15, 11, 1.5)}
          >
            {isGlitching ? glitchText.status : (isAlive ? "₳ⱠłVɆ Ɇ₦ØɄ₲Ⱨ ₮Ø ₱Ʉ₥₱" : "ĐɆ₳Đ Ɇ₦ØɄ₲Ⱨ ₮Ø ₥Ɇ₥Ɇ")}
          </h2>
          
          {/* Next state text - flickers in during glitch */}
          {isGlitching && (
            <h2 
              className={`absolute inset-0 text-2xl md:text-4xl font-bold whitespace-nowrap glitch-flicker  ${nextState ? 'text-black' : 'text-white'}`}
            >
              {nextState ? "₳ⱠłVɆ Ɇ₦ØɄ₲Ⱨ ₮Ø ₱Ʉ₥₱" : "ĐɆ₳Đ Ɇ₦ØɄ₲Ⱨ ₮Ø ₥Ɇ₥Ɇ"}
            </h2>
          )}
        </div>
      </div>

      {/* About Section */}
      <section 
        id="about-section" 
        className={`py-20 px-4 md:px-8  ${isAlive ? 'bg-black text-white' : 'bg-white text-black'}`}
      >
        <div className="max-w-4xl mx-auto" style={getFlickerShakeStyle(14, 9)}>
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-8  ${isAlive ? 'text-white' : 'text-black'}`}>
            {isGlitching ? glitchText.aboutHeading : "₩Ⱨ₳₮'₴ ł₦ ₮ⱧɆ ฿ØӾ?"}
          </h2>
          <p className={`text-lg md:text-xl text-center leading-relaxed mb-6  ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
            Quantum Cat is a memecoin experiment with <strong>three separate ERC-20 tokens</strong> deployed on <strong className={`${isAlive ? 'text-blue-400' : 'text-blue-600'}`}>Base L2</strong> (Coinbase's Ethereum L2) - inspired by <a href="https://en.wikipedia.org/wiki/Schr%C3%B6dinger%27s_cat" target="_blank" rel="noopener noreferrer" className={`underline  ${isAlive ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>Schrödinger's famous thought experiment</a>:
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className={`p-6 rounded-lg border-2 ${isAlive ? 'bg-purple-900/20 border-purple-400' : 'bg-purple-100 border-purple-600'}`}>
              <div className="flex justify-center mb-4">
                <img src={qcat} alt="QCAT Token - Quantum superposition state" className="w-24 h-24 object-contain" loading="lazy" width="96" height="96" />
              </div>
              <h3 className={`text-xl font-bold mb-2 text-center ${isAlive ? 'text-purple-300' : 'text-purple-700'}`}>QCAT</h3>
              <p className={`text-sm text-center ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>The superposed coin - exists in quantum uncertainty</p>
            </div>
            <div className={`p-6 rounded-lg border-2 ${isAlive ? 'bg-green-900/20 border-green-400' : 'bg-green-100 border-green-600'}`}>
              <div className="flex justify-center mb-4">
                <img src={aliveCat} alt="ALIVECAT Token - Observed alive state" className="w-24 h-24 object-contain" loading="lazy" width="96" height="96" />
              </div>
              <h3 className={`text-xl font-bold mb-2 text-center ${isAlive ? 'text-green-300' : 'text-green-700'}`}>ALIVECAT</h3>
              <p className={`text-sm text-center ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>The observed outcome - the cat is alive</p>
            </div>
            <div className={`p-6 rounded-lg border-2 ${isAlive ? 'bg-red-900/20 border-red-400' : 'bg-red-100 border-red-600'}`}>
              <div className="flex justify-center mb-4">
                <img src={deadCat} alt="DEADCAT Token - Observed dead state" className="w-24 h-24 object-contain" loading="lazy" width="96" height="96" />
              </div>
              <h3 className={`text-xl font-bold mb-2 text-center ${isAlive ? 'text-red-300' : 'text-red-700'}`}>DEADCAT</h3>
              <p className={`text-sm text-center ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>The observed outcome - the cat is dead</p>
            </div>
          </div>
          <p className={`text-base md:text-lg text-center leading-relaxed mb-4  ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
            The initial supply of <strong>66,260,701 QCAT</strong> is inspired by <a href="https://en.wikipedia.org/wiki/Planck_constant" target="_blank" rel="noopener noreferrer" className={`underline  ${isAlive ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>Planck's constant</a> (6.6260701 × 10⁻³⁴ J⋅s).
            Holders can <strong>"observe"</strong> their QCAT to collapse it into EITHER all ALIVECAT OR all DEADCAT (50/50 gamble), or <strong>"rebox"</strong> equal pairs (0.5 ALIVE + 0.5 DEAD = 1 QCAT before fee) with a 4% fee that creates steady deflation.
          </p>
          <div className={`mb-4 p-4 rounded-lg ${isAlive ? 'bg-blue-900/30 border-2 border-blue-500' : 'bg-blue-100 border-2 border-blue-600'}`}>
            <p className={`text-base md:text-lg text-center font-semibold ${isAlive ? 'text-blue-300' : 'text-blue-800'}`}>
              🔵 Deployed on <strong>Base L2</strong> for ultra-low fees (~$0.005-0.01 per transaction)
            </p>
            <p className={`text-sm text-center mt-2 ${isAlive ? 'text-blue-400' : 'text-blue-700'}`}>
              Base makes gameplay affordable! The same transactions cost $20-50 on Ethereum.
            </p>
          </div>
          <p className={`text-base md:text-lg text-center leading-relaxed italic  ${isAlive ? 'text-gray-400' : 'text-gray-600'}`}>
            Pure meme energy. No utility. No roadmap. No promises. Just quantum fun on Base.
          </p>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section 
        className={`py-20 px-4 md:px-8  ${isAlive ? 'bg-white' : 'bg-black'}`}
      >
        <div className="max-w-6xl mx-auto" style={getFlickerShakeStyle(13, 7)}>
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-4  ${isAlive ? 'text-black' : 'text-white'}`}>
            {isGlitching ? glitchText.tokenomicsHeading : "₮Ø₭Ɇ₦Ø₥ł₵₴"}
          </h2>
          <p className={`text-center mb-4 ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
            Initial Supply: 66,260,701 QCAT • Inspired by <a href="https://en.wikipedia.org/wiki/Planck_constant" target="_blank" rel="noopener noreferrer" className={`underline hover:opacity-80`}>Planck's Constant</a> (6.6260701 × 10⁻³⁴ J⋅s)
          </p>
          <p className={`text-center mb-12 text-sm ${isAlive ? 'text-gray-500' : 'text-gray-500'}`}>
            ERC-20 Architecture on <strong className={`${isAlive ? 'text-blue-400' : 'text-blue-600'}`}>Base L2</strong> • Three Separate Tokens • Observe & Rebox Mechanics
          </p>
          
          {/* How It Works - Observe & Rebox */}
          <div className="mb-12 max-w-4xl mx-auto">
            <h3 className={`text-2xl font-bold mb-6 text-center ${isAlive ? 'text-black' : 'text-white'}`}>ⱧØ₩ ł₮ ₩ØⱤ₭₴</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border-2 ${isAlive ? 'bg-blue-50 border-blue-300' : 'bg-blue-950/30 border-blue-700'}`}>
                <h4 className={`text-xl font-bold mb-3 ${isAlive ? 'text-blue-900' : 'text-blue-300'}`}>OBSERVE</h4>
                <p className={`text-sm mb-3 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
                  Collapse QCAT into ONE observed outcome:
                </p>
                <div className={`font-mono text-sm p-3 rounded ${isAlive ? 'bg-white' : 'bg-black/40'}`}>
                  <div className={`${isAlive ? 'text-purple-700' : 'text-purple-400'}`}>QCAT → commit → wait → observe</div>
                  <div className={`${isAlive ? 'text-green-700' : 'text-green-400'}`}>Burns QCAT</div>
                  <div className={`${isAlive ? 'text-blue-700' : 'text-blue-400'}`}>Mints EITHER all ALIVECAT OR all DEADCAT</div>
                  <div className={`text-xs mt-2 ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>(50/50 chance • 100% one type, 0% other)</div>
                </div>
                <p className={`text-xs mt-3 ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
                  Requires 5-block delay (fair RNG) • No supply change
                </p>
              </div>
              <div className={`p-6 rounded-xl border-2 ${isAlive ? 'bg-orange-50 border-orange-300' : 'bg-orange-950/30 border-orange-700'}`}>
                <h4 className={`text-xl font-bold mb-3 ${isAlive ? 'text-orange-900' : 'text-orange-300'}`}>REBOX</h4>
                <p className={`text-sm mb-3 ${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
                  Recombine equal pairs into superposition:
                </p>
                <div className={`font-mono text-sm p-3 rounded ${isAlive ? 'bg-white' : 'bg-black/40'}`}>
                  <div className={`${isAlive ? 'text-green-700' : 'text-green-400'}`}>ALIVECAT + DEADCAT → rebox</div>
                  <div className={`${isAlive ? 'text-red-700' : 'text-red-400'}`}>Burns 0.5 ALIVE + 0.5 DEAD</div>
                  <div className={`${isAlive ? 'text-purple-700' : 'text-purple-400'}`}>Mints 1 QCAT (before fee)</div>
                  <div className={`${isAlive ? 'text-amber-700' : 'text-amber-400'}`}>0.96 QCAT net (4% fee)</div>
                  <div className={`text-xs mt-2 ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>(1 ALIVE + 1 DEAD = 1.92 QCAT)</div>
                </div>
                <p className={`text-xs mt-3 ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
                  4% fee = deflationary sink • Only supply decrease
                </p>
              </div>
            </div>
            <div className={`mt-6 p-4 rounded-lg ${isAlive ? 'bg-yellow-50 border border-yellow-200' : 'bg-yellow-950/20 border border-yellow-800'}`}>
              <p className={`text-sm text-center ${isAlive ? 'text-yellow-900' : 'text-yellow-300'}`}>
                <strong>Price Relationship:</strong> P<sub>QCAT</sub> ≈ (P<sub>ALIVE</sub> + P<sub>DEAD</sub>) / 2 × 0.965 = (P<sub>ALIVE</sub> + P<sub>DEAD</sub>) / 2.07 • Arbitrage keeps markets balanced
              </p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className={`backdrop-blur-sm p-6 rounded-xl text-center  ${isAlive ? 'bg-black/10' : 'bg-white/10'}`}>
              <div className={`text-4xl font-bold mb-2  ${isAlive ? 'text-black' : 'text-white'}`}>662.6M</div>
              <div className={` ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>Initial QCAT</div>
            </div>
            <div className={`backdrop-blur-sm p-6 rounded-xl text-center  ${isAlive ? 'bg-black/10' : 'bg-white/10'}`}>
              <div className={`text-4xl font-bold mb-2  ${isAlive ? 'text-black' : 'text-white'}`}>3 Tokens</div>
              <div className={` ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>ERC-20</div>
            </div>
            <div className={`backdrop-blur-sm p-6 rounded-xl text-center  ${isAlive ? 'bg-black/10' : 'bg-white/10'}`}>
              <div className={`text-4xl font-bold mb-2  ${isAlive ? 'text-black' : 'text-white'}`}>5%</div>
              <div className={` ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>Rebox Fee</div>
            </div>
            <div className={`backdrop-blur-sm p-6 rounded-xl text-center  ${isAlive ? 'bg-black/10' : 'bg-white/10'}`}>
              <div className={`text-4xl font-bold mb-2  ${isAlive ? 'text-black' : 'text-white'}`}>Fair</div>
              <div className={` ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>5-Block RNG</div>
            </div>
          </div>

          {/* Contract Address */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className={`border p-6 rounded-lg  ${isAlive ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className={`text-sm mb-1  ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>ERC-20 Contract Addresses on Base L2 🔵</div>
                  <div className={`font-mono text-sm md:text-base break-all  ${isAlive ? 'text-black' : 'text-white'}`}>
                    {CONTRACT_ADDRESS}
                  </div>
                  <div className={`text-xs mt-2  ${isAlive ? 'text-gray-500' : 'text-gray-500'}`}>
                    Three separate tokens on Base: QCAT • ALIVECAT • DEADCAT
                  </div>
                  <div className={`text-xs mt-1  ${isAlive ? 'text-blue-600' : 'text-blue-400'}`}>
                    View on <a href="https://basescan.org/" target="_blank" rel="noopener noreferrer" className="underline">Basescan</a> • Trade on <a href="https://app.uniswap.org/" target="_blank" rel="noopener noreferrer" className="underline">Uniswap</a> or <a href="https://aerodrome.finance/" target="_blank" rel="noopener noreferrer" className="underline">Aerodrome</a>
                  </div>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap ${isAlive ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
          
          {/* Distribution */}
          <div className="max-w-4xl mx-auto">
            <h3 className={`text-2xl font-bold mb-6 text-center ${isAlive ? 'text-black' : 'text-white'}`}>Đł₴₮Ɽł฿Ʉ₮łØ₦</h3>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="flex-1 min-w-[300px]">
                <div className="flex h-16 rounded-xl overflow-hidden shadow-lg">
                  <div className={`flex items-center justify-center font-bold text-sm ${isAlive ? 'bg-purple-600 text-white' : 'bg-purple-400 text-black'}`} style={{width: "40%"}}>
                    <span className="flex items-center gap-2">
                      40%
                    </span>
                  </div>
                  <div className={`flex items-center justify-center font-bold text-sm ${isAlive ? 'bg-blue-600 text-white' : 'bg-blue-400 text-black'}`} style={{width: "25%"}}>
                    25%
                  </div>
                  <div className={`flex items-center justify-center font-bold text-sm ${isAlive ? 'bg-green-600 text-white' : 'bg-green-400 text-black'}`} style={{width: "15%"}}>
                    15%
                  </div>
                  <div className={`flex items-center justify-center font-bold text-sm ${isAlive ? 'bg-yellow-600 text-white' : 'bg-yellow-400 text-black'}`} style={{width: "10%"}}>
                    10%
                  </div>
                  <div className={`flex items-center justify-center font-bold text-sm ${isAlive ? 'bg-orange-600 text-white' : 'bg-orange-400 text-black'}`} style={{width: "10%"}}>
                    10%
                  </div>
                </div>
              </div>
            </div>
            <div className={`text-center mt-4 text-sm space-y-2 ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
              <p><strong className={`${isAlive ? 'text-purple-700' : 'text-purple-400'}`}>40% Liquidity Pools</strong> (26.5M) — QCAT/ETH, QCAT/USDC, ALIVE/DEAD arbitrage pair, plus DEX reserves</p>
              <p><strong className={`${isAlive ? 'text-blue-700' : 'text-blue-400'}`}>25% Genesis Observation</strong> (16.6M) — Public livestreamed event creating EITHER 16.6M ALIVECAT OR 16.6M DEADCAT (50/50 drama!)</p>
              <p><strong className={`${isAlive ? 'text-green-700' : 'text-green-400'}`}>15% Community Rewards</strong> (9.9M) — Liquidity mining, airdrops to observation participants, trading competitions</p>
              <p><strong className={`${isAlive ? 'text-yellow-700' : 'text-yellow-400'}`}>10% Team</strong> (6.6M) — 12-month linear vesting in timelock contract, aligned incentives</p>
              <p><strong className={`${isAlive ? 'text-orange-700' : 'text-orange-400'}`}>10% Strategic Reserve</strong> (6.6M) — CEX listings, partnerships, emergency liquidity (multisig)</p>
            </div>
            <div className={`mt-6 p-4 rounded-lg text-center ${isAlive ? 'bg-purple-50 border border-purple-200' : 'bg-purple-950/20 border border-purple-800'}`}>
              <p className={`text-sm ${isAlive ? 'text-purple-900' : 'text-purple-300'}`}>
                <strong>Genesis observation is a gamble!</strong> The entire market watches as 16.6M QCAT collapse into one outcome. Whichever token is created becomes instantly scarce vs the other. More observations will follow to balance supply and seed all liquidity pools on Base.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="max-w-4xl mx-auto mt-12">
            <h3 className={`text-2xl font-bold mb-6 text-center ${isAlive ? 'text-black' : 'text-white'}`}>₩ⱧɎ QɄ₳₦₮Ʉ₥ ₵₳₮?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
                <h4 className={`font-bold mb-2 ${isAlive ? 'text-black' : 'text-white'}`}>True Quantum Mechanics</h4>
                <p className={`text-sm ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
                  Observe & rebox your tokens - actual game mechanics tied to superposition & collapse
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
                <h4 className={`font-bold mb-2 ${isAlive ? 'text-black' : 'text-white'}`}>Deflationary by Design</h4>
                <p className={`text-sm ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
                  5% rebox fee creates steady token burn - expected ~1.05%/mo decay at 30% monthly volume
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
                <h4 className={`font-bold mb-2 ${isAlive ? 'text-black' : 'text-white'}`}>Arbitrage Triangle</h4>
                <p className={`text-sm ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
                  QCAT ↔ ALIVE ↔ DEAD trading creates natural price balance through arbitrage
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
                <h4 className={`font-bold mb-2 ${isAlive ? 'text-black' : 'text-white'}`}>Fair RNG</h4>
                <p className={`text-sm ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
                  Commit-reveal with 5-block delay - no manipulation, provably fair observation
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
                <h4 className={`font-bold mb-2 ${isAlive ? 'text-black' : 'text-white'}`}>Planck Inspired</h4>
                <p className={`text-sm ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
                  66,260,701 initial supply from Planck's constant - the only memecoin with quantum DNA
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
                <h4 className={`font-bold mb-2 ${isAlive ? 'text-black' : 'text-white'}`}>Built for Base L2 🔵</h4>
                <p className={`text-sm ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
                  Ultra-low fees (~$0.005-0.01) make observe/rebox gameplay affordable for everyone - would cost $20-50 per play on Ethereum!
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
                <h4 className={`font-bold mb-2 ${isAlive ? 'text-black' : 'text-white'}`}>Launch Ready on Base</h4>
                <p className={`text-sm ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>
                  All 3 tokens tradable day one on Uniswap V3 and Aerodrome - QCAT/ETH primary pool, plus ALIVE/DEAD arbitrage pair for tight price discovery
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Collect Section */}
      <section 
        className={`py-20 px-4 md:px-8  ${isAlive ? 'bg-black' : 'bg-white'}`}
      >
        <div className="max-w-4xl mx-auto" style={getFlickerShakeStyle(16, 6)}>
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-12  ${isAlive ? 'text-white' : 'text-black'}`}>
            {isGlitching ? glitchText.howToCollectHeading : "ⱧØ₩ ₮Ø ₵ØⱠⱠɆ₵₮"}
          </h2>
          <div className="space-y-6">
              <div className="flex gap-6 items-start">
              <div className={`text-4xl font-bold  ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>1</div>
              <div>
                <h3 className={`text-2xl font-bold mb-2  ${isAlive ? 'text-white' : 'text-black'}`}>Get Coinbase Wallet or MetaMask</h3>
                <p className={`text-lg  ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                  Download <a href="https://www.coinbase.com/wallet" target="_blank" rel="noopener noreferrer" className={`underline  ${isAlive ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>Coinbase Wallet</a> (easiest for Base) or <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className={`underline  ${isAlive ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>MetaMask</a>.
                  Base network is automatically configured in Coinbase Wallet!
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className={`text-4xl font-bold  ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>2</div>
              <div>
                <h3 className={`text-2xl font-bold mb-2  ${isAlive ? 'text-white' : 'text-black'}`}>Get ETH on Base</h3>
                <p className={`text-lg  ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Option A (Easiest):</strong> Buy ETH on <a href="https://www.coinbase.com" target="_blank" rel="noopener noreferrer" className={`underline  ${isAlive ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>Coinbase</a> → Send to Coinbase Wallet on Base network (no bridging needed!)<br/>
                  <strong>Option B:</strong> Bridge ETH from Ethereum to Base via <a href="https://bridge.base.org/" target="_blank" rel="noopener noreferrer" className={`underline  ${isAlive ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>Base Bridge</a>
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className={`text-4xl font-bold  ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>3</div>
              <div>
                <h3 className={`text-2xl font-bold mb-2  ${isAlive ? 'text-white' : 'text-black'}`}>Trade on Uniswap or Aerodrome (Base DEXs)</h3>
                <p className={`text-lg  ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                  Go to <a href="https://app.uniswap.org" target="_blank" rel="noopener noreferrer" className={`underline  ${isAlive ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>Uniswap</a> or <a href="https://aerodrome.finance" target="_blank" rel="noopener noreferrer" className={`underline  ${isAlive ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>Aerodrome</a>, <strong>switch to Base network</strong>, connect your wallet, and trade any of the three ERC-20 tokens:
                  <strong className={`${isAlive ? 'text-purple-400' : 'text-purple-600'}`}> QCAT</strong> (superposed quantum state),
                  <strong className={`${isAlive ? 'text-green-400' : 'text-green-600'}`}> ALIVECAT</strong> (observed alive), or
                  <strong className={`${isAlive ? 'text-red-400' : 'text-red-600'}`}> DEADCAT</strong> (observed dead).
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className={`text-4xl font-bold  ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>4</div>
              <div>
                <h3 className={`text-2xl font-bold mb-2  ${isAlive ? 'text-white' : 'text-black'}`}>Observe or Rebox Your Tokens</h3>
                <p className={`text-lg  ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                  Call <code className={`px-2 py-1 rounded ${isAlive ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>observe()</code> on QCAT to collapse it into EITHER all ALIVE OR all DEAD (50/50 gamble, 5-block delay for fair RNG).
                  Or call <code className={`px-2 py-1 rounded ${isAlive ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>rebox()</code> with equal pairs of ALIVE + DEAD (1:1 ratio) to mint QCAT (4% fee). Play the arbitrage game!
                </p>
              </div>
            </div>
              <div className="flex gap-6 items-start">
              <div className={`text-4xl font-bold  ${isAlive ? 'text-gray-600' : 'text-gray-400'}`}>5</div>
              <div>
                <h3 className={`text-2xl font-bold mb-2  ${isAlive ? 'text-white' : 'text-black'}`}>HODL, Trade, or Play on Base</h3>
                <p className={`text-lg  ${isAlive ? 'text-gray-300' : 'text-gray-700'}`}>
                  You now own quantum tokens - digital collectibles with no inherent value. These tokens exist purely for entertainment on Base L2, where transaction fees are ~$0.01 instead of $20-50 on Ethereum. Watch the arbitrage triangle balance itself through market forces. Trade at your own risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        className={`py-20 px-4 md:px-8  ${isAlive ? 'bg-white' : 'bg-black'}`}
      >
        <div className="max-w-4xl mx-auto" style={getFlickerShakeStyle(11, 17)}>
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-12  ${isAlive ? 'text-black' : 'text-white'}`}>
            {isGlitching ? glitchText.faqHeading : "₣₳Q"}
          </h2>
          <div className="space-y-6">
            <div className={`p-6 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isAlive ? 'text-black' : 'text-white'}`}>Why is QCAT slightly pricier than the average of ALIVECAT and DEADCAT?</h3>
              <p className={`${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
                Because reboxing requires EQUAL amounts (1 ALIVE + 1 DEAD) to mint 0.96 QCAT (due to the 4% fee). This creates pricing equilibrium:
                P<sub>QCAT</sub> ≈ (P<sub>ALIVE</sub> + P<sub>DEAD</sub>) / 1.92. If prices drift, arbitrageurs profit by observing or reboxing until balance is restored.
              </p>
            </div>
            <div className={`p-6 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isAlive ? 'text-black' : 'text-white'}`}>How does observation work? Do I get both ALIVECAT and DEADCAT?</h3>
              <p className={`${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
                No! Observation gives you EITHER 100% ALIVECAT OR 100% DEADCAT (never a mix). It's a true 50/50 random outcome - you get ALL of one type, NONE of the other.
                This mimics quantum wave function collapse. The total amount equals the QCAT you burned. Supply changes only happen through rebox fees.
              </p>
            </div>
            <div className={`p-6 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isAlive ? 'text-black' : 'text-white'}`}>How does the deflationary sink stay steady?</h3>
              <p className={`${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
                The monthly token burn ≈ 4% fee × monthly rebox volume. With 30% of supply reboxed monthly, that's ~0.84% monthly decay. 
                Market incentives (arbitrage opportunities) drive rebox volume, creating a natural, predictable sink.
              </p>
            </div>
            <div className={`p-6 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isAlive ? 'text-black' : 'text-white'}`}>What makes this different from other memecoins?</h3>
              <p className={`${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
                Three separate ERC-20 tokens with actual game mechanics. You can actively participate by observing, reboxing, and arbitraging.
                The deflationary mechanism is built into user actions, not arbitrary burns. Plus, all three tokens are live from day one with full liquidity.
              </p>
            </div>
            <div className={`p-6 rounded-lg ${isAlive ? 'bg-black/5' : 'bg-white/5'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isAlive ? 'text-black' : 'text-white'}`}>Where can I trade all three tokens?</h3>
              <p className={`${isAlive ? 'text-gray-700' : 'text-gray-300'}`}>
                Primary pools on <strong>Base L2</strong> via Uniswap V3 and Aerodrome: QCAT/ETH for main liquidity, QCAT/USDC for stablecoin trading. The ALIVE/DEAD pairing pool (0.05% fee) enables tight arbitrage and keeps the triangle balanced. 
                All pools seeded at launch. Trading fees ~$0.01 on Base vs $20-50 on Ethereum!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Disclaimer */}
      <footer className={`py-12 px-4 md:px-8  ${isAlive ? 'bg-black text-gray-300' : 'bg-white text-gray-700'}`}>
        <div className="max-w-4xl mx-auto text-center" style={getFlickerShakeStyle(9, 18)}>
          <div className="mb-6 flex justify-center">
            <div className={`inline-flex items-center gap-2 px-6 py-3 border-2 rounded-lg  ${isAlive ? 'border-white/20' : 'border-black/20'}`}>
              <span className="text-2xl">🇺🇸</span>
              <span className={`font-bold text-lg  ${isAlive ? 'text-white' : 'text-black'}`}>Made in America</span>
            </div>
          </div>
          <p className="mb-4 text-sm">
            <strong className={` ${isAlive ? 'text-white' : 'text-black'}`}>Important Disclaimer:</strong> Quantum Cat (QCAT, ALIVECAT, DEADCAT) are memecoins created for entertainment purposes only, deployed on Base L2 for affordable gameplay. 
            They have no intrinsic value, no utility, and no expectation of financial return or profit. These tokens do not represent an investment contract, 
            ownership stake, or any claim on assets or revenue. Purchasing any Quantum Cat tokens should be considered the same as buying any other entertainment product - 
            they may have no resale value whatsoever. Cryptocurrency markets are extremely volatile and speculative. 
            Never purchase more tokens than you can afford to lose completely. This is not financial advice.
          </p>
          <p className="text-sm">
            Quantum Cat are purely digital collectibles and community participation tokens deployed on Base L2 (Coinbase's Ethereum L2) where transactions cost ~$0.01 instead of $20-50 on Ethereum. Any price fluctuations are driven entirely by market speculation 
            and have no connection to any underlying business, project development, or promised outcomes. The observe and rebox mechanics are game features, not value propositions. 
            You should expect the value to potentially go to zero at any time. Playing with quantum superposition is fun, but it's not an investment.
          </p>
          <p className={`mt-6 text-xs  ${isAlive ? 'text-gray-400' : 'text-gray-600'}`}>
            © Quantum Cat. All states superposed. Built with uncertainty principle.
          </p>
        </div>
      </footer>
    </div>
  );
}


