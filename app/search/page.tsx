"use client"

import { useState, useEffect, useCallback } from 'react';
import { Search, Home, BarChart2, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedLoadingSkeleton from "@/components/ui/loading-skeleton";

type NavItem = { href: string; label: string; icon: any };

interface SearchResult {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  location_text: string;
  city: string | null;
  created_at: string;
  photos: string[] | null;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<SearchResult | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const supabase = createClientComponentClient();

  const navItems: NavItem[] = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/profile", label: "Profile", icon: MessageSquare },
  ];

  // Debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Fetch recent issues
  const fetchRecentIssues = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching recent issues:', err);
      setError('Failed to load recent issues');
    } finally {
      setIsLoadingRecent(false);
    }
  }, [supabase]);

  // Search function
  const searchIssues = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchRecentIssues();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,location_text.ilike.%${query}%,city.ilike.%${query}%`
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error searching issues:', err);
      setError('Failed to load search results');
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecentIssues, supabase]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => searchIssues(query), 300),
    []
  );

  // Load recent issues on initial render
  useEffect(() => {
    fetchRecentIssues();
  }, [fetchRecentIssues]);

  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      // Cleanup
      debouncedSearch.cancel?.();
    };
  }, [searchQuery, debouncedSearch]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to extract first image URL from photos array or string
  const getFirstImageUrl = (photos: string[] | string | null): string | null => {
    if (!photos) return null;
    
    try {
      // Handle case where photos is a string that might be a stringified array
      if (typeof photos === 'string') {
        if (photos.startsWith('[')) {
          const parsed = JSON.parse(photos);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        }
        return photos; // Return as is if it's a direct URL
      }
      
      // Handle array case
      if (Array.isArray(photos) && photos.length > 0) {
        return photos[0];
      }
      
      return null;
    } catch (e) {
      console.error('Error parsing photos:', e);
      return null;
    }
  };

  return (
    <div className="md:flex">
      <Sidebar />
      <main className="min-h-dvh flex flex-col flex-1">
        <TopBar />
        <div className="min-h-screen bg-white">
          <div className="h-32 bg-gradient-to-b from-[#B8F1B0] to-white"></div>
          <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
          <div className="relative mb-8">
            <div className={`flex items-center border-2 rounded-lg px-4 py-2 ${isSearchFocused ? 'border-black' : 'border-black'}`}>
              <Search className="text-gray-400 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search issues by title, description, or location..."
                className="w-full outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-400" />}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {searchQuery && !isLoading && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No results found for "{searchQuery}"
            </div>
          )}

          {!searchQuery && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Issues</h2>
              {isLoadingRecent ? (
                <AnimatedLoadingSkeleton />
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div 
                      key={result.id}
                      onClick={() => setShowDetails(result)}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{result.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {result.description}
                          </p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <span>{formatDate(result.created_at)}</span>
                            {result.location_text && (
                              <span className="ml-3 flex items-center">
                                <svg className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {result.location_text}
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDetails(result);
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent issues found
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {results.map((result) => {
              const imageUrl = getFirstImageUrl(result.photos);
              
              return (
                <div 
                  key={result.id}
                  onClick={() => setShowDetails(result)}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {imageUrl && (
                        <div className="w-full md:w-32 h-32 flex-shrink-0 relative rounded-md overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={result.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 128px"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              result.status === 'open' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {result.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              result.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : result.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {result.priority}
                            </span>
                          </div>
                        </div>
                        
                        {result.location_text && (
                          <p className="mt-1 text-sm text-gray-500 flex items-center">
                            <svg 
                              className="h-4 w-4 mr-1 text-gray-400" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {result.location_text}
                            {result.city && `, ${result.city}`}
                          </p>
                        )}
                        
                        <p className="mt-2 text-gray-600 line-clamp-2">
                          {result.description}
                        </p>
                        
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                          <span>Reported on {formatDate(result.created_at)}</span>
                          <button 
                            className="text-blue-600 hover:text-blue-800 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDetails(result);
                            }}
                          >
                            View details →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details Dialog */}
          {showDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetails(null)}>
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{showDetails.title}</h2>
                    <button 
                      onClick={() => setShowDetails(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                      {getFirstImageUrl(showDetails.photos) ? (
                        <img 
                          src={getFirstImageUrl(showDetails.photos) || ''} 
                          alt={showDetails.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        showDetails.status === 'open' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {showDetails.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        showDetails.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : showDetails.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {showDetails.priority} priority
                      </span>
                    </div>
                    
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{showDetails.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {[showDetails.location_text, showDetails.city].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Reported On</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(showDetails.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-6 border-t border-gray-200">
                      {/* <Link 
                        href={`/issues/${showDetails.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Full Details
                      </Link> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
        <BottomNav items={navItems} />
      </main>
    </div>
  );
}
