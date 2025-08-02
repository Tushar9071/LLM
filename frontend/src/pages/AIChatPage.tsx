import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SendIcon,
  MicIcon,
  PauseIcon,
  VolumeIcon,
  HistoryIcon,
  XIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import XPProgress from "../components/XPProgress";
import StreakCounter from "../components/StreakCounter";

interface SpeechRecognition extends EventTarget {
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface Window {
  SpeechRecognition: {
    new (): SpeechRecognition;
  };
  webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  translated?: string;
}
declare var window: Window;

interface ChatSession {
  id: string;
  title: string;
  lastActive: Date;
  messages: Message[];
}

const AIChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [language, setLanguage] = useState("en");
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [inactivityTimeout, setInactivityTimeout] = useState<NodeJS.Timeout | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    // Speech Synthesis
    if ("speechSynthesis" in window) {
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
      speechSynthesisRef.current.lang = language;
    }

    // Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognitionRef.continuous = false;
      recognitionRef.interimResults = true;
      recognitionRef.lang = language;
  // recognitionRef.current.continuous = true; // Keep listening until stopped
recognition.onresult = (event: SpeechRecognitionEvent) => {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }

  const transcript = Array.from(event.results)
    .map((result) => result[0].transcript)
    .join("");
  setInput(transcript);

