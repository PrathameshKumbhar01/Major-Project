import { useAuth } from '../../context/AuthContext';
import { useStudyData } from '../../context/StudyDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, TrendingUp, Clock, Target, Zap, Flame, ChevronRight, Award, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/cn';
import { useState, useEffect } from 'react';

export function DashboardPage() {
  const { user } = useAuth();
  const { subjects, studySessions, tasks, streakData, getWeeklyStudyHours, isLoading } = useStudyData();
  const [weeklyHoursData, setWeeklyHoursData] = useState([]);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(true);

  useEffect(() => {
    const fetchWeekly = async () => {
      setIsLoadingWeekly(true);
      try {
        const data = await getWeeklyStudyHours();
        setWeeklyHoursData(data.map(d => ({
          day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
          hours: d.hours,
        })));
      } catch (error) {
        console.error('Failed to fetch weekly hours:', error);
        setWeeklyHoursData([]);
      } finally {
        setIsLoadingWeekly(false);
      }
    };
    fetchWeekly();
  }, [getWeeklyStudyHours, studySessions]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotal = studySessions.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.duration, 0);
  const todayProgress = Math.min((todayTotal / 120) * 100, 100);

  const pendingTasks = tasks.filter(t => !t.completed);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const yesterdaySessions = studySessions.filter(s => s.date === yesterdayStr);

  const upcomingLimit = new Date();
  upcomingLimit.setDate(upcomingLimit.getDate() + 3);

  const todayTasks = tasks.filter(t => {
    const taskDate = new Date(t.dueDate).toDateString();
    const today = new Date().toDateString();
    return taskDate === today || (!t.completed && new Date(t.dueDate) <= upcomingLimit);
  });

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Semester {user?.semester} • {user?.branch}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <Clock className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {todayTotal > 0 ? `${Math.floor(todayTotal / 60)}h ${todayTotal % 60}m` : 'No study yet'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {streakData.currentStreak} days
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Today's Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {Math.round(todayProgress)}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                <Target className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <Progress value={todayProgress} size="xs" variant="gradient" className="mt-3" />
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Weekly Goal</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {streakData.weeklyProgress}/{streakData.weeklyGoal}h
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <Progress value={(streakData.weeklyProgress / streakData.weeklyGoal) * 100} size="xs" variant="success" className="mt-3" />
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Due</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {pendingTasks.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <TrendingUp className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="w-4 h-4 text-primary-500" />
                Study Hours This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoadingWeekly ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyHoursData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="day" className="text-xs text-gray-500" />
                      <YAxis className="text-xs text-gray-500" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          backdropFilter: 'blur(8px)',
                        }}
                      />
                      <Bar dataKey="hours" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" />
                Subject Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl text-white font-medium text-sm"
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{subject.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {subject.completedTopics}/{subject.totalTopics} topics
                      </p>
                    </div>
                    <div className="w-28">
                      <Progress value={subject.progress} size="sm" variant="default" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject.progress}%</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-500" />
                Today's Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card variant="gradient" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/20">
                    <Flame className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Study Time Today</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {todayTotal > 0 ? `${Math.floor(todayTotal / 60)}h ${todayTotal % 60}m` : 'Start studying!'}
                    </p>
                  </div>
                </div>
              </Card>

              {yesterdaySessions.length > 0 && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">What you studied yesterday:</p>
                  <ul className="space-y-1">
                    {yesterdaySessions.map(session => {
                      const subject = subjects.find(s => s.id === session.subjectId);
                      return (
                        <li key={session.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subject?.color }} />
                          {session.topic}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested next:</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Review {subjects.find(s => s.progress < 50)?.name || 'completed subjects'} </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due {formatDate(task.dueDate)}</p>
                    </div>
                    <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'} size="xs">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
              {todayTasks.length > 4 && (
                <button className="mt-3 w-full text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  View all {todayTasks.length} tasks
                </button>
              )}
              {todayTasks.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No upcoming tasks!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
