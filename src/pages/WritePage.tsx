import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PenTool, 
  Download,
  Loader2,
  FileText,
  List,
  Quote,
  CheckCircle,
  AlertTriangle,
  Bold,
  Italic,
  Heading1,
  Heading2,
  ListOrdered
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudyStore } from '@/stores/studyStore';
import { useToast } from '@/hooks/use-toast';
import { generateOutline, generateCitations, checkGrammar } from '@/lib/ai';

const mockOutlineResponse = async (topic: string): Promise<string> => {
  
  return `# ${topic}

## I. Introduction
   - Hook: Engaging opening statement about ${topic}
   - Background: Brief context and relevance
   - Thesis: Clear main argument or purpose

## II. Historical Context
   - Origins and development
   - Key milestones and events
   - Evolution over time

## III. Main Concepts
   A. First Key Concept
      - Definition and explanation
      - Examples and applications
      - Significance
   
   B. Second Key Concept
      - Core principles
      - Real-world implications
      - Supporting evidence

## IV. Analysis
   - Critical examination of main ideas
   - Comparison with alternative perspectives
   - Strengths and limitations

## V. Implications and Applications
   - Practical uses
   - Future developments
   - Recommendations

## VI. Conclusion
   - Summary of main points
   - Restatement of thesis
   - Final thoughts and call to action`;
};

const generateCitations = async (sources: string, format: 'mla' | 'apa'): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (format === 'mla') {
    return [
      'Smith, John. "Title of Article." Journal Name, vol. 10, no. 2, 2023, pp. 45-67.',
      'Johnson, Mary. Book Title. Publisher, 2022.',
      '"Web Article Title." Website Name, 15 Jan. 2024, www.example.com/article.',
    ];
  } else {
    return [
      'Smith, J. (2023). Title of article. Journal Name, 10(2), 45-67.',
      'Johnson, M. (2022). Book title. Publisher.',
      'Web article title. (2024, January 15). Website Name. https://www.example.com/article',
    ];
  }
};

const checkGrammar = async (text: string): Promise<{ original: string; suggestion: string; type: 'grammar' | 'style' }[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock grammar suggestions
  return [
    { original: 'very unique', suggestion: 'unique (unique is already absolute)', type: 'style' },
    { original: 'alot', suggestion: 'a lot', type: 'grammar' },
    { original: 'could of', suggestion: 'could have', type: 'grammar' },
  ];
};

