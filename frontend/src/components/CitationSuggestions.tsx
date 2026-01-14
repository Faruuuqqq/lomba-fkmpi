'use client';

import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  GlobeAltIcon,
  DocumentTextIcon,
  ExternalLinkIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface CitationSuggestion {
  type: 'book' | 'journal' | 'website' | 'academic';
  title: string;
  authors: string[];
  year: number;
  relevance: number;
  description: string;
  url?: string;
}

interface CitationSuggestionsProps {
  topic?: string;
  content: string;
  onCitationSelect?: (citation: CitationSuggestion) => void;
}

export default function CitationSuggestions({ 
  topic = '', 
  content, 
  onCitationSelect 
}: CitationSuggestionsProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<CitationSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(topic);
  const [selectedType, setSelectedType] = useState<string>('all');
  const { token } = useAuth();

  useEffect(() => {
    if (topic || content.length > 100) {
      searchCitations();
    }
  }, []);

  const searchCitations = async () => {
    if (!searchTerm.trim() && content.length < 50) {
      setError('Please provide a topic or more content to search');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        topic: searchTerm || '',
        content: content.slice(0, 1000) // Limit content length for API
      });

      const response = await fetch(`/api/ai/advanced/citation-suggestions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch citation suggestions');
      }

      const data: CitationSuggestion[] = await response.json();
      setSuggestions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const getTypeIcon = (type: CitationSuggestion['type']) => {
    switch (type) {
      case 'book':
        return <BookOpenIcon className="h-5 w-5 text-blue-600" />;
      case 'journal':
        return <AcademicCapIcon className="h-5 w-5 text-green-600" />;
      case 'website':
        return <GlobeAltIcon className="h-5 w-5 text-purple-600" />;
      case 'academic':
        return <DocumentTextIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: CitationSuggestion['type']) => {
    switch (type) {
      case 'book':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'journal':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'website':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'academic':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'text-green-600';
    if (relevance >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const filteredSuggestions = selectedType === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === selectedType);

  const uniqueTypes = Array.from(new Set(suggestions.map(s => s.type)));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <AcademicCapIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Citation Suggestions</h3>
            <p className="text-sm text-gray-600">Find relevant academic sources</p>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex space-x-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCitations()}
                placeholder="Enter topic or keyword..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          <button
            onClick={searchCitations}
            disabled={isSearching}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Type Filter */}
        {uniqueTypes.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedType === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({suggestions.length})
              </button>
              {uniqueTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
                    selectedType === type
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type} ({suggestions.filter(s => s.type === type).length})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <XMarkIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredSuggestions.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(suggestion.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {suggestion.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span>{suggestion.authors.join(', ')}</span>
                        <span>({suggestion.year})</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(suggestion.type)}`}>
                          {suggestion.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRelevanceColor(suggestion.relevance)}`}>
                          {suggestion.relevance}%
                        </div>
                        <div className="text-xs text-gray-500">Relevance</div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-3">
                    {suggestion.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onCitationSelect?.(suggestion)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Use Citation
                    </button>
                    
                    {suggestion.url && (
                      <a
                        href={suggestion.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLinkIcon className="h-4 w-4 mr-1" />
                        View Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isSearching && filteredSuggestions.length === 0 && (
        <div className="text-center py-8">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-1">
            {suggestions.length === 0 ? 'No citations found' : 'No citations match filter'}
          </h4>
          <p className="text-sm text-gray-600">
            {suggestions.length === 0 
              ? 'Try using different keywords or providing more content context'
              : 'Try adjusting the filter'
            }
          </p>
        </div>
      )}

      {/* Instructions */}
      {suggestions.length === 0 && !error && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Citation Suggestions Features:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Search academic databases for relevant sources</li>
            <li>• Find books, journals, websites, and academic papers</li>
            <li>• Calculate relevance scores for your topic</li>
            <li>• Filter by source type</li>
            <li>• Direct links to original sources</li>
            <li>• Proper citation format support</li>
          </ul>
        </div>
      )}
    </div>
  );
}