  // Change this timeout value from 2000 to 3000 (3 seconds) or higher
 setInactivityTimeout(
  setTimeout(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log("Speech recognition stopped");
      if (input.trim()) {
        handleSendMessage(); // Directly call your message handler
      }
    }
  }, 3500)
);
};

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = "Speech recognition failed";
        switch (event.error) {
          case "no-speech":
            errorMessage = "No speech detected. Please try again.";
            break;
          case "audio-capture":
            errorMessage = "Microphone access denied. Please allow microphone permissions.";
            break;
          case "not-allowed":
            errorMessage = "Microphone access not allowed. Check browser settings.";
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        setRecognitionError(errorMessage);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (input.trim()) {
          handleSendMessage();
        }
      };
    } else {
      setRecognitionError("Speech recognition not supported in this browser. Please use Chrome.");
    }

    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
    };
  }, [language, input]);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      try {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9;
        
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
        };
        
        setIsSpeaking(true);
        speechSynthesis.speak(utterance);
        
        utterance.onend = () => {
          setIsSpeaking(false);
        };
      } catch (err) {
        console.error("Speech synthesis failed:", err);
      }
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      setRecognitionError("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setRecognitionError(null);
      setInput("");
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setRecognitionError("Microphone access denied. Please allow microphone permissions.");
      setIsRecording(false);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let aiMessageId: string;

    try {
      const response = await fetch("/api/ai/aichat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }
      aiMessageId = Date.now().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          content: "",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let aiContent = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });

        aiContent += chunkValue;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: aiContent } : msg
          )
        );
      }

      // Speak the AI response automatically
      if (aiContent.trim()) {
        speakText(aiContent);
      }
    } catch (err) {
      console.error("Error streaming message:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: "Error: could not fetch AI response" }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const simulateKeyPress = (key, element = document.activeElement) => {
  const event = new KeyboardEvent('keydown', { key });
  element?.dispatchEvent(event);
};

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  const chatSessions: ChatSession[] = [
    {
      id: "1",
      title: "Spanish Basics",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      messages: [],
    },
    {
      id: "2",
      title: "Travel Vocabulary",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      messages: [],
    },
    {
      id: "3",
      title: "Restaurant Phrases",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      messages: [],
    },
  ];

  return (
    <div className="min-h-screen pt-16 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with XP progress and streak */}
          <motion.div
            className="sticky top-16 z-10 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <XPProgress
                  currentXP={user?.xp || 0}
                  levelXP={1000}
                  level={user?.level || 1}
                />
              </div>
              <StreakCounter streak={user?.streak || 0} />
            </div>

            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Today's Goal:</span> 50 XP (30 XP to go)
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Target Language:</span>{" "}
              <label htmlFor="languageSelect" className="sr-only">Select Language</label>
            <select
            id="languageSelect"
            defaultValue = {language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-none focus:outline-none"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="zh-CN">Mandarin</option>
          </select>

              </div>
            </div>
          </motion.div>

          {/* Chat container with history sidebar */}
          <div className="relative flex">
            {/* Chat History Sidebar */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, x: -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute md:relative z-20 w-full md:w-64 h-[calc(100vh-350px)] bg-white dark:bg-gray-800 rounded-lg shadow-lg md:mr-4 overflow-y-auto"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 flex justify-between items-center">
                    <h3 className="font-semibold">Chat History</h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium text-left flex items-center"
                    >
                      <SparklesIcon className="w-4 h-4 mr-2" />+ New Conversation
                    </motion.button>
                    {chatSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(59, 130, 246, 0.05)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <h4 className="font-medium truncate">{session.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(session.lastActive)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <motion.div
              className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-blue-800 dark:text-blue-300">
                    Language Conversation Practice
                  </h2>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Chat with your AI language tutor
                  </p>
                </div>
                <motion.button
                  onClick={() => setShowHistory(!showHistory)}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                >
                  <HistoryIcon className="w-5 h-5" />
                </motion.button>
              </div>

              <div
                className="h-[calc(100vh-350px)] overflow-y-auto p-4 scroll-smooth"
                ref={chatContainerRef}
              >
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.4,
                      }}
                      className={`flex mb-4 ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.sender === "ai" && (
                        <motion.div
                          className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            delay: 0.1,
                          }}
                        >
                          <span className="text-sm font-semibold">AI</span>
                        </motion.div>
                      )}

                      <motion.div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                        whileHover={{ y: -2 }}
                      >
                        <div className="mb-1">{message.content}</div>

                        {message.sender === "ai" && message.translated && (
                          <AnimatePresence mode="wait">
                            {showTranslation && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                              >
                                {message.translated}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}

                        <div
                          className={`text-xs flex justify-between items-center mt-1 ${
                            message.sender === "user"
                              ? "text-blue-200"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <span>{formatTime(message.timestamp)}</span>
                          {message.sender === "ai" && (
                            <div className="flex space-x-1">
                              {message.translated && (
                                <motion.button
                                  onClick={() => setShowTranslation(!showTranslation)}
                                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  {showTranslation ? (
                                    <ArrowLeftIcon className="w-3 h-3" />
                                  ) : (
                                    <ArrowRightIcon className="w-3 h-3" />
                                  )}
                                </motion.button>
                              )}
                              <motion.button
                                onClick={() =>
                                  isSpeaking ? stopSpeaking() : speakText(message.content)
                                }
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.8 }}
                              >
                                {isSpeaking ? (
                                  <PauseIcon className="w-3 h-3" />
                                ) : (
                                  <VolumeIcon className="w-3 h-3" />
                                )}
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>

                      {message.sender === "user" && (
                        <motion.div
                          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white ml-2 flex-shrink-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            delay: 0.1,
                          }}
                        >
                          <span className="text-sm font-semibold">
                            {user?.name?.charAt(0) || "U"}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start mb-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0">
                        <span className="text-sm font-semibold">AI</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                        <div className="flex space-x-2">
                          <motion.div
                            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6,
                              delay: 0,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6,
                              delay: 0.15,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6,
                              delay: 0.3,
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {recognitionError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md text-sm"
                  >
                    {recognitionError}
                  </motion.div>
                )}
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm flex items-center"
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-600 mr-2"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    Listening... Speak now
                  </motion.div>
                )}
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md text-sm flex items-center"
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-600 mr-2"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    AI is speaking
                    <button 
                      onClick={stopSpeaking}
                      className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded flex items-center"
                    >
                      <PauseIcon className="w-3 h-3 mr-1" />
                      Stop
                    </button>
                  </motion.div>
                )}
                <div className="flex items-end">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Type or speak in ${
                      language === "es-ES"
                        ? "Spanish"
                        : language === "en-US"
                        ? "English"
                        : language === "fr-FR"
                        ? "French"
                        : language === "de-DE"
                        ? "German"
                        : "Mandarin"
                    }...`}
                    className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white transition-all duration-300"
                    rows={2}
                    disabled={isLoading}
                  />
                  <div className="flex ml-3 space-x-2">
                    <motion.button
                      onClick={toggleRecording}
                      className={`p-3 rounded-full ${
                        isRecording
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                      disabled={isLoading || !recognitionRef.current}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isRecording ? (
                        <PauseIcon className="w-5 h-5" />
                      ) : (
                        <MicIcon className="w-5 h-5" />
                      )}
                    </motion.button>
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={input.trim() === "" || isLoading}
                      className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full disabled:opacity-50"
                      whileHover={{
                        scale: 1.1,
                        boxShadow: "0px 5px 15px rgba(37, 99, 235, 0.3)",
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SendIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Suggestions */}
          <div className="mb-20">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Suggested responses:
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                language === "es-ES"
                  ? "¿Cómo se dice ... en español?"
                  : "How do you say ... in English?",
                language === "es-ES"
                  ? "Puedes explicar la diferencia entre ser y estar?"
                  : "Can you explain the difference between 'to be' verbs?",
                language === "es-ES"
                  ? "Cuéntame sobre las tradiciones españolas."
                  : "Tell me about cultural traditions.",
                language === "es-ES"
                  ? "Vamos a practicar los tiempos verbales."
                  : "Let's practice verb tenses.",
              ].map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  onClick={() => setInput(suggestion)}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating mic button for mobile */}
      <motion.button
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg flex items-center justify-center"
        whileHover={{
          scale: 1.1,
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
        }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleRecording}
        disabled={!recognitionRef.current}
      >
        {isRecording ? (
          <PauseIcon className="w-6 h-6" />
        ) : (
          <MicIcon className="w-6 h-6" />
        )}
      </motion.button>

      {/* Translation toggle button */}
      <motion.button
        className="fixed bottom-24 left-6 bg-white dark:bg-gray-800 w-auto h-10 rounded-full shadow-lg flex items-center justify-center px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowTranslation(!showTranslation)}
      >
        {showTranslation ? "Hide Translation" : "Show Translation"}
      </motion.button>
    </div>
  );
};

export default AIChatPage;