import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Copy, 
  Download, 
  Save, 
  Loader2,
  Check,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout/Layout';
import { useStudyStore } from '@/stores/studyStore';
import { useToast } from '@/hooks/use-toast';
import { generateSummary } from '@/lib/ai';

export default function SummarizePage() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaries, setSummaries] = useState<{ short: string; detailed: string } | null>(null);
  const [copied, setCopied] = useState<'short' | 'detailed' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { addSummary, addStudyTime, unlockBadge, summaries: savedSummaries } = useStudyStore();
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (inputText.trim().length < 10) {
      setError('Please enter at least 10 characters to summarize.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await generateSummary(inputText);
      setSummaries(result);
      addStudyTime(2);
      
      if (savedSummaries.length === 0) {
        unlockBadge('first-summary');
        toast({
          title: '🎉 Badge Unlocked!',
          description: 'You earned the "First Summary" badge!',
        });
      }
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (type: 'short' | 'detailed') => {
    if (!summaries) return;
    
    const text = type === 'short' ? summaries.short : summaries.detailed;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    
    toast({
      title: 'Copied!',
      description: 'Summary copied to clipboard.',
    });
  };

  const handleExport = (format: 'txt' | 'md') => {
    if (!summaries) return;
    
    const content = format === 'md' 
      ? `# Summary\n\n## Short Summary\n${summaries.short}\n\n## Detailed Summary\n${summaries.detailed}`
      : `Short Summary:\n${summaries.short}\n\nDetailed Summary:\n${summaries.detailed}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Exported!',
      description: `Summary exported as ${format.toUpperCase()}.`,
    });
  };

  const handleSave = () => {
    if (!summaries) return;
    
    addSummary({
      id: Date.now().toString(),
      topic: inputText.slice(0, 50) + '...',
      shortSummary: summaries.short,
      detailedSummary: summaries.detailed,
      createdAt: new Date(),
    });
    
    toast({
      title: 'Saved!',
      description: 'Summary saved to your library.',
    });
  };

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
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70">
              <BookOpen className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Summarize</h1>
            <p className="text-muted-foreground">
              Transform lengthy texts into clear, concise summaries
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Section */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  Input Text
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your text here (minimum 10 characters)..."
                  className="min-h-[300px] resize-none"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setError(null);
                  }}
                  aria-label="Text to summarize"
                  aria-describedby={error ? 'input-error' : undefined}
                />
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-destructive text-sm"
                    id="input-error"
                    role="alert"
                  >
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {error}
                  </motion.div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {inputText.length} characters
                  </span>
                  <Button
                    onClick={handleSummarize}
                    disabled={isLoading || inputText.trim().length < 10}
                    variant="hero"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                        Summarize
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Section */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-4 border-muted" />
                      <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                    <p className="mt-4 text-muted-foreground">Generating summaries...</p>
                  </motion.div>
                ) : summaries ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Short Summary */}
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Short Summary</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy('short')}
                            aria-label="Copy short summary"
                          >
                            {copied === 'short' ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed">{summaries.short}</p>
                      </CardContent>
                    </Card>

                    {/* Detailed Summary */}
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Detailed Summary</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy('detailed')}
                            aria-label="Copy detailed summary"
                          >
                            {copied === 'detailed' ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed">{summaries.detailed}</p>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={() => handleExport('txt')}>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Export TXT
                      </Button>
                      <Button variant="outline" onClick={() => handleExport('md')}>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Export Markdown
                      </Button>
                      <Button variant="success" onClick={handleSave}>
                        <Save className="h-4 w-4" aria-hidden="true" />
                        Save Summary
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="mb-4 rounded-full bg-muted p-4">
                      <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 font-semibold">No summary yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter some text and click "Summarize" to get started
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
