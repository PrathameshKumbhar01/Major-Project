import { useStudyData } from '../../context/StudyDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Flame, Award, Clock, BookOpen, BarChart3, Target, Zap, Activity, Brain, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ProgressPage() {
  const { subjects, studySessions, streakData, quizScores, getWeeklyStudyHours, isLoading } = useStudyData();
  const [monthlyData, setMonthlyData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoadingCharts(true);
      try {
        // Get last 6 months of data
        const weeklyData = await getWeeklyStudyHours();
        // Aggregate by month
        const monthMap = {};
        weeklyData.forEach(d => {
          const date = new Date(d.date);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
          if (!monthMap[monthKey]) {
            monthMap[monthKey] = { hours: 0, weeks: 0 };
          }
          monthMap[monthKey].hours += d.hours;
          monthMap[monthKey].weeks += 1;
        });
        
        const monthly = Object.entries(monthMap).slice(-6).map(([month, data]) => ({
          month,
          hours: Math.round(data.hours * 10) / 10,
          quizzes: 0,
          avgScore: 0,
        }));
        setMonthlyData(monthly);

        // Build radar data from actual subject progress
        const radar = subjects.map(s => ({
          subject: s.name.slice(0, 2).toUpperCase(),
          A: s.progress,
          fullMark: 100,
        }));
        setRadarData(radar);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setIsLoadingCharts(false);
      }
    };
    fetchChartData();
  }, [getWeeklyStudyHours, subjects, studySessions]);

  const totalStudyHours = studySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
  const avgQuizScore = quizScores.length > 0 
    ? quizScores.reduce((sum, q) => sum + q.score, 0) / quizScores.length 
    : 0;
  const overallProgress = subjects.length > 0 
    ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length) 
    : 0;

  const weakTopics = subjects
    .filter(s => s.progress < 60)
    .map(s => ({ name: s.name, progress: s.progress, color: s.color }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Progress</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your academic journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-primary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallProgress}%</p>
            <p className="text-xs text-gray-500">Overall Progress</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStudyHours.toFixed(1)}h</p>
            <p className="text-xs text-gray-500">Total Study Hours</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{streakData.currentStreak}</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <Award className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(avgQuizScore)}%</p>
            <p className="text-xs text-gray-500">Avg Quiz Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" />
              Monthly Study Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoadingCharts ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'No data', hours: 0 }]}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="month" className="text-xs text-gray-500" />
                    <YAxis className="text-xs text-gray-500" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                    <Area type="monotone" dataKey="hours" stroke="#8B5CF6" fill="url(#colorHours)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary-500" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoadingCharts ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData.length > 0 ? radarData : [{ subject: 'N/A', A: 0, fullMark: 100 }]}>
                    <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
                    <PolarAngleAxis dataKey="subject" className="text-xs text-gray-500" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs text-gray-500" />
                    <Radar name="Progress" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-500" />
              Subject-wise Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl text-white text-xs font-bold" style={{ backgroundColor: subject.color }}>
                  {subject.name.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject.name}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} size="sm" variant="default" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-500" />
              Quiz Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoadingCharts ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quizScores.length > 0 ? quizScores.slice(-10).reverse() : [{ subject: 'No data', score: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="subject" className="text-xs text-gray-500" />
                    <YAxis domain={[0, 100]} className="text-xs text-gray-500" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Streak History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{streakData.currentStreak}</p>
                <p className="text-xs text-gray-500">Current Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-500">{streakData.longestStreak}</p>
                <p className="text-xs text-gray-500">Best Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">{streakData.totalDays}</p>
                <p className="text-xs text-gray-500">Total Days</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {streakData.heatmapData.slice(-35).map((day, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${
                    day.value === 0 ? 'bg-gray-100 dark:bg-gray-800' :
                    day.value === 1 ? 'bg-green-200 dark:bg-green-900' :
                    day.value === 2 ? 'bg-green-400 dark:bg-green-700' :
                    day.value === 3 ? 'bg-green-500 dark:bg-green-600' :
                    'bg-green-600 dark:bg-green-500'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Last 5 weeks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Weak Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakTopics.length > 0 ? (
              <div className="space-y-3">
                {weakTopics.map((topic) => (
                  <div key={topic.name} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{topic.name}</span>
                      <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">{topic.progress}%</span>
                    </div>
                    <Progress value={topic.progress} size="sm" variant="warning" />
                    <button className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline">
                      View study materials →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No weak topics! Keep it up!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-500" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Subjects Enrolled', value: subjects.length, icon: BookOpen, color: 'text-blue-500' },
              { label: 'Topics Completed', value: subjects.reduce((sum, s) => sum + s.completedTopics, 0), icon: CheckCircle, color: 'text-green-500' },
              { label: 'Study Sessions', value: studySessions.length, icon: Clock, color: 'text-purple-500' },
              { label: 'Quiz Attempts', value: quizScores.length, icon: BarChart3, color: 'text-yellow-500' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
