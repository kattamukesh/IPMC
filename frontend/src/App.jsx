// import React, { useState, useCallback } from 'react';
// import TitleBar from './components/TitleBar';
// import StepIndicator from './components/StepIndicator';
// import InputScreen from './pages/InputScreen';
// import InitialSymbolScreen from './pages/InitialSymbolScreen';
// import SymbolScreen from './pages/SymbolScreen';
// import ResultScreen from './pages/ResultScreen';
// import { api } from './api';

// // Step indices:
// // 0 = Input (weight/size/image)
// // 1 = Initial Symbol Selection (multi-select)
// // 2-6 = Remaining positions (dynamic, based on initial selection)
// // 7 = Results

// const STEP_INPUT = 0;
// const STEP_INITIAL_SYMBOLS = 1;
// const STEP_SYMBOL_BASE = 2; // remaining positions start at 2
// const STEP_RESULT = 7;

// export default function App() {
//   const [step, setStep] = useState(STEP_INPUT);
//   const [sessionId, setSessionId] = useState(null);
//   const [possibleCoins, setPossibleCoins] = useState([]);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [filterResult, setFilterResult] = useState(null);
//   const [selectedPositions, setSelectedPositions] = useState(new Set()); // positions 1-5 that were selected
//   const [remainingPositions, setRemainingPositions] = useState([]); // positions left to fill
//   const [currentPositionIndex, setCurrentPositionIndex] = useState(0); // which remaining position we're on

//   // Map internal step to indicator step
//   const indicatorStep = step === STEP_INPUT ? 0
//     : step === STEP_INITIAL_SYMBOLS ? 1
//     : step >= STEP_SYMBOL_BASE && step <= 6 ? step + 1  // symbols: internal 2-6 → indicator 3-7
//     : step === STEP_RESULT ? 7
//     : 0;

//   const handleInputNext = useCallback(({ possibleCount, weightValid, weightNote, imagePreview: ip, ...rest }) => {
//     setFilterResult({ possibleCount, weightValid, weightNote });
//     if (ip) setImagePreview(ip);
//     setStep(STEP_INITIAL_SYMBOLS); // go to initial symbol selection
//   }, []);

//   const handleInitialSymbolsNext = useCallback(({ status, possibleCoins: coins, remainingPositions: remaining }) => {
//     setPossibleCoins(coins || []);

//     if (status === 'identified') {
//       // Single coin found, jump to results
//       setStep(STEP_RESULT);
//       setSelectedPositions(new Set());
//       setRemainingPositions([]);
//     } else if (status === 'narrowed' && remaining && remaining.length > 0) {
//       // Multiple coins, show remaining positions
//       setSelectedPositions(new Set());
//       setRemainingPositions(remaining);
//       setCurrentPositionIndex(0);
//       setStep(STEP_SYMBOL_BASE); // go to first remaining position
//     } else {
//       // No match or no remaining positions
//       setStep(STEP_RESULT);
//       setSelectedPositions(new Set());
//       setRemainingPositions([]);
//     }
//   }, []);

//   const handleSymbolNext = useCallback(({ possibleCoins: coins, identified }) => {
//     setPossibleCoins(coins || []);

//     if (identified) {
//       // Single coin identified, jump to results
//       setStep(STEP_RESULT);
//     } else if (currentPositionIndex < remainingPositions.length - 1) {
//       // More positions to go
//       setCurrentPositionIndex(prev => prev + 1);
//       setStep(STEP_SYMBOL_BASE + (currentPositionIndex + 1));
//     } else {
//       // All remaining positions done
//       setStep(STEP_RESULT);
//     }
//   }, [currentPositionIndex, remainingPositions]);

//   const handleSymbolBack = useCallback(() => {
//     if (currentPositionIndex > 0) {
//       // Go back to previous position
//       setCurrentPositionIndex(prev => prev - 1);
//       setStep(STEP_SYMBOL_BASE + (currentPositionIndex - 1));
//     } else {
//       // Go back to initial symbols
//       setStep(STEP_INITIAL_SYMBOLS);
//       setSelectedPositions(new Set());
//       setRemainingPositions([]);
//       setCurrentPositionIndex(0);
//     }
//   }, [currentPositionIndex]);

//   const handleSkipToResult = useCallback(() => {
//     setStep(STEP_RESULT);
//   }, []);