export default function WritePage() {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState('');
  const [essayText, setEssayText] = useState('');
  const [citationFormat, setCitationFormat] = useState<'mla' | 'apa'>('apa');
  const [citations, setCitations] = useState<string[]>([]);
  const [grammarIssues, setGrammarIssues] = useState<{ original: string; suggestion: string; type: 'grammar' | 'style' }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [activeTab, setActiveTab] = useState('outline');
  
  const { addStudyTime } = useStudyStore();
  const { toast } = useToast();

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

  const handleGenerateOutline = async () => {
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
      const generatedOutline = await generateOutline(topic);
      setOutline(generatedOutline);
      addStudyTime(3);
      toast({
        title: 'Outline Generated!',
        description: 'Your essay outline is ready.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate outline. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCitations = async () => {
    setIsGenerating(true);
    try {
      const generatedCitations = await generateCitations('sample sources', citationFormat);
      setCitations(generatedCitations);
      toast({
        title: 'Citations Generated!',
        description: `${generatedCitations.length} citations in ${citationFormat.toUpperCase()} format.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate citations.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckGrammar = async () => {
    if (essayText.trim().length < 10) {
      toast({
        title: 'Error',
        description: 'Please enter at least 10 characters to check.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCheckingGrammar(true);
    try {
      const issues = await checkGrammar(essayText);
      setGrammarIssues(issues);
      if (issues.length === 0) {
        toast({
          title: 'All Clear!',
          description: 'No grammar or style issues found.',
        });
      } else {
        toast({
          title: 'Issues Found',
          description: `${issues.length} suggestions for improvement.`,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to check grammar.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const handleExport = (format: 'md' | 'txt') => {
    const content = format === 'md' 
      ? `${outline}\n\n---\n\n## Essay Draft\n\n${essayText}\n\n## Citations\n\n${citations.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
      : `${outline}\n\n---\n\nEssay Draft:\n\n${essayText}\n\nCitations:\n\n${citations.join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `essay-${topic || 'draft'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Exported!',
      description: `Essay exported as ${format.toUpperCase()}.`,
    });
  };

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = document.querySelector('textarea[data-essay]') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = essayText.substring(start, end);
    const newText = essayText.substring(0, start) + prefix + selectedText + suffix + essayText.substring(end);
    setEssayText(newText);
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
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-success to-success/70">
              <PenTool className="h-7 w-7 text-success-foreground" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Writing Assistant</h1>
            <p className="text-muted-foreground">
              Generate outlines, citations, and get writing help
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="outline" className="gap-2">
                <List className="h-4 w-4" aria-hidden="true" />
                Outline
              </TabsTrigger>
              <TabsTrigger value="write" className="gap-2">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Write
              </TabsTrigger>
              <TabsTrigger value="citations" className="gap-2">
                <Quote className="h-4 w-4" aria-hidden="true" />
                Citations
              </TabsTrigger>
            </TabsList>

            {/* Outline Tab */}
            <TabsContent value="outline">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Generate Outline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Enter your essay topic..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      aria-label="Essay topic"
                    />
                    <Button
                      onClick={handleGenerateOutline}
                      disabled={isGenerating || topic.trim().length < 3}
                      variant="hero"
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <List className="h-4 w-4" aria-hidden="true" />
                          Generate Outline
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Your Outline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {outline ? (
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {outline}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Enter a topic and generate an outline to get started
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Write Tab */}
            <TabsContent value="write">
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Rich Text Editor</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {wordCount} words
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('**')}
                      aria-label="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('*')}
                      aria-label="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('# ', '\n')}
                      aria-label="Heading 1"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('## ', '\n')}
                      aria-label="Heading 2"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('- ', '\n')}
                      aria-label="Bullet list"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('1. ', '\n')}
                      aria-label="Numbered list"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </div>

                  <Textarea
                    data-essay
                    placeholder="Start writing your essay here..."
                    className="min-h-[300px] font-sans"
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    aria-label="Essay text"
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCheckGrammar}
                      disabled={isCheckingGrammar}
                    >
                      {isCheckingGrammar ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Check Grammar
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('md')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Markdown
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('txt')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export TXT
                    </Button>
                  </div>

                  {/* Grammar Issues */}
                  {grammarIssues.length > 0 && (
                    <div className="space-y-2 p-4 rounded-lg bg-warning/10">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Suggestions
                      </h4>
                      {grammarIssues.map((issue, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-destructive line-through">{issue.original}</span>
                          <span className="mx-2">→</span>
                          <span className="text-success">{issue.suggestion}</span>
                          <span className="ml-2 text-xs text-muted-foreground">({issue.type})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Citations Tab */}
            <TabsContent value="citations">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Citation Generator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Citation Format</label>
                      <Select value={citationFormat} onValueChange={(v: 'mla' | 'apa') => setCitationFormat(v)}>
                        <SelectTrigger aria-label="Citation format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apa">APA (7th Edition)</SelectItem>
                          <SelectItem value="mla">MLA (9th Edition)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleGenerateCitations}
                      disabled={isGenerating}
                      variant="hero"
                      className="mt-6"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Sample Citations'}
                    </Button>
                  </div>

                  {citations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Generated Citations ({citationFormat.toUpperCase()})</h4>
                      {citations.map((citation, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-muted text-sm font-mono"
                        >
                          {citation}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
