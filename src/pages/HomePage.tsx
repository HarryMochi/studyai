import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  PenTool, 
  BarChart3,
  ArrowRight,
  Sparkles,
  Zap,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';

const features = [
  {
    icon: BookOpen,
    title: 'Smart Summarize',
    description: 'Transform lengthy texts into concise, memorable summaries instantly.',
    color: 'from-primary to-primary/70',
    path: '/summarize',
  },
  {
    icon: Layers,
    title: 'Flashcards',
    description: 'Auto-generate Q&A cards and master any topic with spaced repetition.',
    color: 'from-secondary to-secondary/70',
    path: '/flashcards',
  },
  {
    icon: HelpCircle,
    title: 'Practice Quiz',
    description: 'Test your knowledge with AI-generated quizzes and track your progress.',
    color: 'from-accent to-accent/70',
    path: '/quiz',
  },
  {
    icon: PenTool,
    title: 'Writing Assistant',
    description: 'Generate essay outlines, citations, and get grammar suggestions.',
    color: 'from-success to-success/70',
    path: '/write',
  },
];

const stats = [
  { icon: Sparkles, label: 'AI-Powered', value: '100%' },
  { icon: Zap, label: 'Time Saved', value: '50%' },
  { icon: Trophy, label: 'Better Grades', value: 'A+' },
];

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Powered by AI</span>
            </motion.div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Learn{' '}
              <span className="text-gradient">smarter</span>
              ,<br />
              not harder.
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground md:text-xl">
              Your AI study companion that helps you summarize, create flashcards, 
              take quizzes, and write better—all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/summarize">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/progress">
                  View Progress
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-16 flex items-center justify-center gap-8 md:gap-16"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-foreground">
                    <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    {stat.value}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything you need to{' '}
              <span className="text-gradient">excel</span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Powerful AI tools designed specifically for students who want to 
              study efficiently and achieve their academic goals.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link to={feature.path}>
                  <Card variant="feature" className="h-full group">
                    <CardContent className="p-6">
                      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                        <feature.icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card variant="elevated" className="overflow-hidden">
              <div className="relative p-8 md:p-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                      Ready to boost your grades?
                    </h2>
                    <p className="text-muted-foreground">
                      Start your learning journey today and see the difference.
                    </p>
                  </div>
                  <Button asChild variant="hero" size="lg">
                    <Link to="/summarize">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
