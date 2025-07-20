import React, { useRef } from "react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Loader,
  RefreshCw,
  X,
  Check,
  BrainCircuit,
  Star,
  Zap,
  ChevronRight,
} from "lucide-react";

interface WordPair {
  native: string;
  translated: string;
  matched: boolean;
  originalIndex: number;
}

interface MatchingItem {
  word: string;
  type: "native" | "translated";
  originalIndex: number;
  matched: boolean;
  selected: boolean;
  incorrect?: boolean;
}

type GameState =
  | "idle"
  | "loading-task1"
  | "task1"
  | "loading-task2"
  | "task2"
  | "loading-task3"
  | "task3"
  | "results";

const GAME_DURATION_SECONDS = 180;

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const WordPuzzleGamePage = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [nativeWords, setNativeWords] = useState<MatchingItem[]>([]);
  const [translatedWords, setTranslatedWords] = useState<MatchingItem[]>([]);
  const [sentencePairs, setSentencePairs] = useState<WordPair[]>([]);
  const [shuffledSentences, setShuffledSentences] = useState<WordPair[]>([]);
  const [selection, setSelection] = useState<{
    item: MatchingItem;
    list: "native" | "translated";
  } | null>(null);
  const [sentenceSelection, setSentenceSelection] = useState<{
    item: MatchingItem;
    list: "native" | "translated";
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [currentTask, setCurrentTask] = useState<1 | 2 | 3>(1);
  const [task1Completed, setTask1Completed] = useState(false);
  const [task2Completed, setTask2Completed] = useState(false);
  const [task3Completed, setTask3Completed] = useState(false);
  //  const hasSubmittedRef = useRef(false);

  // useEffect(() => {
  //   // Only run this ONCE when gameState is "results" and score is positive
  //   if (
  //     gameState === "results" &&
  //     score > 0 &&
  //     !hasSubmittedRef.current
  //   ) {
  //     hasSubmittedRef.current = true; // ✅ Mark as submitted

  //     console.log("Calling API...");

  //     fetch("/api/game/wordgame/addpoint", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ pointsToAdd: score }),
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         console.log("Score submitted successfully:", data);
  //       })
  //       .catch((err) => {
  //         console.error("Error submitting score:", err);
  //       });
  //   }
  // }, [gameState, score]); // ✅ Safe to keep

  const fetchWordPairs = useCallback(async (taskNumber: 1 | 2) => {
    setGameState(`loading-task${taskNumber}` as GameState);
    setError(null);

    try {
      const response = await fetch("/api/game/wordgame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error(`Server responded with status: ${response.status}`);

      const responseText = await response.text();
      const lines = responseText.split("\n").filter((line) => line.trim());
      if (lines.length === 0)
        throw new Error(`No words received for Task ${taskNumber}`);

      const parsedWords = lines.map((line, index) => {
        const separator = line.includes(" - ") ? " - " : "-";
        const parts = line.split(separator).map((part) => part.trim());
        if (parts.length !== 2)
          throw new Error(`Invalid format in line: "${line}"`);

        return {
          native: parts[0],
          translated: parts[1],
          originalIndex: index,
        };
      });

      setNativeWords(
        parsedWords.map((w) => ({
          word: w.native,
          type: "native",
          originalIndex: w.originalIndex,
          matched: false,
          selected: false,
          incorrect: false,
        }))
      );

      setTranslatedWords(
        shuffleArray(parsedWords).map((w) => ({
          word: w.translated,
          type: "translated",
          originalIndex: w.originalIndex,
          matched: false,
          selected: false,
          incorrect: false,
        }))
      );

      setGameState(`task${taskNumber}` as GameState);
      if (taskNumber === 1) setTimerActive(true);
    } catch (err) {
      console.error(`Task ${taskNumber} API Error:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to load Task ${taskNumber} words`
      );
      setGameState("idle");
    }
  }, []);

  const fetchSentencePairs = useCallback(async () => {
    setGameState("loading-task3");
    setError(null);

    try {
      const response = await fetch("/api/game/makesentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error(`Server responded with status: ${response.status}`);

      const responseText = await response.text();
      const lines = responseText.split("\n").filter((line) => line.trim());
      if (lines.length === 0)
        throw new Error("No sentences received for Task 3");

      const parsedSentences = lines.map((line, index) => {
        const separator = line.includes(" - ") ? " - " : "-";
        const parts = line.split(separator).map((part) => part.trim());
        if (parts.length !== 2)
          throw new Error(`Invalid format in line: "${line}"`);

        return {
          native: parts[0],
          translated: parts[1],
          matched: false,
          originalIndex: index,
        };
      });

      setSentencePairs(parsedSentences);
      setShuffledSentences(shuffleArray([...parsedSentences]));
      setGameState("task3");
      setCurrentTask(3);
    } catch (err) {
      console.error("Task 3 API Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load Task 3 sentences"
      );
      setGameState("idle");
    }
  }, []);

  const startGame = () => {
    setCurrentTask(1);
    fetchWordPairs(1);
  };

  const startTask2 = () => {
    setTask1Completed(true);
    setCurrentTask(2);
    fetchWordPairs(2);
  };

  const startTask3 = () => {
    setTask2Completed(true);
    fetchSentencePairs();
  };

  const finishGame = () => {
    setTask3Completed(true);
    setGameState("results");
  };

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerActive(false);
        setGameState("results");
      }
      return;
    }
    const timerId = setInterval(
      () => setTimeLeft((prevTime) => prevTime - 1),
      1000
    );
    return () => clearInterval(timerId);
  }, [timerActive, timeLeft]);

  const handleWordSelect = (
    item: MatchingItem,
    list: "native" | "translated"
  ) => {
    if (item.matched) return;

    if (!selection) {
      setSelection({ item, list });
      updateWordSelectionState(item, list, true);
      return;
    }

    if (
      selection.item.originalIndex === item.originalIndex &&
      selection.list === list
    ) {
      setSelection(null);
      updateWordSelectionState(item, list, false);
      return;
    }

    if (selection.list === list) {
      updateWordSelectionState(selection.item, selection.list, false);
      setSelection({ item, list });
      updateWordSelectionState(item, list, true);
      return;
    }

    if (selection.item.originalIndex === item.originalIndex) {
      setScore((s) => s + 10);
      updateWordMatchState(item.originalIndex, false);
    } else {
      setScore((s) => Math.max(0, s - 2));
      updateWordMatchState(selection.item.originalIndex, true);
      updateWordMatchState(item.originalIndex, true);
    }

    setTimeout(() => {
      if (selection)
        updateWordSelectionState(selection.item, selection.list, false);
      updateWordSelectionState(item, list, false);
      setSelection(null);
    }, 300);
  };

  const updateWordSelectionState = (
    item: MatchingItem,
    list: "native" | "translated",
    selected: boolean
  ) => {
    const updater = (prevList: MatchingItem[]) =>
      prevList.map((i) =>
        i.originalIndex === item.originalIndex ? { ...i, selected } : i
      );
    if (list === "native") setNativeWords(updater);
    else setTranslatedWords(updater);
  };

  const updateWordMatchState = (
    originalIndex: number,
    isIncorrect: boolean
  ) => {
    const updater = (prevList: MatchingItem[]) =>
      prevList.map((i) =>
        i.originalIndex === originalIndex
          ? {
              ...i,
              matched: !isIncorrect,
              selected: false,
              incorrect: isIncorrect,
            }
          : i
      );
    setNativeWords(updater);
    setTranslatedWords(updater);
  };

  const handleSentenceSelect = (sentence: WordPair, isNative: boolean) => {
    if (sentence.matched) return;

    const currentSelection = {
      item: {
        word: isNative ? sentence.native : sentence.translated,
        type: isNative ? "native" : "translated",
        originalIndex: sentence.originalIndex,
        matched: false,
        selected: true,
        incorrect: false,
      },
      list: isNative ? "native" : "translated",
    };

    if (!sentenceSelection) {
      setSentenceSelection(currentSelection);
      return;
    }

    if (
      sentenceSelection.list === currentSelection.list &&
      sentenceSelection.item.originalIndex ===
        currentSelection.item.originalIndex
    ) {
      setSentenceSelection(null);
      return;
    }

    if (sentenceSelection.list !== currentSelection.list) {
      if (
        sentenceSelection.item.originalIndex ===
        currentSelection.item.originalIndex
      ) {
        setScore((s) => s + 15);
        setSentencePairs((prev) =>
          prev.map((s) =>
            s.originalIndex === sentence.originalIndex
              ? { ...s, matched: true }
              : s
          )
        );
        setShuffledSentences((prev) =>
          prev.map((s) =>
            s.originalIndex === sentence.originalIndex
              ? { ...s, matched: true }
              : s
          )
        );
      } else {
        setScore((s) => Math.max(0, s - 3));
        setSentenceSelection({
          ...sentenceSelection,
          item: { ...sentenceSelection.item, incorrect: true },
        });
        setTimeout(() => {
          setSentenceSelection({
            ...currentSelection,
            item: { ...currentSelection.item, incorrect: true },
          });
        }, 0);
      }

      setTimeout(() => {
        setSentenceSelection(null);
      }, 500);
    } else {
      setSentenceSelection(currentSelection);
    }
  };

  const resetGame = () => {
    setGameState("idle");
    setError(null);
    setSelection(null);
    setSentenceSelection(null);
    setTimeLeft(GAME_DURATION_SECONDS);
    setScore(0);
    setTimerActive(false);
    setCurrentTask(1);
    setTask1Completed(false);
    setTask2Completed(false);
    setTask3Completed(false);
  };

  const TopBar = () => (
    <div className="w-full max-w-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl shadow-lg mb-8 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-semibold">
          <BrainCircuit className="w-5 h-5" />
          <span>Score: {score}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full font-semibold">
          <span>Task: {currentTask}/3</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full font-semibold">
        <Clock className="w-5 h-5" />
        <span>{timeLeft}s</span>
      </div>
    </div>
  );

  const TaskCompleteCard = ({
    onContinue,
    taskNumber,
  }: {
    onContinue: () => void;
    taskNumber: 1 | 2 | 3;
  }) => (
    <motion.div
      className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col items-center">
        <Check className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Task {taskNumber} Complete!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {taskNumber === 1
            ? "Great job! Now proceed to the second word matching task."
            : taskNumber === 2
            ? "Excellent! Now try the sentence matching challenge."
            : "Amazing! You completed all tasks!"}
        </p>
        <div className="w-full bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Time Remaining:</span>
            <span className="font-bold">{timeLeft}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Current Score:</span>
            <span className="font-bold">{score} points</span>
          </div>
        </div>
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {taskNumber === 1
            ? "Continue to Task 2"
            : taskNumber === 2
            ? "Continue to Task 3"
            : "View Results"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (gameState) {
      case "loading-task1":
      case "loading-task2":
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-lg">Loading Word Pairs...</p>
          </div>
        );

      case "task1":
      case "task2":
        return (
          <div className="w-full max-w-2xl">
            <TopBar />
            <h2 className="text-2xl font-bold text-center mb-1">
              Task {currentTask}: Match Word Pairs
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              Click a word from each column to form a correct translation pair.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {nativeWords.map((item) => (
                  <motion.button
                    key={`native-${item.originalIndex}`}
                    onClick={() => handleWordSelect(item, "native")}
                    disabled={item.matched}
                    className={`p-3 rounded-lg text-lg font-semibold transition-all duration-200
                      ${
                        item.matched
                          ? "bg-green-200 dark:bg-green-800 text-gray-400 dark:text-gray-500 line-through"
                          : item.incorrect
                          ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                          : item.selected
                          ? "bg-blue-500 text-white ring-2 ring-blue-300"
                          : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                  >
                    {item.word}
                  </motion.button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {translatedWords.map((item) => (
                  <motion.button
                    key={`translated-${item.originalIndex}`}
                    onClick={() => handleWordSelect(item, "translated")}
                    disabled={item.matched}
                    className={`p-3 rounded-lg text-lg font-semibold transition-all duration-200
                      ${
                        item.matched
                          ? "bg-green-200 dark:bg-green-800 text-gray-400 dark:text-gray-500 line-through"
                          : item.incorrect
                          ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                          : item.selected
                          ? "bg-blue-500 text-white ring-2 ring-blue-300"
                          : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                  >
                    {item.word}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={currentTask === 1 ? startTask2 : startTask3}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case "loading-task3":
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader className="w-12 h-12 animate-spin text-purple-500" />
            <p className="text-lg">Loading Sentence Pairs...</p>
          </div>
        );

      case "task3":
        return (
          <div className="w-full max-w-2xl">
            <TopBar />
            <h2 className="text-2xl font-bold text-center mb-1">
              Task 3: Match Sentence Pairs
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              Click a sentence from each column to match them together.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {sentencePairs.map((sentence) => (
                  <motion.button
                    key={`sentence-native-${sentence.originalIndex}`}
                    onClick={() => handleSentenceSelect(sentence, true)}
                    disabled={sentence.matched}
                    className={`p-3 rounded-lg text-lg font-semibold transition-all duration-200
                      ${
                        sentence.matched
                          ? "bg-green-200 dark:bg-green-800 text-gray-400 dark:text-gray-500 line-through"
                          : sentenceSelection?.item.originalIndex ===
                              sentence.originalIndex &&
                            sentenceSelection?.list === "native" &&
                            sentenceSelection.item.incorrect
                          ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                          : sentenceSelection?.item.originalIndex ===
                              sentence.originalIndex &&
                            sentenceSelection?.list === "native"
                          ? "bg-blue-500 text-white ring-2 ring-blue-300"
                          : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                  >
                    {sentence.native}
                  </motion.button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {shuffledSentences.map((sentence) => (
                  <motion.button
                    key={`sentence-translated-${sentence.originalIndex}`}
                    onClick={() => handleSentenceSelect(sentence, false)}
                    disabled={sentence.matched}
                    className={`p-3 rounded-lg text-lg font-semibold transition-all duration-200
                      ${
                        sentence.matched
                          ? "bg-green-200 dark:bg-green-800 text-gray-400 dark:text-gray-500 line-through"
                          : sentenceSelection?.item.originalIndex ===
                              sentence.originalIndex &&
                            sentenceSelection?.list === "translated" &&
                            sentenceSelection.item.incorrect
                          ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                          : sentenceSelection?.item.originalIndex ===
                              sentence.originalIndex &&
                            sentenceSelection?.list === "translated"
                          ? "bg-blue-500 text-white ring-2 ring-blue-300"
                          : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                  >
                    {sentence.translated}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={finishGame}
                disabled={!sentencePairs.every((s) => s.matched)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finish Game
              </button>
            </div>
          </div>
        );

      case "results":
        const totalPairs = nativeWords.length * 2 + sentencePairs.length;
        const matchedPairs =
          nativeWords.filter((w) => w.matched).length * 2 +
          sentencePairs.filter((s) => s.matched).length;
        fetch("/api/game/wordgame/addpoint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pointToAdd: score }),
        });

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full"
          >
            <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">
              {timeLeft <= 0 ? "Time's Up!" : "Game Complete!"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You completed {matchedPairs}/{totalPairs} matches!
            </p>
            <div className="flex justify-around items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Final Score
                </p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {score}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Time Taken
                </p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {GAME_DURATION_SECONDS - timeLeft}s
                </p>
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
            <h1 className="text-4xl font-extrabold mb-4">Language Challenge</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Complete three rounds: two word matching tasks and one sentence
              matching task!
            </p>
            {error && (
              <p className="text-red-500 bg-red-100 dark:bg-red-900 p-3 rounded-lg mb-4 font-semibold">
                {error}
              </p>
            )}
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
      <AnimatePresence mode="wait">
        {gameState === "task1" && task1Completed ? (
          <TaskCompleteCard onContinue={startTask2} taskNumber={1} />
        ) : gameState === "task2" && task2Completed ? (
          <TaskCompleteCard onContinue={startTask3} taskNumber={2} />
        ) : gameState === "task3" && task3Completed ? (
          <TaskCompleteCard
            onContinue={() => setGameState("results")}
            taskNumber={3}
          />
        ) : (
          <motion.div
            key={gameState}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-full flex justify-center"
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordPuzzleGamePage;
