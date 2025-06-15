import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, 
  Settings, 
  User, 
  Shield, 
  Lightbulb, 
  HelpCircle,
  Search,
  Filter,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Setting complexity levels
export type SettingLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Setting category definitions
export interface SettingCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  level: SettingLevel;
  priority: number;
  items: SettingItem[];
}

export interface SettingItem {
  id: string;
  name: string;
  description: string;
  level: SettingLevel;
  type: 'boolean' | 'select' | 'number' | 'text' | 'color' | 'range' | 'component';
  value: any;
  options?: Array<{ value: any; label: string; description?: string }>;
  min?: number;
  max?: number;
  step?: number;
  component?: React.ComponentType<any>;
  dependencies?: string[]; // IDs of settings this depends on
  category: string;
  tags: string[];
  helpText?: string;
  warningText?: string;
  onChange: (value: any) => void;
  validate?: (value: any) => { isValid: boolean; error?: string };
}

interface ProgressiveSettingsPanelProps {
  categories: SettingCategory[];
  userLevel: SettingLevel;
  onUserLevelChange: (level: SettingLevel) => void;
  showExpertMode?: boolean;
  enableSearch?: boolean;
  enableFiltering?: boolean;
  className?: string;
}

const LEVEL_ORDER: SettingLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const LEVEL_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800', 
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800'
};

export function ProgressiveSettingsPanel({
  categories,
  userLevel,
  onUserLevelChange,
  showExpertMode = false,
  enableSearch = true,
  enableFiltering = true,
  className = ''
}: ProgressiveSettingsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showHiddenSettings, setShowHiddenSettings] = useState(false);

  // Filter settings based on user level, search, and dependencies
  const filteredCategories = useMemo(() => {
    const userLevelIndex = LEVEL_ORDER.indexOf(userLevel);
    
    return categories.map(category => {
      // Filter category visibility
      if (LEVEL_ORDER.indexOf(category.level) > userLevelIndex && !showExpertMode) {
        return null;
      }

      // Filter items within category
      const filteredItems = category.items.filter(item => {
        // Level filtering
        const itemLevelIndex = LEVEL_ORDER.indexOf(item.level);
        if (itemLevelIndex > userLevelIndex && !showExpertMode) {
          return false;
        }

        // Search filtering
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(query);
          const matchesDescription = item.description.toLowerCase().includes(query);
          const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(query));
          
          if (!matchesName && !matchesDescription && !matchesTags) {
            return false;
          }
        }

        // Dependency filtering
        if (item.dependencies) {
          const dependenciesMet = item.dependencies.every(depId => {
            const depItem = categories
              .flatMap(cat => cat.items)
              .find(i => i.id === depId);
            return depItem && depItem.value;
          });
          
          if (!dependenciesMet && !showHiddenSettings) {
            return false;
          }
        }

        return true;
      });

      return {
        ...category,
        items: filteredItems
      };
    }).filter(Boolean) as SettingCategory[];
  }, [categories, userLevel, searchQuery, showExpertMode, showHiddenSettings]);

  const toggleItemExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const renderSettingItem = useCallback((item: SettingItem) => {
    const isExpanded = expandedItems.has(item.id);
    const levelIndex = LEVEL_ORDER.indexOf(item.level);
    const userLevelIndex = LEVEL_ORDER.indexOf(userLevel);
    const isAdvanced = levelIndex > userLevelIndex;

    return (
      <Card key={item.id} className={`mb-3 ${isAdvanced ? 'border-orange-200' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${LEVEL_COLORS[item.level]}`}
                  >
                    {item.level}
                  </Badge>
                  {isAdvanced && (
                    <Badge variant="outline" className="text-xs">
                      Advanced
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {renderSettingControl(item)}
              {(item.helpText || item.warningText) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleItemExpanded(item.id)}
                  className="p-1 h-auto"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (item.helpText || item.warningText) && (
          <CardContent className="pt-0">
            <Separator className="mb-3" />
            {item.helpText && (
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{item.helpText}</p>
              </div>
            )}
            {item.warningText && (
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-orange-600">{item.warningText}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  }, [expandedItems, userLevel, toggleItemExpanded]);

  const renderSettingControl = useCallback((item: SettingItem) => {
    switch (item.type) {
      case 'boolean':
        return (
          <Switch
            checked={item.value}
            onCheckedChange={item.onChange}
          />
        );
      
      case 'text':
        return (
          <Input
            value={item.value}
            onChange={(e) => item.onChange(e.target.value)}
            className="w-32"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={item.value}
            onChange={(e) => item.onChange(Number(e.target.value))}
            min={item.min}
            max={item.max}
            step={item.step}
            className="w-20"
          />
        );
      
      case 'component':
        if (item.component) {
          const Component = item.component;
          return <Component value={item.value} onChange={item.onChange} />;
        }
        return null;
      
      default:
        return (
          <span className="text-sm text-muted-foreground">
            {String(item.value)}
          </span>
        );
    }
  }, []);

  const getLevelDescription = (level: SettingLevel): string => {
    switch (level) {
      case 'beginner':
        return 'Show only essential settings for getting started';
      case 'intermediate':
        return 'Include common customization options';
      case 'advanced':
        return 'Show detailed configuration options';
      case 'expert':
        return 'Display all settings including experimental features';
      default:
        return '';
    }
  };

  return (
    <div className={`progressive-settings-panel ${className}`}>
      {/* Header with level selector */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getLevelDescription(userLevel)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="user-level" className="text-sm font-medium">
                Complexity:
              </Label>
              <select
                id="user-level"
                value={userLevel}
                onChange={(e) => onUserLevelChange(e.target.value as SettingLevel)}
                className="text-sm border rounded px-2 py-1"
              >
                {LEVEL_ORDER.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        
        {/* Search and filters */}
        {(enableSearch || enableFiltering) && (
          <CardContent className="pt-0">
            <div className="flex gap-3">
              {enableSearch && (
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search settings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
              
              {enableFiltering && (
                <div className="flex items-center gap-2">
                  {showExpertMode && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="show-hidden"
                        checked={showHiddenSettings}
                        onCheckedChange={setShowHiddenSettings}
                      />
                      <Label htmlFor="show-hidden" className="text-sm">
                        Show disabled
                      </Label>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExpertMode(!showExpertMode)}
                    className="flex items-center gap-1"
                  >
                    {showExpertMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    Expert Mode
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Settings content */}
      <Tabs value={selectedCategory || 'all'} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-auto mb-6">
          <TabsTrigger value="all">All Settings</TabsTrigger>
          {filteredCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                {category.icon}
                {category.name}
                {category.items.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {category.items.length}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {filteredCategories.map(category => (
            <div key={category.id} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {category.icon}
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${LEVEL_COLORS[category.level]}`}
                >
                  {category.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {category.description}
              </p>
              
              {category.items.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      No settings available at current complexity level
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  {category.items.map(renderSettingItem)}
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        {filteredCategories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            <div className="mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {category.icon}
                {category.name}
              </h3>
              <p className="text-muted-foreground mt-2">{category.description}</p>
            </div>
            
            {category.items.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No settings available at current complexity level
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {category.items.map(renderSettingItem)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick stats */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} settings
            </span>
            <span>
              Complexity: {userLevel}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}