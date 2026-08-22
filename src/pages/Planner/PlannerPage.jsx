import { useState, useMemo } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plus,
  Filter,
  ListTodo,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  Target,
} from 'lucide-react';
import { formatDate, cn } from '../../utils/cn';

const priorityColors = {
  high: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  low: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function PlannerPage() {
  const {
    tasks,
    studySessions,
    subjects,
    addTask,
    toggleTaskComplete,
    deleteTask,
  } = useStudyData();

  const [currentDate, setCurrentDate] = useState(new Date());

  const [filter, setFilter] = useState('all');

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [showAddTask, setShowAddTask] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    type: 'assignment',
  });

  const [addTaskError, setAddTaskError] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();

  const prevMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));

  const nextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (filter === 'pending')
      filtered = filtered.filter((t) => !t.completed);

    if (filter === 'completed')
      filtered = filtered.filter((t) => t.completed);

    if (filter === 'high')
      filtered = filtered.filter((t) => t.priority === 'high');

    filtered.sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    );

    return filtered;
  }, [tasks, filter]);

  const selectedTasks = filteredTasks.filter(
    (t) => t.dueDate === selectedDate
  );

  const todayStr = new Date().toISOString().split('T')[0];
  // Use raw tasks for Today's Tasks (not affected by filter)
  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr && !t.completed
  );

  const selectedSessions = studySessions.filter(
    (s) => s.date === selectedDate
  );

  const getTasksForDate = (date) => {
    return tasks.filter((t) => t.dueDate === date);
  };

  const getStudyHoursForDate = (date) => {
    return studySessions
      .filter((s) => s.date === date)
      .reduce((sum, s) => sum + s.duration, 0);
  };

  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);

    calendarDays.push(date.toISOString().split('T')[0]);
  }

  const today = new Date().toISOString().split('T')[0];

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    setAddTaskError('');

    try {
      await addTask({
        ...newTask,
        completed: false,
      });

      setShowAddTask(false);
      setNewTask({
        title: '',
        subject: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
        type: 'assignment',
      });
    } catch (error) {
      setAddTaskError(error.message || 'Failed to add task');
    }
  };

  return (
        <div className="space-y-6 animate-fade-in">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Planner
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {monthNames[currentMonth]} {currentYear} •{' '}
            {filteredTasks.filter((t) => !t.completed).length} tasks pending
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="hidden sm:flex"
          onClick={() => {
            setNewTask(prev => ({ ...prev, dueDate: selectedDate }));
            setShowAddTask(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>

      </div>

      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-xl font-bold">
                Add New Task
              </h2>

              <button onClick={() => setShowAddTask(false)}>
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="space-y-4">
              {addTaskError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  {addTaskError}
                </div>
              )}

              <input
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent p-3"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    title: e.target.value,
                  })
                }
              />

              <select
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent p-3"
                value={newTask.subject}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    subject: e.target.value,
                  })
                }
              >
                <option value="">Choose Subject</option>

                {subjects.map((subject) => (
                  <option
                    key={subject.id}
                    value={subject.name}
                  >
                    {subject.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent p-3"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    dueDate: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-3">

                <select
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent p-3"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value,
                    })
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent p-3"
                  value={newTask.type}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="project">Project</option>
                  <option value="lab">Lab</option>
                  <option value="reading">Reading</option>
                </select>

              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleAddTask}
              >
                Save Task
              </Button>

            </div>

          </div>

        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">

          <Card>

            <CardHeader>

              <div className="flex items-center justify-between">

                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary-500" />
                  Calendar
                </CardTitle>

                <div className="flex items-center gap-2">

                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-medium">
                    {monthNames[currentMonth]} {currentYear}
                  </span>

                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>

              </div>

            </CardHeader>

            <CardContent>

              <div className="grid grid-cols-7 gap-1">

                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium py-2 text-gray-500"
                  >
                    {day}
                  </div>
                ))}
                                {calendarDays.map((dateStr, index) => {

                  if (!dateStr) {
                    return <div key={index} />;
                  }

                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;

                  const dayTasks = getTasksForDate(dateStr);

                  const pendingCount = dayTasks.filter(
                    (t) => !t.completed
                  ).length;

                  const studyMinutes = getStudyHoursForDate(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "relative h-20 rounded-xl border transition-all",
                        isSelected
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                      )}
                    >
                      <div className="absolute top-2 left-2 text-sm font-semibold">
                        {new Date(dateStr).getDate()}
                      </div>

                      <div className="absolute bottom-2 left-2 flex gap-1">

                        {pendingCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        )}

                        {studyMinutes > 0 && (
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        )}

                      </div>

                    </button>
                  );

                })}

              </div>

            </CardContent>

          </Card>

          <Card className="mt-5">

            <CardHeader>

              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5" />
                Tasks for {formatDate(selectedDate)}
              </CardTitle>

            </CardHeader>

            <CardContent>

              {selectedTasks.length === 0 ? (

                <div className="text-center py-10 text-gray-500">

                  No tasks scheduled

                </div>

              ) : (

                <div className="space-y-3">

                  {selectedTasks.map((task) => (

                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                    >

                      <button
                        onClick={() =>
                          toggleTaskComplete(task.id)
                        }
                      >

                        {task.completed ? (

                          <CheckCircle2 className="w-6 h-6 text-green-500" />

                        ) : (

                          <Circle className="w-6 h-6 text-gray-400" />

                        )}

                      </button>

                      <div className="flex-1">

                        <h3
                          className={cn(
                            "font-semibold",
                            task.completed &&
                              "line-through text-gray-400"
                          )}
                        >
                          {task.title}
                        </h3>

                        <p className="text-sm text-gray-500">

                          {task.subject} • {task.type}

                        </p>

                      </div>

                      <Badge
                        variant={
                          task.priority === "high"
                            ? "danger"
                            : task.priority === "medium"
                            ? "warning"
                            : "success"
                        }
                      >
                        {task.priority}
                      </Badge>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </CardContent>

          </Card>
                    <div className="space-y-6">

            <Card>

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary-500" />
                  Filters
                </CardTitle>
              </CardHeader>

              <CardContent>

                <div className="grid grid-cols-2 gap-2">

                  <Button
                    variant={filter === "all" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    All
                  </Button>

                  <Button
                    variant={filter === "pending" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilter("pending")}
                  >
                    Pending
                  </Button>

                  <Button
                    variant={filter === "completed" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilter("completed")}
                  >
                    Completed
                  </Button>

                  <Button
                    variant={filter === "high" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilter("high")}
                  >
                    High
                  </Button>

                </div>

              </CardContent>

            </Card>

            <Card>

              <CardHeader>

                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Upcoming Deadlines
                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="space-y-3">

                  {/* Use raw tasks for Upcoming Deadlines (not affected by filter) */}
                {tasks
                  .filter((task) => !task.completed)
                  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                  .slice(0, 5)
                  .map((task) => (

                      <div
                        key={task.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 p-3"
                      >

                        <div className="flex justify-between items-start">

                          <div>

                            <h4 className="font-medium">
                              {task.title}
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                              {task.subject}
                            </p>

                          </div>

                          <Badge
                            variant={
                              task.priority === "high"
                                ? "danger"
                                : task.priority === "medium"
                                ? "warning"
                                : "success"
                            }
                          >
                            {task.priority}
                          </Badge>

                        </div>

                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">

                          <Calendar className="w-4 h-4" />

                          {formatDate(task.dueDate)}

                        </div>

                      </div>

                    ))}

                </div>

              </CardContent>

            </Card>

            <Card>

              <CardHeader>

                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Today's Tasks
                </CardTitle>

              </CardHeader>

              <CardContent>

                {todayTasks.length === 0 ? (

                  <div className="text-center py-8 text-gray-500">
                    No tasks due today.
                  </div>

                ) : (

                  <div className="space-y-3">

                    {todayTasks.map((task) => (

                      <div

                        key={task.id}

                        className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4"

                      >

                        <button

                          onClick={() =>

                            toggleTaskComplete(task.id)

                          }

                        >

                          {task.completed ? (

                            <CheckCircle2 className="w-6 h-6 text-green-500" />

                          ) : (

                            <Circle className="w-6 h-6 text-gray-400" />

                          )}

                        </button>

                        <div className="flex-1">

                          <h3

                            className={cn(

                              "font-semibold",

                              task.completed &&

                                "line-through text-gray-400"

                            )}

                          >

                            {task.title}

                          </h3>

                          <p className="text-sm text-gray-500">

                            {task.subject} • {task.type}

                          </p>

                        </div>

                        <Badge

                          variant={

                            task.priority === "high"

                              ? "danger"

                              : task.priority === "medium"

                              ? "warning"

                              : "success"

                          }

                        >

                          {task.priority}

                        </Badge>

                        <button

                          onClick={() => deleteTask(task.id)}

                          className="text-red-500 hover:text-red-700"

                        >

                          <Trash2 className="w-5 h-5" />

                        </button>

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>

            <Card>

              <CardHeader>

                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Today's Study
                </CardTitle>

              </CardHeader>

              <CardContent>

                {selectedSessions.length === 0 ? (

                  <div className="text-center py-8 text-gray-500">
                    No study sessions scheduled.
                  </div>

                ) : (

                  <div className="space-y-3">

                    {selectedSessions.map((session) => (

                      <div
                        key={session.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 p-3"
                      >

                        <div className="font-medium">
                          {session.topic}
                        </div>

                        <div className="text-sm text-gray-500 mt-1">
                          {session.duration} min • {session.type}
                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>

          </div>

        </div>

      </div>

    </div>

  );
}