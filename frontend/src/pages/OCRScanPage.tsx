import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLineIcon, UploadIcon, CameraIcon, StarIcon, BookmarkIcon, PlusIcon, XIcon, VolumeIcon } from 'lucide-react';
import Button from '../components/Button';
interface ScannedItem {
  id: string;
  imageUrl: string;
  text: string;
  translation: string;
  timestamp: Date;
  saved: boolean;
}
interface VocabularyItem {
  word: string;
  translation: string;
  saved: boolean;
}
const OCRScanPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([{
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    text: 'El restaurante está abierto todos los días de 8 de la mañana a 10 de la noche.',
    translation: 'The restaurant is open every day from 8 in the morning to 10 at night.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    saved: true
  }, {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1551029506-0807df4e2031?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    text: 'Por favor, no pisar el césped. Gracias por su cooperación.',
    translation: 'Please do not step on the grass. Thank you for your cooperation.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    saved: false
  }]);
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([{
    word: 'restaurante',
    translation: 'restaurant',
    saved: true
  }, {
    word: 'abierto',
    translation: 'open',
    saved: true
  }, {
    word: 'días',
    translation: 'days',
    saved: false
  }, {
    word: 'mañana',
    translation: 'morning',
    saved: true
  }, {
    word: 'noche',
    translation: 'night',
    saved: false
  }, {
    word: 'césped',
    translation: 'grass',
    saved: true
  }, {
    word: 'cooperación',
    translation: 'cooperation',
    saved: false
  }]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      simulateScan(file);
    }
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const simulateScan = (file: File) => {
    setIsScanning(true);
    // Simulate OCR processing delay
    setTimeout(() => {
      const mockTexts = ['Necesito practicar mi español todos los días para mejorar.', 'La biblioteca está cerrada los domingos y los días festivos.', 'Me gustaría reservar una mesa para dos personas esta noche.'];
      const mockTranslations = ['I need to practice my Spanish every day to improve.', 'The library is closed on Sundays and holidays.', 'I would like to reserve a table for two people tonight.'];
      const randomIndex = Math.floor(Math.random() * mockTexts.length);
      const newScannedItem: ScannedItem = {
        id: Date.now().toString(),
        imageUrl: previewUrl || '',
        text: mockTexts[randomIndex],
        translation: mockTranslations[randomIndex],
        timestamp: new Date(),
        saved: false
      };
      setScannedItems(prev => [newScannedItem, ...prev]);
      setIsScanning(false);
      setPreviewUrl(null);
      setSelectedImage(null);
      // Extract vocabulary
      const words = mockTexts[randomIndex].split(/\s+/);
      const newVocabItems: VocabularyItem[] = words.filter(word => word.length > 3).slice(0, 3).map(word => ({
        word: word.replace(/[.,;:!?]/g, '').toLowerCase(),
        translation: getRandomTranslation(word),
        saved: false
      }));
      setVocabularyItems(prev => [...newVocabItems, ...prev]);
    }, 2000);
  };
  const getRandomTranslation = (word: string) => {
    const translations = {
      necesito: 'I need',
      practicar: 'to practice',
      español: 'Spanish',
      todos: 'all',
      días: 'days',
      para: 'for',
      mejorar: 'to improve',
      biblioteca: 'library',
      cerrada: 'closed',
      domingos: 'Sundays',
      festivos: 'holidays',
      gustaría: 'would like',
      reservar: 'to reserve',
      mesa: 'table',
      personas: 'people',
      noche: 'night'
    };
    const cleanWord = word.replace(/[.,;:!?]/g, '').toLowerCase();
    return translations[cleanWord as keyof typeof translations] || 'unknown';
  };
  const toggleSaveItem = (id: string) => {
    setScannedItems(prev => prev.map(item => item.id === id ? {
      ...item,
      saved: !item.saved
    } : item));
  };
  const toggleSaveVocabulary = (word: string) => {
    setVocabularyItems(prev => prev.map(item => item.word === word ? {
      ...item,
      saved: !item.saved
    } : item));
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const playAudio = (text: string) => {
    // In a real app, this would use the Web Speech API or a TTS service
    console.log(`Playing audio for: ${text}`);
  };
  return <div className="min-h-screen pt-16 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">Scan & Learn</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Scan text in Spanish to get instant translations and add words to
              your vocabulary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleUploadClick} icon={<UploadIcon className="w-5 h-5" />}>
                Upload Image
              </Button>
              <Button onClick={() => setShowCamera(true)} variant="secondary" icon={<CameraIcon className="w-5 h-5" />}>
                Take Photo
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          </div>
          {/* Preview and Scanning */}
          <AnimatePresence>
            {previewUrl && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="font-semibold">Image Preview</h2>
                  <button onClick={() => {
                setPreviewUrl(null);
                setSelectedImage(null);
              }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
                  {isScanning && <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                      <ScanLineIcon className="w-10 h-10 text-white animate-pulse mb-2" />
                      <p className="text-white">Scanning text...</p>
                    </div>}
                </div>
              </motion.div>}
          </AnimatePresence>
          {/* Scanned Items */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {scannedItems.map(item => <motion.div key={item.id} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -20
              }} transition={{
                duration: 0.3
              }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-48 md:h-auto">
                        <img src={item.imageUrl} alt="Scanned text" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(item.timestamp)}
                          </span>
                          <button onClick={() => toggleSaveItem(item.id)} className={`p-1.5 rounded-full ${item.saved ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                            <BookmarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">
                              Original Text (Spanish)
                            </h3>
                            <button onClick={() => playAudio(item.text)} className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full">
                              <VolumeIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200">
                            {item.text}
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">
                              Translation (English)
                            </h3>
                            <div className="flex items-center">
                              <div className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1" />
                            </div>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200">
                            {item.translation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>)}
              </AnimatePresence>
            </div>
          </div>
          {/* Vocabulary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-20">
            <h2 className="text-xl font-semibold mb-4">Vocabulary List</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-400">
                      Word
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-400">
                      Translation
                    </th>
                    <th className="py-3 px-4 text-center font-medium text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vocabularyItems.map((item, index) => <motion.tr key={index} initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} transition={{
                  duration: 0.2,
                  delay: index * 0.05
                }} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium">{item.word}</span>
                          <button onClick={() => playAudio(item.word)} className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full">
                            <VolumeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {item.translation}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <button onClick={() => toggleSaveVocabulary(item.word)} className={`p-1.5 rounded-full ${item.saved ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                            <StarIcon className="w-5 h-5" fill={item.saved ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <motion.div initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.9,
          opacity: 0
        }} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold">Take a Photo</h2>
                <button onClick={() => setShowCamera(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <CameraIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Camera preview would appear here</p>
                  <p className="text-sm text-gray-400 mt-2">
                    (Camera access not implemented in this demo)
                  </p>
                </div>
              </div>
              <div className="p-4 flex justify-center">
                <Button onClick={() => setShowCamera(false)} variant="primary" icon={<CameraIcon className="w-5 h-5" />}>
                  Capture Photo
                </Button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
      {/* Floating scan button for mobile */}
      <motion.button className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center" whileHover={{
      scale: 1.1
    }} whileTap={{
      scale: 0.9
    }} onClick={handleUploadClick}>
        <ScanLineIcon className="w-6 h-6" />
      </motion.button>
    </div>;
};
export default OCRScanPage;