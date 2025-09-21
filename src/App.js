import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Star, Menu, Check, Trash2, Calendar, Clock, Repeat, 
  Filter, Search, BarChart3, Settings, User, Bell, 
  ChevronDown, ChevronRight, Target, Zap, AlertCircle,
  TrendingUp, CheckCircle2, Circle, Timer, Flag,
  Sun, Moon, Palette, Download, Upload, Archive
} from 'lucide-react';

const AdvancedTodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Work', color: 'bg-blue-500', icon: '💼' },
    { id: 2, name: 'Personal', color: 'bg-green-500', icon: '🏠' },
    { id: 3, name: 'Health', color: 'bg-red-500', icon: '❤️' },
    { id: 4, name: 'Learning', color: 'bg-purple-500', icon: '📚' }
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('created');
  const [viewMode, setViewMode] = useState('list'); // list, kanban, calendar
  const [filter, setFilter] = useState('all');
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    isAllDay: false,
    repeat: 'Does not repeat',
    priority: 'medium',
    category: null,
    tags: [],
    subtasks: [],
    estimatedTime: '',
    actualTime: 0
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    color: 'bg-blue-500',
    icon: '📁'
  });

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600', icon: <Flag className="w-4 h-4" /> },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600', icon: <Flag className="w-4 h-4" /> },
    { value: 'high', label: 'High', color: 'text-red-600', icon: <Flag className="w-4 h-4" /> }
  ];

  const repeatOptions = [
    'Does not repeat', 'Daily', 'Weekly on Monday', 'Monthly on day 22',
    'Annually on September 22', 'Custom', 'Weekdays only', 'Weekends only'
  ];

  const colorOptions = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
  ];

  // Analytics calculations
  const analytics = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    const overdueTasks = tasks.filter(t => {
      if (!t.date || t.completed) return false;
      return new Date(t.date) < new Date();
    });

    const categoryStats = categories.map(cat => ({
      ...cat,
      total: tasks.filter(t => t.category === cat.id).length,
      completed: tasks.filter(t => t.category === cat.id && t.completed).length
    }));

    const priorityStats = priorities.map(priority => ({
      ...priority,
      count: tasks.filter(t => t.priority === priority.value).length,
      completed: tasks.filter(t => t.priority === priority.value && t.completed).length
    }));

    return {
      total: tasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      overdue: overdueTasks.length,
      completionRate: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      categoryStats,
      priorityStats
    };
  }, [tasks, categories]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Text search
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) 
          && !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory && task.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (filter === 'completed' && !task.completed) return false;
      if (filter === 'pending' && task.completed) return false;
      if (filter === 'starred' && !task.isStarred) return false;
      if (filter === 'overdue') {
        if (!task.date || task.completed) return false;
        if (new Date(task.date) >= new Date()) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'date':
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date) - new Date(b.date);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default: // created
          return b.id - a.id;
      }
    });

    return filtered;
  }, [tasks, searchQuery, selectedCategory, filter, sortBy]);

  const addTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        completed: false,
        createdAt: new Date().toISOString(),
        tags: newTask.tags.filter(tag => tag.trim())
      };
      setTasks([...tasks, task]);
      resetNewTask();
      setShowCreateForm(false);
    }
  };

  const addCategory = () => {
    if (newCategory.name.trim()) {
      const category = {
        id: Date.now(),
        ...newCategory
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', color: 'bg-blue-500', icon: '📁' });
      setShowCategoryForm(false);
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      date: '',
      time: '',
      isAllDay: false,
      repeat: 'Does not repeat',
      priority: 'medium',
      category: null,
      tags: [],
      subtasks: [],
      estimatedTime: '',
      actualTime: 0
    });
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleStar = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, isStarred: !task.isStarred } : task
    ));
  };

  const addSubtask = (taskId, subtaskTitle) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? {
        ...task,
        subtasks: [...(task.subtasks || []), {
          id: Date.now(),
          title: subtaskTitle,
          completed: false
        }]
      } : task
    ));
  };

  const exportTasks = () => {
    const dataStr = JSON.stringify({ tasks, categories }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tasks-backup.json';
    link.click();
  };

  const formatDateTime = (date, time, isAllDay) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (isAllDay) return `${dateStr} - All day`;
    if (time) return `${dateStr} at ${time}`;
    return dateStr;
  };

  const getPriorityColor = (priority) => {
    return priorities.find(p => p.value === priority)?.color || 'text-gray-600';
  };

  const getCategoryById = (id) => {
    return categories.find(c => c.id === id);
  };

  const isOverdue = (task) => {
    if (!task.date || task.completed) return false;
    return new Date(task.date) < new Date();
  };

  const theme = darkMode ? 'dark' : '';

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} ${theme}`}>
      {/* Sidebar */}
      <div className={`w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">NextStep</h1>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
            
            <button
              onClick={() => setShowCategoryForm(true)}
              className={`w-full flex items-center space-x-2 px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`flex-1 px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="created">Created</option>
              <option value="priority">Priority</option>
              <option value="date">Date</option>
              <option value="alphabetical">A-Z</option>
            </select>
            
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className={`flex-1 px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="list">List</option>
              <option value="kanban">Kanban</option>
              <option value="calendar">Calendar</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 mb-4">
          <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Today's Progress</span>
              <span className="text-sm font-bold">{analytics.completionRate}%</span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded-full h-2`}>
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                style={{ width: `${analytics.completionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{analytics.completed} completed</span>
              <span>{analytics.pending} pending</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => setFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                filter === 'all' ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-700') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
              }`}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5" />
                <span>All tasks</span>
              </div>
              <span className="text-sm">{analytics.total}</span>
            </button>
            
            <button
              onClick={() => setFilter('pending')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                filter === 'pending' ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-700') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
              }`}
            >
              <div className="flex items-center space-x-3">
                <Circle className="w-5 h-5" />
                <span>Pending</span>
              </div>
              <span className="text-sm">{analytics.pending}</span>
            </button>

            <button
              onClick={() => setFilter('completed')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                filter === 'completed' ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-700') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
              }`}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5" />
                <span>Completed</span>
              </div>
              <span className="text-sm">{analytics.completed}</span>
            </button>
            
            <button
              onClick={() => setFilter('starred')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                filter === 'starred' ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-700') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
              }`}
            >
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5" />
                <span>Starred</span>
              </div>
              <span className="text-sm">{tasks.filter(t => t.isStarred).length}</span>
            </button>

            <button
              onClick={() => setFilter('overdue')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                filter === 'overdue' ? (darkMode ? 'bg-gray-700 text-red-400' : 'bg-red-100 text-red-700') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
              }`}
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5" />
                <span>Overdue</span>
              </div>
              <span className="text-sm text-red-500">{analytics.overdue}</span>
            </button>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  !selectedCategory ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-700') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>All Categories</span>
                </div>
                <span className="text-sm">{tasks.length}</span>
              </button>
              
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-700') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                    <span className="flex items-center space-x-1">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                  </div>
                  <span className="text-sm">{tasks.filter(t => t.category === category.id).length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Export/Import */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex space-x-2">
            <button
              onClick={exportTasks}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors`}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors`}
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                {filter === 'all' && 'All Tasks'}
                {filter === 'pending' && 'Pending Tasks'}
                {filter === 'completed' && 'Completed Tasks'}
                {filter === 'starred' && 'Starred Tasks'}
                {filter === 'overdue' && 'Overdue Tasks'}
                {selectedCategory && ` - ${getCategoryById(selectedCategory)?.name}`}
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {filteredTasks.length} tasks found
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors`}
              >
                Analytics
              </button>
              <Menu className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-6`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.total}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-green-50'} rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.completed}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'} rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{analytics.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              
              <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-red-50'} rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{analytics.overdue}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Category Breakdown</h4>
                <div className="space-y-2">
                  {analytics.categoryStats.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${cat.color} rounded-full`}></div>
                        <span>{cat.icon} {cat.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{cat.completed}/{cat.total}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${cat.color} h-2 rounded-full`}
                            style={{ width: `${cat.total ? (cat.completed / cat.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Priority Distribution</h4>
                <div className="space-y-2">
                  {analytics.priorityStats.map(priority => (
                    <div key={priority.value} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={priority.color}>
                          {priority.icon}
                        </div>
                        <span>{priority.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{priority.completed}/{priority.count}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-current h-2 rounded-full"
                            style={{ 
                              width: `${priority.count ? (priority.completed / priority.count) * 100 : 0}%`,
                              color: priority.color.replace('text-', '').replace('-600', '')
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="flex-1 p-6 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className={`w-32 h-32 mx-auto mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                <Check className={`w-16 h-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-xl font-medium mb-2">No tasks found</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md mx-auto`}>
                {searchQuery ? 'Try adjusting your search or filters' : 'Create your first task to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => {
                const category = getCategoryById(task.category);
                const overdue = isOverdue(task);
                
                return (
                  <div
                    key={task.id}
                    className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border hover:shadow-md transition-all ${
                      overdue ? 'border-red-200 bg-red-50' : ''
                    } ${task.completed ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : `border-gray-300 hover:border-blue-500 ${overdue ? 'border-red-400' : ''}`
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4 text-white" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''} ${overdue && !task.completed ? 'text-red-600' : ''}`}>
                            {task.title}
                          </h3>
                          
                          {/* Priority Badge */}
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            <Flag className="w-3 h-3" />
                            <span className="capitalize">{task.priority}</span>
                          </div>
                          
                          {/* Category Badge */}
                          {category && (
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white ${category.color}`}>
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </div>
                          )}
                          
                          {/* Overdue Badge */}
                          {overdue && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <AlertCircle className="w-3 h-3" />
                              <span>Overdue</span>
                            </div>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 ${task.completed ? 'line-through' : ''}`}>
                            {task.description}
                          </p>
                        )}
                        
                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.map((tag, index) => (
                              <span key={index} className={`px-2 py-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} text-xs rounded-full`}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">
                              Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
                            </div>
                            <div className="space-y-1">
                              {task.subtasks.slice(0, 3).map(subtask => (
                                <div key={subtask.id} className="flex items-center space-x-2 text-sm">
                                  <div className={`w-3 h-3 rounded-full border ${subtask.completed ? 'bg-green-400 border-green-400' : 'border-gray-300'}`}></div>
                                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>{subtask.title}</span>
                                </div>
                              ))}
                              {task.subtasks.length > 3 && (
                                <div className="text-xs text-gray-500">+{task.subtasks.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Task Meta Info */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {task.date && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDateTime(task.date, task.time, task.isAllDay)}</span>
                            </span>
                          )}
                          
                          {task.repeat !== 'Does not repeat' && (
                            <span className="flex items-center space-x-1">
                              <Repeat className="w-3 h-3" />
                              <span>{task.repeat}</span>
                            </span>
                          )}
                          
                          {task.estimatedTime && (
                            <span className="flex items-center space-x-1">
                              <Timer className="w-3 h-3" />
                              <span>{task.estimatedTime}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleStar(task.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            task.isStarred 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : `${darkMode ? 'text-gray-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`
                          }`}
                        >
                          <Star className={`w-4 h-4 ${task.isStarred ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => deleteTask(task.id)}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Create New Task</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className={`text-gray-500 hover:text-gray-700 text-2xl ${darkMode ? 'hover:text-gray-300' : ''}`}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title..."
                  className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Add task description..."
                  rows={3}
                  className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                    className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                    className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={newTask.isAllDay}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newTask.category || ''}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value ? parseInt(e.target.value) : null})}
                    className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">No Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.icon} {category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Time</label>
                  <input
                    type="text"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
                    placeholder="e.g., 2 hours, 30 mins"
                    className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Repeat</label>
                  <select
                    value={newTask.repeat}
                    onChange={(e) => setNewTask({...newTask, repeat: e.target.value})}
                    className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {repeatOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTask.tags.join(', ')}
                  onChange={(e) => setNewTask({...newTask, tags: e.target.value.split(',').map(tag => tag.trim())})}
                  placeholder="work, urgent, meeting"
                  className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newTask.isAllDay}
                  onChange={(e) => setNewTask({...newTask, isAllDay: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="allDay" className="text-sm font-medium">All day task</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowCreateForm(false)}
                className={`px-6 py-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Create New Category</h3>
              <button
                onClick={() => setShowCategoryForm(false)}
                className={`text-gray-500 hover:text-gray-700 text-2xl ${darkMode ? 'hover:text-gray-300' : ''}`}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="Enter category name..."
                  className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  placeholder="📁"
                  className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategory({...newCategory, color})}
                      className={`w-10 h-10 ${color} rounded-lg border-2 ${
                        newCategory.color === color ? 'border-gray-800' : 'border-transparent'
                      } hover:scale-110 transition-transform`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCategoryForm(false)}
                className={`px-4 py-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTodoApp;