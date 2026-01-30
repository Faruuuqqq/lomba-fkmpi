'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Star, Target, Zap, BookOpen, Users } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: Date;
  category: 'writing' | 'ai' | 'social' | 'streak';
  points: number;
  requirement: string;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  avatar?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_project',
    title: 'First Steps',
    description: 'Create your first project',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'writing',
    points: 10,
    requirement: 'Create 1 project'
  },
  {
    id: 'ai_unlocker',
    title: 'AI Curious',
    description: 'Unlock AI features for the first time',
    icon: <Zap className="w-6 h-6" />,
    category: 'ai',
    points: 25,
    requirement: 'Write 150 words in a project'
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: <Target className="w-6 h-6" />,
    category: 'streak',
    points: 50,
    requirement: 'Use app for 7 consecutive days'
  },
  {
    id: 'month_streak',
    title: 'Marathon Writer',
    description: 'Maintain a 30-day streak',
    icon: <Trophy className="w-6 h-6" />,
    category: 'streak',
    points: 100,
    requirement: 'Use app for 30 consecutive days'
  },
  {
    id: 'power_user',
    title: 'Power User',
    description: 'Use all AI features in one day',
    icon: <Star className="w-6 h-6" />,
    category: 'ai',
    points: 35,
    requirement: 'Use Chat, Grammar Check, Plagiarism Check, and Logic Mapping'
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Save 10 papers to your library',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'social',
    points: 40,
    requirement: 'Save 10 academic papers'
  },
  {
    id: 'grammar_master',
    title: 'Grammar Master',
    description: 'Complete 20 grammar checks',
    icon: <Target className="w-6 h-6" />,
    category: 'writing',
    points: 30,
    requirement: 'Use Grammar Check 20 times'
  },
  {
    id: 'logic_explorer',
    title: 'Logic Explorer',
    description: 'Create 15 reasoning maps',
    icon: <Star className="w-6 h-6" />,
    category: 'ai',
    points: 45,
    requirement: 'Generate Logic Maps 15 times'
  }
];

export default function AchievementsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard'>('achievements');
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({ totalPoints: 0, level: 1 });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserAchievements();
      fetchLeaderboard();
    }
  }, [isAuthenticated, user]);

  const fetchUserAchievements = async () => {
    try {
      // Get user stats to check achievement progress
      const statsResponse = await fetch('/api/gamification/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        
        // Calculate unlocked achievements based on stats
        const unlocked: Achievement[] = [];
        
        // Check each achievement based on user stats
        ACHIEVEMENTS.forEach(achievement => {
          let isUnlocked = false;
          
          switch (achievement.id) {
            case 'week_streak':
              isUnlocked = stats.currentStreak >= 7;
              break;
            case 'month_streak':
              isUnlocked = stats.currentStreak >= 30;
              break;
            default:
              // For demo purposes, unlock some achievements
              isUnlocked = Math.random() > 0.5;
          }
          
          if (isUnlocked) {
            unlocked.push({
              ...achievement,
              unlockedAt: new Date()
            });
          }
        });

        setUserAchievements(unlocked);
        
        // Calculate total points and level
        const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0);
        const level = Math.floor(totalPoints / 100) + 1;
        
        setUserStats({ totalPoints, level });
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Mock leaderboard data - in production, this would come from API
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          userId: '1',
          userName: 'Sarah Chen',
          score: 2850,
          rank: 1,
          avatar: '/avatars/sarah.jpg'
        },
        {
          userId: '2',
          userName: 'Michael Park',
          score: 2750,
          rank: 2,
          avatar: '/avatars/michael.jpg'
        },
        {
          userId: '3',
          userName: 'Emma Wilson',
          score: 2600,
          rank: 3,
          avatar: '/avatars/emma.jpg'
        },
        {
          userId: '4',
          userName: 'Alex Kumar',
          score: 2450,
          rank: 4,
          avatar: '/avatars/alex.jpg'
        },
        {
          userId: '5',
          userName: 'Lisa Zhang',
          score: 2350,
          rank: 5,
          avatar: '/avatars/lisa.jpg'
        }
      ];

      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const getUnlockedCount = () => {
    return userAchievements.length;
  };

  const getProgressPercentage = (achievement: Achievement) => {
    // Mock progress calculation
    return Math.random() * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Please log in to view achievements</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Achievements & Leaderboard</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Track your progress and compete with others</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-zinc-500">Level {userStats.level}</p>
                <p className="text-xs text-zinc-400">{userStats.totalPoints} points</p>
              </div>
              <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'achievements'
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Achievements
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'leaderboard'
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'achievements' ? (
          <div>
            <div className="mb-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Your Progress
              </h2>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Unlocked {getUnlockedCount()} of {ACHIEVEMENTS.length} achievements
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = userAchievements.some(a => a.id === achievement.id);
                const progress = getProgressPercentage(achievement);
                
                return (
                  <div
                    key={achievement.id}
                    className={`bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 border-2 transition-all ${
                      isUnlocked
                        ? 'border-indigo-500 shadow-indigo-500/20'
                        : 'border-zinc-200 dark:border-zinc-700 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${
                        isUnlocked ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-zinc-100 dark:bg-zinc-800'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          +{achievement.points}
                        </p>
                        <p className="text-xs text-zinc-500">points</p>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      {achievement.title}
                    </h3>
                    
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      {achievement.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>Requirement: {achievement.requirement}</span>
                        <span>Category: {achievement.category}</span>
                      </div>
                      
                      {!isUnlocked && progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                            <div
                              className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {isUnlocked && achievement.unlockedAt && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          ✓ Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Global Leaderboard
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Top writers this month
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.rank === 1
                        ? 'bg-yellow-50 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-600'
                        : entry.rank === 2
                        ? 'bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600'
                        : entry.rank === 3
                        ? 'bg-orange-50 dark:bg-orange-900 border-2 border-orange-300 dark:border-orange-600'
                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        entry.rank === 1
                          ? 'bg-yellow-500'
                          : entry.rank === 2
                          ? 'bg-gray-500'
                          : entry.rank === 3
                          ? 'bg-orange-500'
                          : 'bg-zinc-500'
                      }`}>
                        {entry.rank}
                      </div>
                      
                      <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                        {entry.avatar ? (
                          <img
                            src={entry.avatar}
                            alt={entry.userName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-zinc-500" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {entry.userName}
                        </p>
                        <p className="text-sm text-zinc-500">
                          Level {Math.floor(entry.score / 500) + 1}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {entry.score.toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}