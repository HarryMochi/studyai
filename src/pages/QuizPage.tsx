import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Clock, 
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  Play,
  Timer,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { Progress } from '@/components/ui/progress';
import { useStudyStore, QuizQuestion, QuizResult } from '@/stores/studyStore';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

// Mock AI quiz generation
const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return [
    {
      id: '1',
      question: `What is the primary characteristic of ${topic}?`,
      options: ['Option A: Fundamental principle', 'Option B: Secondary feature', 'Option C: Tertiary aspect', 'Option D: Unrelated concept'],
      correctAnswer: 0,
      explanation: `The fundamental principle is the primary characteristic because it forms the core foundation of ${topic}.`,
    },
    {
      id: '2',
      question: `Which of the following best describes ${topic}?`,
      options: ['A complex system', 'A simple mechanism', 'An abstract concept', 'A physical entity'],
      correctAnswer: 0,
      explanation: `${topic} is best described as a complex system due to its interconnected components.`,
    },
    {
      id: '3',
      question: `When was ${topic} first introduced?`,
      options: ['19th century', '20th century', 'Ancient times', 'Recently'],
      correctAnswer: 1,
      explanation: `${topic} emerged in the 20th century as part of modern developments in the field.`,
    },
    {
      id: '4',
      question: `What is NOT a benefit of understanding ${topic}?`,
      options: ['Better comprehension', 'Improved skills', 'Enhanced confusion', 'Greater insight'],
      correctAnswer: 2,
      explanation: 'Enhanced confusion is not a benefit - understanding reduces confusion.',
    },
    {
      id: '5',
      question: `Who are the main contributors to ${topic}?`,
      options: ['Scientists', 'Artists', 'Politicians', 'Athletes'],
      correctAnswer: 0,
      explanation: 'Scientists have been the primary contributors to developing this field.',
    },
    {
      id: '6',
      question: `How does ${topic} impact daily life?`,
      options: ['Through technology', 'No impact', 'Only in labs', 'Rarely'],
      correctAnswer: 0,
      explanation: `${topic} impacts daily life through various technological applications.`,
    },
    {
      id: '7',
      question: `What is required to master ${topic}?`,
      options: ['Practice and study', 'Natural talent only', 'No effort', 'Luck'],
      correctAnswer: 0,
      explanation: 'Mastering any topic requires consistent practice and dedicated study.',
    },
    {
      id: '8',
      question: `Which field is ${topic} most closely related to?`,
      options: ['Science', 'Art', 'Music', 'Sports'],
      correctAnswer: 0,
      explanation: `${topic} is primarily related to scientific disciplines.`,
    },
  ];
};

type QuizMode = 'practice' | 'timed';
type QuizState = 'setup' | 'playing' | 'results';

export default function QuizPage() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<QuizMode>('practice');
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const { addQuizResult, addStudyTime, unlockBadge, quizResults, reducedMotion } = useStudyStore();
  const { toast } = useToast();

  const handleStartQuiz = async () => {
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
      const generatedQuestions = await generateQuiz(topic);
      setQuestions(generatedQuestions);
      setAnswers(new Array(generatedQuestions.length).fill(null));
      setCurrentIndex(0);
      setQuizState('playing');
      addStudyTime(5);
      
      if (quizResults.length === 0) {
        unlockBadge('first-quiz');
        toast({
          title: '✅ Badge Unlocked!',
          description: 'You earned the "Quiz Taker" badge!',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const score = answers.reduce((acc, answer, index) => {
      return answer === questions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
    
    const result: QuizResult = {
      id: Date.now().toString(),
      topic,
      score,
      total: questions.length,
      date: new Date(),
      missedQuestions: questions.filter((q, i) => answers[i] !== q.correctAnswer),
    };
    
    addQuizResult(result);
    setQuizState('results');
    
    if (score === questions.length) {
      unlockBadge('perfect-quiz');
      if (!reducedMotion) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      toast({
        title: '🌟 Perfect Score!',
        description: 'You got every question right!',
      });
    }
  };

  const handleRetakeMissed = () => {
    const missedQuestions = questions.filter((q, i) => answers[i] !== q.correctAnswer);
    if (missedQuestions.length > 0) {
      setQuestions(missedQuestions);
      setAnswers(new Array(missedQuestions.length).fill(null));
      setCurrentIndex(0);
      setQuizState('playing');
      setShowExplanation(false);
    }
  };

  const handleExportReport = () => {
    const score = answers.reduce((acc, answer, index) => {
      return answer === questions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
    
    const report = `# Quiz Report: ${topic}

## Score: ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%)

## Questions & Answers:

${questions.map((q, i) => `
### Q${i + 1}: ${q.question}
- Your Answer: ${q.options[answers[i] ?? -1] || 'Not answered'}
- Correct Answer: ${q.options[q.correctAnswer]}
- ${answers[i] === q.correctAnswer ? '✅ Correct' : '❌ Incorrect'}
- Explanation: ${q.explanation}
`).join('\n')}
`;
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-report-${topic}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentQuestion = questions[currentIndex];
  const score = answers.reduce((acc, answer, index) => {
    return answer === questions[index]?.correctAnswer ? acc + 1 : acc;
  }, 0);

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
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/70">
              <HelpCircle className="h-7 w-7 text-accent-foreground" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Practice Quiz</h1>
            <p className="text-muted-foreground">
              Test your knowledge with AI-generated quizzes
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Setup State */}
            {quizState === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-xl mx-auto"
              >
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Start a Quiz</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Topic</label>
                      <Input
                        placeholder="Enter a topic (e.g., Biology, History)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        aria-label="Quiz topic"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-3 block">Quiz Mode</label>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant={mode === 'practice' ? 'default' : 'outline'}
                          onClick={() => setMode('practice')}
                          className="h-auto py-4 flex-col gap-2"
                        >
                          <BookOpen className="h-5 w-5" aria-hidden="true" />
                          <span>Practice</span>
                          <span className="text-xs opacity-70">No timer</span>
                        </Button>
                        <Button
                          variant={mode === 'timed' ? 'default' : 'outline'}
                          onClick={() => setMode('timed')}
                          className="h-auto py-4 flex-col gap-2"
                        >
                          <Timer className="h-5 w-5" aria-hidden="true" />
                          <span>Timed</span>
                          <span className="text-xs opacity-70">30s per question</span>
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleStartQuiz}
                      disabled={isGenerating || topic.trim().length < 3}
                      variant="hero"
                      size="lg"
                      className="w-full"
                    >
                      {isGenerating ? 'Generating Quiz...' : (
                        <>
                          <Play className="h-5 w-5 mr-2" aria-hidden="true" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Playing State */}
            {quizState === 'playing' && currentQuestion && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-2xl mx-auto"
              >
                {/* Progress */}
                <div className="mb-6 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="font-medium text-success">
                    Score: {score}/{currentIndex}
                  </span>
                </div>
                <Progress value={((currentIndex + 1) / questions.length) * 100} className="mb-8 h-2" />

                {/* Question Card */}
                <Card variant="elevated" className="mb-6">
                  <CardContent className="p-8">
                    <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
                    
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = answers[currentIndex] === index;
                        const isCorrect = index === currentQuestion.correctAnswer;
                        const showResult = showExplanation;
                        
                        let variant: 'default' | 'outline' | 'success' | 'destructive' = 'outline';
                        if (showResult) {
                          if (isCorrect) variant = 'success';
                          else if (isSelected && !isCorrect) variant = 'destructive';
                        } else if (isSelected) {
                          variant = 'default';
                        }
                        
                        return (
                          <Button
                            key={index}
                            variant={variant === 'success' ? 'success' : variant === 'destructive' ? 'destructive' : isSelected ? 'default' : 'outline'}
                            onClick={() => !showExplanation && handleSelectAnswer(index)}
                            disabled={showExplanation}
                            className="w-full justify-start h-auto py-4 px-6 text-left"
                          >
                            <span className="flex items-center gap-3">
                              {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                              {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
                              {option}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* Explanation */}
                    <AnimatePresence>
                      {showExplanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 p-4 rounded-lg bg-muted"
                        >
                          <p className="text-sm">
                            <strong>Explanation:</strong> {currentQuestion.explanation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {showExplanation && (
                  <div className="flex justify-center">
                    <Button onClick={handleNext} variant="hero" size="lg">
                      {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Results State */}
            {quizState === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto"
              >
                <Card variant="elevated" className="text-center">
                  <CardContent className="p-8">
                    <div className="mb-6">
                      {score === questions.length ? (
                        <Trophy className="h-16 w-16 mx-auto text-warning" />
                      ) : score >= questions.length * 0.7 ? (
                        <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
                      ) : (
                        <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground" />
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                    <p className="text-4xl font-bold text-gradient mb-2">
                      {score}/{questions.length}
                    </p>
                    <p className="text-muted-foreground mb-6">
                      {Math.round((score / questions.length) * 100)}% correct
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-success/10">
                        <p className="text-2xl font-bold text-success">{score}</p>
                        <p className="text-sm text-muted-foreground">Correct</p>
                      </div>
                      <div className="p-4 rounded-lg bg-destructive/10">
                        <p className="text-2xl font-bold text-destructive">{questions.length - score}</p>
                        <p className="text-sm text-muted-foreground">Incorrect</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                      {questions.length - score > 0 && (
                        <Button variant="outline" onClick={handleRetakeMissed}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Retake Missed
                        </Button>
                      )}
                      <Button variant="outline" onClick={handleExportReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                      <Button variant="hero" onClick={() => { setQuizState('setup'); setTopic(''); }}>
                        New Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
}
