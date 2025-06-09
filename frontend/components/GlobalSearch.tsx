import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Calendar, Filter, List, Search, Target, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import backend from "~backend/client";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";

interface SearchResult {
  type: "task" | "journal" | "habit" | "calendar_event";
  id: number;
  title: string;
  content: string;
  date?: Date;
  highlights: string[];
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const searchTypes = [
  {
    value: "task",
    label: "Tasks",
    icon: List,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "journal",
    label: "Journal",
    icon: Brain,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    value: "habit",
    label: "Habits",
    icon: Target,
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    value: "calendar_event",
    label: "Events",
    icon: Calendar,
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
];

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "task",
    "journal",
    "habit",
    "calendar_event",
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { showError } = useToast();

  const { loading: searching, execute: performSearch } = useAsyncOperation(
    async (searchQuery: string, types: string[]) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return [];
      }

      const response = await backend.task.search({
        query: searchQuery.trim(),
        types: types.join(","),
        limit: 50,
      });

      setResults(response.results);
      return response.results;
    },
    undefined,
    (error) => showError("Search failed. Please try again.", "Search Error"),
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query, selectedTypes);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedTypes]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights.length || !query.trim()) return text;

    let highlightedText = text;
    const queryLower = query.toLowerCase();

    // Find the query in the text and wrap it with highlighting
    const regex = new RegExp(`(${queryLower})`, "gi");
    highlightedText = highlightedText.replace(
      regex,
      '<mark class="bg-yellow-200 px-1 rounded">$1</mark>',
    );

    return highlightedText;
  };

  const getTypeInfo = (type: string) => {
    return searchTypes.find((t) => t.value === type) || searchTypes[0];
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleResultClick = (result: SearchResult) => {
    // Close search dialog
    onOpenChange(false);

    // Navigate to the appropriate tab/section
    // This would need to be implemented based on your app's navigation structure
    console.log("Navigate to:", result);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="global-search-desc"
        className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Everything
          </DialogTitle>
        </DialogHeader>
        <DialogDescription id="global-search-desc" className="sr-only">
          Search across all tasks, habits, events and notes.
        </DialogDescription>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Search tasks, journal entries, habits, and events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {searching && <LoadingSpinner size="sm" />}
              {query && (
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="p-4 bg-gray-50">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Search in:</Label>
                <div className="grid grid-cols-2 gap-3">
                  {searchTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedTypes.includes(type.value);

                    return (
                      <div
                        key={type.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={type.value}
                          checked={isSelected}
                          onCheckedChange={() => toggleType(type.value)}
                        />
                        <Label
                          htmlFor={type.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Results */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {!query.trim() ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Start typing to search across all your data</p>
                <p className="text-sm mt-1">
                  Tasks • Journal entries • Habits • Calendar events
                </p>
              </div>
            ) : searching ? (
              <div className="text-center py-8 text-gray-500">
                <LoadingSpinner className="mx-auto mb-4" />
                <p>Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">
                  Try different keywords or check your filters
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-3">
                  Found {results.length} result{results.length !== 1 ? "s" : ""}{" "}
                  for "{query}"
                </div>
                {results.map((result) => {
                  const typeInfo = getTypeInfo(result.type);
                  const Icon = typeInfo.icon;

                  return (
                    <Card
                      key={`${result.type}-${result.id}`}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <Badge className={typeInfo.color}>
                              <Icon className="h-3 w-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              className="font-medium text-gray-900 mb-1"
                              dangerouslySetInnerHTML={{
                                __html: highlightText(
                                  result.title,
                                  result.highlights,
                                ),
                              }}
                            />

                            {result.content && (
                              <p
                                className="text-sm text-gray-600 mb-2 line-clamp-2"
                                dangerouslySetInnerHTML={{
                                  __html: highlightText(
                                    result.content.length > 150
                                      ? result.content.substring(0, 150) + "..."
                                      : result.content,
                                    result.highlights,
                                  ),
                                }}
                              />
                            )}

                            {result.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {result.highlights
                                  .slice(0, 3)
                                  .map((highlight, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs bg-yellow-50 text-yellow-800 border-yellow-200"
                                    >
                                      {highlight.length > 20
                                        ? `${highlight.substring(0, 20)}...`
                                        : highlight}
                                    </Badge>
                                  ))}
                                {result.highlights.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{result.highlights.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {result.date && (
                              <div className="text-xs text-gray-500">
                                {formatDate(result.date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
