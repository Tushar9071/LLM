import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Loader, RefreshCw, X, Check, BrainCircuit, Star, Zap } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface WordPair {
  native: string;
  translated: string;
}

interface MatchingItem {
  word: string;
  type: 'native' | 'translated';
  originalIndex: number;
  matched: boolean;
  selected: boolean;
}

type GameState = 'idle' | 'loading-task1' | 'task1' | 'loading-task2' | 'task2' | 'results';

const GAME_DURATION_SECONDS = 90;

// --- HELPER FUNCTIONS ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- MAIN COMPONENT ---
const WordPuzzleGamePage = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [error, setError] = useState<string | null>(null);

  // States for both tasks
  const [nativeWords, setNativeWords] = useState<MatchingItem[]>([]);
  const [translatedWords, setTranslatedWords] = useState<MatchingItem[]>([]);
  const [task2NativeWords, setTask2NativeWords] = useState<MatchingItem[]>([]);
  const [task2TranslatedWords, setTask2TranslatedWords] = useState<MatchingItem[]>([]);
  
  const [selection, setSelection] = useState<{ item: MatchingItem; list: 'native' | 'translated' } | null>(null);
  const [task2Selection, setTask2Selection] = useState<{ item: MatchingItem; list: 'native' | 'translated' } | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // --- API CALL FOR TASK 1 ---
  const fetchTask1Words = useCallback(async () => {
    setGameState('loading-task1');
    setError(null);

    try {
      const response = await fetch('/api/game/wordgame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const responseText = await response.text();
      const lines = responseText.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error("No words received for Task 1");
      }

      const parsedWords = lines.map((line, index) => {
        const separator = line.includes(' - ') ? ' - ' : '-';
        const parts = line.split(separator).map(part => part.trim());
        
        if (parts.length !== 2) {
          throw new Error(`Invalid format in line: "${line}"`);
        }
        
        return {
          native: parts[0],
          translated: parts[1],
          originalIndex: index
        };
      });

      // Setup Task 1 game
      setNativeWords(parsedWords.map(w => ({ 
        word: w.native, 
        type: 'native', 
        originalIndex: w.originalIndex, 
        matched: false, 
        selected: false 
      })));
      
      setTranslatedWords(shuffleArray(parsedWords).map(w => ({ 
        word: w.translated, 
        type: 'translated', 
        originalIndex: w.originalIndex, 
        matched: false, 
        selected: false 
      })));

      setGameState('task1');
      setTimerActive(true);

    } catch (err) {
      console.error("Task 1 API Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load Task 1 words");
      setGameState('idle');
    }
  }, []);

  // --- API CALL FOR TASK 2 ---
  const fetchTask2Words = useCallback(async () => {
    setGameState('loading-task2');
    setError(null);

    try {
      const response = await fetch('/api/game/wordgame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const responseText = await response.text();
      const lines = responseText.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error("No words received for Task 2");
      }

      const parsedWords = lines.map((line, index) => {
        const separator = line.includes(' - ') ? ' - ' : '-';
        const parts = line.split(separator).map(part => part.trim());
        
        if (parts.length !== 2) {
          throw new Error(`Invalid format in line: "${line}"`);
        }
        
        return {
          native: parts[0],
          translated: parts[1],
          originalIndex: index
        };
      });

      // Setup Task 2 game
      setTask2NativeWords(parsedWords.map(w => ({ 
        word: w.native, 
        type: 'native', 
        originalIndex: w.originalIndex, 
        matched: false, 
        selected: false 
      })));
      
      setTask2TranslatedWords(shuffleArray(parsedWords).map(w => ({ 
        word: w.translated, 
        type: 'translated', 
        originalIndex: w.originalIndex, 
        matched: false, 
        selected: false 
      })));

      setGameState('task2');

    } catch (err) {
      console.error("Task 2 API Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load Task 2 words");
      setGameState('idle');
    }
  }, []);

  // --- GAME START ---
  const startGame = () => {
    fetchTask1Words();
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerActive(false);
        setGameState('results');
      }
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prevTime => prevTime - 1), 1000);
    return () => clearInterval(timerId);
  }, [timerActive, timeLeft]);

  // --- TASK 1 & 2: MATCHING LOGIC ---
  const handleSelect = (item: MatchingItem, list: 'native' | 'translated', isTask2: boolean = false) => {
    const currentSelection = isTask2 ? task2Selection : selection;
    const setCurrentSelection = isTask2 ? setTask2Selection : setSelection;
    const setCurrentNativeWords = isTask2 ? setTask2NativeWords : setNativeWords;
    const setCurrentTranslatedWords = isTask2 ? setTask2TranslatedWords : setTranslatedWords;

    if (item.matched) return;
    
    if (!currentSelection) {
      setCurrentSelection({ item, list });
      updateSelectionState(item, list, true, isTask2);
      return;
    }
    
    if (currentSelection.item.originalIndex === item.originalIndex && currentSelection.list === list) {
      setCurrentSelection(null);
      updateSelectionState(item, list, false, isTask2);
      return;
    }
    
    if (currentSelection.list === list) {
      updateSelectionState(currentSelection.item, currentSelection.list, false, isTask2);
      setCurrentSelection({ item, list });
      updateSelectionState(item, list, true, isTask2);
      return;
    }
    
    if (currentSelection.item.originalIndex === item.originalIndex) {
      setScore(s => s + (isTask2 ? 15 : 10));
      updateMatchState(item.originalIndex, isTask2);
    } else {
      setScore(s => Math.max(0, s - (isTask2 ? 3 : 2)));
    }
    
    setTimeout(() => {
      if (currentSelection) {
        updateSelectionState(currentSelection.item, currentSelection.list, false, isTask2);
      }
      setCurrentSelection(null);
    }, 300);
  };

  const updateSelectionState = (
    item: MatchingItem, 
    list: 'native' | 'translated', 
    selected: boolean,
    isTask2: boolean
  ) => {
    const updater = (prevList: MatchingItem[]) => 
      prevList.map(i => i.originalIndex === item.originalIndex ? {...i, selected } : i);
      
    if (isTask2) {
      if (list === 'native') setTask2NativeWords(updater);
      else setTask2TranslatedWords(updater);
    } else {
      if (list === 'native') setNativeWords(updater);
      else setTranslatedWords(updater);
    }
  };

  const updateMatchState = (originalIndex: number, isTask2: boolean) => {
    const updater = (prevList: MatchingItem[]) => 
      prevList.map(i => i.originalIndex === originalIndex ? {...i, matched: true, selected: false } : i);
    
    if (isTask2) {
      setTask2NativeWords(updater);
      setTask2TranslatedWords(updater);
    } else {
      setNativeWords(updater);
      setTranslatedWords(updater);
    }
  };

  // Check if all pairs are matched to move to next task
  useEffect(() => {
    if (gameState === 'task1' && nativeWords.length > 0 && nativeWords.every(w => w.matched)) {
      fetchTask2Words();
    }
  }, [nativeWords, gameState, fetchTask2Words]);

  // --- RESET GAME ---
  const resetGame = () => {
    setGameState('idle');
    setError(null);
    setSelection(null);
    setTask2Selection(null);
    setTimeLeft(GAME_DURATION_SECONDS);
    setScore(0);
    setTimerActive(false);
  };

  const TopBar = () => (
    <div className="w-full max-w-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl shadow-lg mb-8 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-semibold">
          <BrainCircuit className="w-5 h-5" />
          <span>Score: {score}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full font-semibold">
        <Clock className="w-5 h-5" />
        <span>{timeLeft}s</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (gameState) {
      case 'loading-task1':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-lg">Loading Task 1 words...</p>
          </div>
        );

      case 'task1':
        return (
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-center mb-1">Task 1: Match the Pairs</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              Click a word from each column to form a correct pair.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {nativeWords.map((item) => (
                  <motion.button
                    key={`native-${item.originalIndex}`}
                    onClick={() => handleSelect(item, 'native')}
                    disabled={item.matched}
                    className={`p-3 rounded-lg text-lg font-semibold transition-all duration-200
                      ${item.matched ? 'bg-green-200 dark:bg-green-800 text-gray-400 dark:text-gray-500 line-through' 
                        : item.selected ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  >
                    {item.word}
                  </motion.button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {translatedWords.map((item) => (
                  <motion.button
                    key={`translated-${item.originalIndex}`}
                    onClick={() => handleSelect(item, 'translated')}
                    disabled={item.matched}
                    className={`p-3 rounded-lg text-lg font-semibold transition-all duration-200
                      ${item.matched ? 'bg-green-200 dark:bg-green-800 text-gray-400 dark:text-gray-500 line-through' 
                        : item.selected ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  >
                    {item.word}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'loading-task2':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader className="w-12 h-12 animate-spin text-purple-500" />
            <p className="text-lg">Loading Task 2 words...</p>
          </div>
        );

      case 'task2':
        return (
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-center mb-1">Task 2: Match the Pairs</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              Click a word from each column to form a correct pair.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {task2NativeWords.map((item) => (
                  <motion.button
                    key={`task2-native-${item.originalIndex}`}
                    onClick={() => handleSelect(item, 'native', true)}
                    disabled={item.matched}
                    className={`p-3 rounded-lg text-lg font-semibold transition-all duration-200
                      ${item.matched ? 'bg-green-200 dark:bg-green-800 text-gray-400 dark:text-gray-500 line-through' 
                        : item.selected ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  >
                    {item.word}
                  </motion.button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {task2TranslatedWords.map((item) => (
                  <motion.button
                    key={`task2-translated-${item.originalIndex}`}
                    onClick={() => handleSelect(item, 'translated', true)}
                    disabled={item.matched}
                    className={`p-3 rounded-lg text-lg font-semibold transition-all duration-200
                      ${item.matched ? 'bg-green-200 dark:bg-green-800 text-gray-400 dark:text-gray-500 line-through' 
                        : item.selected ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  >
                    {item.word}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'results':
        const totalWords = nativeWords.length + task2NativeWords.length;
        const matchedWords = nativeWords.filter(w => w.matched).length + 
                           task2NativeWords.filter(w => w.matched).length;
        
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl"
          >
            <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">{timeLeft <= 0 ? "Time's Up!" : "Game Complete!"}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You matched {matchedWords}/{totalWords} word pairs!
            </p>
            <div className="flex justify-around items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Final Score</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{score}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Taken</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{GAME_DURATION_SECONDS - timeLeft}s</p>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Play Again
            </button>
          </motion.div>
        );

      default: // 'idle' state
        return (
          <div className="text-center max-w-lg">
            <BrainCircuit className="w-20 h-20 mx-auto text-blue-500 mb-4" />
            <h1 className="text-4xl font-extrabold mb-4">Word Matching Challenge</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Match word pairs across two rounds against the clock!
            </p>
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-3 rounded-lg mb-4 font-semibold">{error}</p>}
            <button
              onClick={startGame}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-transform transform hover:scale-105"
            >
              <Zap className="w-6 h-6" />
              Start Game
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
      {timerActive && <TopBar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={gameState}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full flex justify-center"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WordPuzzleGamePage;