//   const handleReset = useCallback(async () => {
//     try {
//       if (sessionId) await api.reset(sessionId);
//     } catch (_) {}
//     setSessionId(null);
//     setPossibleCoins([]);
//     setImagePreview(null);
//     setFilterResult(null);
//     setSelectedPositions(new Set());
//     setRemainingPositions([]);
//     setCurrentPositionIndex(0);
//     setStep(STEP_INPUT);
//   }, [sessionId]);

//   // Get current position to display
//   const currentPosition = currentPositionIndex < remainingPositions.length
//     ? remainingPositions[currentPositionIndex]
//     : null;

//   return (
//     <div className="h-screen flex flex-col bg-imperial-dark overflow-hidden">
//       {/* Titlebar */}
//       <TitleBar />

//       {/* Main layout */}
//       <div className="flex-1 flex flex-col overflow-hidden">

//         {/* Background decorative elements */}
//         <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
//           <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-600/3 blur-3xl" />
//           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold-700/3 blur-3xl" />
//           {/* Corner ornaments */}
//           <div className="absolute top-12 left-6 font-display text-imperial-border text-4xl select-none">✦</div>
//           <div className="absolute top-12 right-6 font-display text-imperial-border text-4xl select-none">✦</div>
//           <div className="absolute bottom-6 left-6 font-display text-imperial-border text-4xl select-none">✦</div>
//           <div className="absolute bottom-6 right-6 font-display text-imperial-border text-4xl select-none">✦</div>
//         </div>

//         {/* Step indicator */}
//         <div className="relative z-10 border-b border-imperial-border bg-imperial-darker/80 backdrop-blur-sm">
//           <StepIndicator currentStep={indicatorStep} />
//         </div>

//         {/* Content area */}
//         <div className="flex-1 relative z-10 overflow-hidden flex flex-col">
//           {step === STEP_INPUT && (
//             <InputScreen
//               onNext={handleInputNext}
//               sessionId={sessionId}
//               setSessionId={setSessionId}
//             />
//           )}

//           {step === STEP_INITIAL_SYMBOLS && (
//             <InitialSymbolScreen
//               sessionId={sessionId}
//               possibleCoins={possibleCoins}
//               onNext={handleInitialSymbolsNext}
//               onBack={handleSymbolBack}
//             />
//           )}

//           {currentPosition !== null && step >= STEP_SYMBOL_BASE && step <= 6 && (
//             <SymbolScreen
//               key={`symbol-${currentPosition}`}
//               sessionId={sessionId}
//               position={currentPosition}
//               possibleCoins={possibleCoins}
//               onNext={handleSymbolNext}
//               onBack={handleSymbolBack}
//               onSkip={handleSkipToResult}
//             />
//           )}

//           {step === STEP_RESULT && (
//             <ResultScreen
//               sessionId={sessionId}
//               imagePreview={imagePreview}
//               onReset={handleReset}
//             />
//           )}
//         </div>

//         {/* Status bar */}
//         <div className="relative z-10 border-t border-imperial-border bg-imperial-darker/60 px-4 py-1.5 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//             <span className="font-mono text-xs text-imperial-muted">IPMC v1.2 · Offline</span>
//           </div>
//           {sessionId && (
//             <span className="font-mono text-xs text-imperial-muted">
//               Session: {sessionId.slice(0, 8)}…
//             </span>
//           )}
//           <span className="font-mono text-xs text-imperial-muted">
//             {possibleCoins.length > 0 ? `${possibleCoins.length} candidate${possibleCoins.length !== 1 ? 's' : ''}` : 'Ready'}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }







//---------------sreya--------------------
import React, { useState, useCallback } from 'react';
import TitleBar from './components/TitleBar';
import LandingPage from './pages/LandingPage';
import CoinsGallery from './pages/CoinsGallery';
import InputScreen from './pages/InputScreen';
import SymbolPickerScreen from './pages/SymbolPickerScreen';
import ResultScreen from './pages/ResultScreen';
import { api } from './api';

// Steps:
// 0 = Landing Page
// 1 = Coin Gallery
// 2 = Input (weight / size / image)
// 3 = Symbol picking (looping, up to 5 rounds)
// 4 = Result

const STEP_LANDING = 0;
const STEP_GALLERY = 1;
const STEP_INPUT = 2;
const STEP_SYMBOLS = 3;
const STEP_RESULT = 4;

export default function App() {
  const [step, setStep] = useState(STEP_LANDING);
  const [sessionId, setSessionId] = useState(null);
  const [possibleCoins, setPossibleCoins] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [weightWarning, setWeightWarning] = useState(null);
  const [weight, setWeight] = useState(null);

  // Landing page handlers
  const handleStartIdentification = useCallback(() => {
    setStep(STEP_INPUT);
  }, []);

  const handleViewGallery = useCallback(() => {
    setStep(STEP_GALLERY);
  }, []);

  // Gallery back handler
  const handleGalleryBack = useCallback(() => {
    setStep(STEP_LANDING);
  }, []);

  // Map internal step → StepIndicator index (keep existing indicator compatible)
  const indicatorStep = step === STEP_INPUT ? 0 : step === STEP_SYMBOLS ? 1 : 7;

  // InputScreen finished → move to symbol picking
  const handleInputNext = useCallback(({ imagePreview: ip, weightWarning, weight }) => {
    if (ip) setImagePreview(ip);
    // Store weight warning for results screen
    setWeightWarning(weightWarning);
    setWeight(weight);
    setStep(STEP_SYMBOLS);
  }, []);

  // Exactly 1 coin found during symbol picking → jump to result
  const handleIdentified = useCallback((coins) => {
    setPossibleCoins(coins || []);
    setStep(STEP_RESULT);
  }, []);

  // 0 coins remain → jump to result (will show no_match via /result endpoint)
  const handleNoMatch = useCallback(() => {
    setPossibleCoins([]);
    setStep(STEP_RESULT);
  }, []);

  // User clicked "Show Results" with multiple coins still possible
  const handleFinish = useCallback((coins) => {
    setPossibleCoins(coins || []);
    setStep(STEP_RESULT);
  }, []);

  // Back from symbol picker → back to input
  const handleSymbolBack = useCallback(() => {
    setStep(STEP_INPUT);
  }, []);

  // Reset everything
  const handleReset = useCallback(async () => {
    try {
      if (sessionId) await api.reset(sessionId);
    } catch (_) {}
    setSessionId(null);
    setPossibleCoins([]);
    setImagePreview(null);
    setWeightWarning(null);
    setWeight(null);
    setStep(STEP_LANDING);
  }, [sessionId]);

  return (
    <div className="h-screen flex flex-col bg-imperial-dark overflow-hidden">
      {/* Titlebar */}
      <TitleBar />

      {/* Main layout */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-600/3 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold-700/3 blur-3xl" />
        </div>

        {/* Content area */}
        <div className="flex-1 relative z-10 overflow-hidden flex flex-col">
          {step === STEP_LANDING && (
            <LandingPage
              onStartIdentification={handleStartIdentification}
              onViewGallery={handleViewGallery}
            />
          )}

          {step === STEP_GALLERY && (
            <CoinsGallery onBack={handleGalleryBack} />
          )}

          {step === STEP_INPUT && (
            <InputScreen
              onNext={handleInputNext}
              sessionId={sessionId}
              setSessionId={setSessionId}
              onBack={() => setStep(STEP_LANDING)}
            />
          )}

          {step === STEP_SYMBOLS && (
            <SymbolPickerScreen
              sessionId={sessionId}
              onIdentified={handleIdentified}
              onNoMatch={handleNoMatch}
              onFinish={handleFinish}
              onBack={handleSymbolBack}
            />
          )}

          {step === STEP_RESULT && (
            <ResultScreen
              sessionId={sessionId}
              imagePreview={imagePreview}
              weightWarning={weightWarning}
              weight={weight}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Status bar */}
        <div className="relative z-10 border-t border-imperial-border bg-imperial-darker/60 px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-xs text-imperial-muted">IPMC v2.0 · Offline</span>
          </div>
          {sessionId && (
            <span className="font-mono text-xs text-imperial-muted">
              Session: {sessionId.slice(0, 8)}…
            </span>
          )}
          <span className="font-mono text-xs text-imperial-muted">
            {possibleCoins.length > 0
              ? `${possibleCoins.length} candidate${possibleCoins.length !== 1 ? 's' : ''}`
              : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
