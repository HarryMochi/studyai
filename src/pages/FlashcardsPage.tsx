import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Plus, 
  Shuffle, 
  Download, 
  Check, 
  X,
  Edit2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout/Layout';
import { useStudyStore, Flashcard, FlashcardSet } from '@/stores/studyStore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock AI flashcard generation
const generateFlashcards = async (topic: string): Promise<Flashcard[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const sampleCards: Flashcard[] = [
    { id: '1', question: `What is the main concept of ${topic}?`, answer: `${topic} is a fundamental concept that encompasses various principles and applications in its field.`, known: false },
    { id: '2', question: `Why is ${topic} important?`, answer: `${topic} is crucial because it forms the foundation for understanding more complex ideas and has practical applications.`, known: false },
    { id: '3', question: `What are the key components of ${topic}?`, answer: `The key components include core principles, supporting elements, and interconnected systems that work together.`, known: false },
    { id: '4', question: `How does ${topic} relate to other concepts?`, answer: `${topic} connects to various other concepts through shared principles and complementary functions.`, known: false },
    { id: '5', question: `What are common applications of ${topic}?`, answer: `Common applications include practical implementations in real-world scenarios, research, and development.`, known: false },
  ];
  
  return sampleCards;
};

interface FlashcardComponentProps {
  card: Flashcard;
  onKnow: () => void;
  onDontKnow: () => void;
  reducedMotion: boolean;
}

function FlashcardComponent({ card, onKnow, onDontKnow, reducedMotion }: FlashcardComponentProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 w-full max-w-lg mx-auto">
      <motion.div
        className="relative w-full h-64 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
        role="button"
        aria-label={isFlipped ? 'Click to see question' : 'Click to see answer'}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <Card 
          variant="elevated" 
          className="absolute inset-0 flex items-center justify-center p-6 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-muted-foreground mb-4 block">Question</span>
            <p className="text-lg font-medium">{card.question}</p>
            <p className="mt-4 text-sm text-muted-foreground">Click to flip</p>
          </div>
        </Card>

        {/* Back */}
        <Card 
          variant="elevated" 
          className="absolute inset-0 flex items-center justify-center p-6 backface-hidden bg-gradient-to-br from-primary/5 to-secondary/5"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-muted-foreground mb-4 block">Answer</span>
            <p className="text-lg">{card.answer}</p>
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={(e) => { e.stopPropagation(); onDontKnow(); setIsFlipped(false); }}
          className="gap-2"
        >
          <X className="h-4 w-4 text-destructive" aria-hidden="true" />
          Don't Know
        </Button>
        <Button 
          variant="success" 
          onClick={(e) => { e.stopPropagation(); onKnow(); setIsFlipped(false); }}
          className="gap-2"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Know It
        </Button>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  
  const { 
    flashcardSets, 
    addFlashcardSet, 
    updateFlashcard, 
    addStudyTime, 
    unlockBadge,
    reducedMotion 
  } = useStudyStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (topic.trim().length < 3) {
      toast({
        title: 'Error',
        description: 'Please enter a topic (at least 3 characters)',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const cards = await generateFlashcards(topic);
      setCurrentCards(cards);
      setCurrentIndex(0);
      addStudyTime(3);
      
      if (flashcardSets.length === 0) {
        unlockBadge('first-flashcards');
        toast({
          title: '🎴 Badge Unlocked!',
          description: 'You earned the "Card Creator" badge!',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate flashcards. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSet = () => {
    if (currentCards.length === 0) return;
    
    const newSet: FlashcardSet = {
      id: Date.now().toString(),
      name: topic,
      cards: currentCards,
      createdAt: new Date(),
    };
    
    addFlashcardSet(newSet);
    toast({
      title: 'Saved!',
      description: 'Flashcard set saved to your library.',
    });
  };

  const handleShuffle = () => {
    const shuffled = [...currentCards].sort(() => Math.random() - 0.5);
    setCurrentCards(shuffled);
    setCurrentIndex(0);
  };

  const handleAddCard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    
    const newCard: Flashcard = {
      id: Date.now().toString(),
      question: newQuestion,
      answer: newAnswer,
      known: false,
    };
    
    setCurrentCards([...currentCards, newCard]);
    setNewQuestion('');
    setNewAnswer('');
    setShowNewCardDialog(false);
    
    toast({
      title: 'Card Added',
      description: 'New flashcard added to the set.',
    });
  };

  const handleExport = (format: 'csv' | 'tsv') => {
    if (currentCards.length === 0) return;
    
    const separator = format === 'csv' ? ',' : '\t';
    const content = currentCards.map(c => `"${c.question}"${separator}"${c.answer}"`).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${topic}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Exported!',
      description: `Flashcards exported as ${format.toUpperCase()}.`,
    });
  };

  const handleKnow = () => {
    const updatedCards = [...currentCards];
    updatedCards[currentIndex] = { ...updatedCards[currentIndex], known: true };
    setCurrentCards(updatedCards);
    
    if (currentIndex < currentCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDontKnow = () => {
    if (currentIndex < currentCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const knownCount = currentCards.filter(c => c.known).length;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/70">
              <Layers className="h-7 w-7 text-secondary-foreground" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Flashcards</h1>
            <p className="text-muted-foreground">
              Generate and study flashcards on any topic
            </p>
          </div>

          {/* Input Section */}
          {currentCards.length === 0 && (
            <Card variant="default" className="max-w-xl mx-auto mb-8">
              <CardHeader>
                <CardTitle>Generate Flashcards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter a topic (e.g., Photosynthesis, World War II)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  aria-label="Topic for flashcards"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || topic.trim().length < 3}
                  variant="hero"
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Flashcard Study Area */}
          {currentCards.length > 0 && (
            <div className="max-w-2xl mx-auto">
              {/* Progress */}
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Card {currentIndex + 1} of {currentCards.length}
                </span>
                <span className="text-sm font-medium text-success">
                  {knownCount} / {currentCards.length} known
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-8 h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(knownCount / currentCards.length) * 100}%` }}
                />
              </div>

              {/* Current Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3 }}
                >
                  <FlashcardComponent
                    card={currentCards[currentIndex]}
                    onKnow={handleKnow}
                    onDontKnow={handleDontKnow}
                    reducedMotion={reducedMotion}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(Math.min(currentCards.length - 1, currentIndex + 1))}
                  disabled={currentIndex === currentCards.length - 1}
                >
                  Next
                </Button>
                <Button variant="outline" onClick={handleShuffle}>
                  <Shuffle className="h-4 w-4 mr-2" aria-hidden="true" />
                  Shuffle
                </Button>
                <Button variant="outline" onClick={() => { setCurrentIndex(0); setCurrentCards(currentCards.map(c => ({ ...c, known: false }))); }}>
                  <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Reset
                </Button>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                      Add Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Flashcard</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Question</label>
                        <Textarea
                          placeholder="Enter the question..."
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Answer</label>
                        <Textarea
                          placeholder="Enter the answer..."
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddCard} className="w-full">
                        Add Card
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('tsv')}>
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Anki TSV
                </Button>
                <Button variant="success" onClick={handleSaveSet}>
                  Save Set
                </Button>
              </div>

              {/* Start Over */}
              <div className="mt-8 text-center">
                <Button
                  variant="ghost"
                  onClick={() => { setCurrentCards([]); setTopic(''); }}
                >
                  Start with new topic
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
