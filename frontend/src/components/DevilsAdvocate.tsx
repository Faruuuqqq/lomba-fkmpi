'use client';

import React, { useState, useEffect } from 'react';
import { UserCircleIcon, ChatBubbleLeftRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface AIPersona {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface DevilsAdvocateResponse {
  text: string;
  persona: string;
  suggestions: string[];
}

interface DevilsAdvocateProps {
  projectId: string;
  content: string;
  chatHistory: any[];
  onResponse: (response: DevilsAdvocateResponse) => void;
}

export default function DevilsAdvocate({ projectId, content, chatHistory, onResponse }: DevilsAdvocateProps) {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<DevilsAdvocateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState('devils_advocate');
  const { token } = useAuth();

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/ai/advanced/personas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas);
      }
    } catch (err) {
      console.error('Failed to fetch personas:', err);
    }
  };

  const activateDevilsAdvocate = async () => {
    if (isActive) {
      setIsActive(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const aiResponse = await fetch('/api/ai/advanced/devils-advocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          chatHistory
        })
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to get Devil\'s Advocate response');
      }

      const data: DevilsAdvocateResponse = await aiResponse.json();
      setResponse(data);
      onResponse(data);
      setIsActive(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Devil's Advocate Mode</h3>
            <p className="text-sm text-gray-600">Challenge your arguments with counterpoints</p>
          </div>
        </div>
        
        <button
          onClick={activateDevilsAdvocate}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isActive
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Analyzing...</span>
            </div>
          ) : isActive ? (
            'Stop Challenge'
          ) : (
            'Challenge Me'
          )}
        </button>
      </div>

      {/* Persona Selector */}
      {personas.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Persona
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona.id)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  selectedPersona === persona.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{persona.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{persona.name}</div>
                    <div className="text-xs text-gray-600">{persona.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">😈</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-red-900 mb-1">Devil's Advocate</div>
                <div className="text-red-800">{response.text}</div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {response.suggestions && response.suggestions.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Suggested Actions:</h4>
              <ul className="space-y-1">
                {response.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!isActive && !loading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How Devil's Advocate Works:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Challenges your assumptions and arguments</li>
            <li>• Presents counterarguments and alternative perspectives</li>
            <li>• Points out logical fallacies or weak reasoning</li>
            <li>• Helps you strengthen your position by testing it</li>
            <li>• Maintains constructive criticism, not dismissiveness</li>
          </ul>
        </div>
      )}
    </div>
  );
}