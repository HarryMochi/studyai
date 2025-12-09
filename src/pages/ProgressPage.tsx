import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  Trophy,
  Target,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { Progress } from '@/components/ui/progress';
import { useStudyStore } from '@/stores/studyStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function ProgressPage() {
  const { 
    streak, 
    totalStudyTime, 
    dailyProgress, 
    dailyGoal,
    badges,
    quizResults,
    flashcardSets,
    summaries,
    reducedMotion
  } = useStudyStore();

  const progressPercent = Math.min((dailyProgress / dailyGoal) * 100, 100);
  const unlockedBadges = badges.filter(b => b.unlockedAt);

  // Mock weekly data
  const weeklyData = useMemo(() => [
    { day: 'Mon', minutes: 25 },
    { day: 'Tue', minutes: 45 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 60 },
    { day: 'Fri', minutes: 40 },
    { day: 'Sat', minutes: 20 },
    { day: 'Sun', minutes: dailyProgress },
  ], [dailyProgress]);

  // Quiz accuracy data
  const quizAccuracyData = useMemo(() => {
    if (quizResults.length === 0) {
      return [
        { quiz: 'Quiz 1', accuracy: 75 },
        { quiz: 'Quiz 2', accuracy: 80 },
        { quiz: 'Quiz 3', accuracy: 85 },
        { quiz: 'Quiz 4', accuracy: 90 },
      ];
    }
    return quizResults.slice(-5).map((r, i) => ({
      quiz: `Quiz ${i + 1}`,
      accuracy: Math.round((r.score / r.total) * 100),
    }));
  }, [quizResults]);

  const stats = [
    { 
      icon: Flame, 
      label: 'Current Streak', 
      value: `${streak} days`, 
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    { 
      icon: Clock, 
      label: 'Total Study Time', 
      value: `${totalStudyTime} min`, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      icon: Trophy, 
      label: 'Badges Earned', 
      value: `${unlockedBadges.length}/${badges.length}`, 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    { 
      icon: Target, 
      label: 'Activities', 
      value: `${summaries.length + flashcardSets.length + quizResults.length}`, 
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
  ];

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
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
              <BarChart3 className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Your Progress</h1>
            <p className="text-muted-foreground">
              Track your learning journey and achievements
            </p>
          </div>

          {/* Daily Goal */}
          <Card variant="elevated" className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Daily Goal</h3>
                    <p className="text-sm text-muted-foreground">
                      {dailyProgress} / {dailyGoal} minutes
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              {progressPercent >= 100 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center text-success font-medium"
                >
                  🎉 Congratulations! You've reached your daily goal!
                </motion.p>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card variant="feature">
                  <CardContent className="p-6">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor} mb-4`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Weekly Activity */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="minutes" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Accuracy */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  Quiz Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quizAccuracyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="quiz" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--secondary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" aria-hidden="true" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {badges.map((badge, index) => {
                  const isUnlocked = !!badge.unlockedAt;
                  
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        isUnlocked 
                          ? 'bg-gradient-to-br from-warning/10 to-accent/10 border-warning/30' 
                          : 'bg-muted/50 border-border opacity-50'
                      }`}
                    >
                      <span className="text-3xl mb-2 block" role="img" aria-label={badge.name}>
                        {badge.icon}
                      </span>
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {badge.description}
                      </p>
                      {isUnlocked && (
                        <p className="text-xs text-success mt-2">
                          Unlocked!
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <Card variant="glass" className="inline-block px-8 py-6">
              <p className="text-lg font-medium text-foreground">
                {streak >= 7 
                  ? "🔥 You're on fire! Keep up the amazing work!" 
                  : streak >= 3 
                    ? "💪 Great progress! You're building momentum!" 
                    : "🚀 Every journey begins with a single step. You've got this!"}
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
