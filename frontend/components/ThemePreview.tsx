/**
 * Theme Preview Component
 * 
 * Shows a comprehensive preview of how the theme looks
 * across different UI components and states.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle,
  Heart,
  Moon,
  Star,
  Sun,
  Target,
  TrendingUp,
} from "lucide-react";
import type { ThemeConfig } from "../types/theme";
import { getPriorityColor, getStatusColor, getMoodColor } from "../lib/colors";

interface ThemePreviewProps {
  theme: ThemeConfig | null;
}

export function ThemePreview({ theme }: ThemePreviewProps) {
  if (!theme) {
    return (
      <div className="flex items-center justify-center p-8 text-[var(--color-text-secondary)]">
        No theme selected for preview
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-[var(--color-background-primary)] rounded-lg border">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
          {theme.name} Preview
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          {theme.isDark ? "Dark" : "Light"} theme preview
        </p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>Disabled Outline</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox checked />
                  <span className="text-sm">Morning routine completed</span>
                  <Badge variant="outline" className={getStatusColor("done")}>
                    Done
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox />
                  <span className="text-sm">Review project proposal</span>
                  <Badge variant="outline" className={getPriorityColor(4)}>
                    High
                  </Badge>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-[var(--color-text-secondary)]">
                  2 of 3 tasks completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Mood Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">😊</span>
                  <span className="text-sm">Feeling optimistic</span>
                  <Badge variant="outline" className={getMoodColor("optimistic", false)}>
                    Spirit
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💪</span>
                  <span className="text-sm">Energetic</span>
                  <Badge variant="outline" className={getMoodColor("energetic", false)}>
                    Body
                  </Badge>
                </div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  Logged 2 hours ago
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <Input placeholder="Enter task title..." />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="urgent" />
                <label htmlFor="urgent" className="text-sm">Mark as urgent</label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <label htmlFor="notifications" className="text-sm">Enable notifications</label>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Task</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status & Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Task Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor("todo")}>To Do</Badge>
                  <Badge className={getStatusColor("in_progress")}>In Progress</Badge>
                  <Badge className={getStatusColor("done")}>Done</Badge>
                  <Badge className={getStatusColor("archived")}>Archived</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Priority Levels</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getPriorityColor(5)}>Urgent</Badge>
                  <Badge className={getPriorityColor(4)}>High</Badge>
                  <Badge className={getPriorityColor(3)}>Medium</Badge>
                  <Badge className={getPriorityColor(2)}>Low</Badge>
                  <Badge className={getPriorityColor(1)}>Lowest</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Progress Indicators</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Habits</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Goals</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Icons & Colors</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-[var(--color-compassionate-celebration)]" />
                    <span className="text-sm">Celebration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[var(--color-semantic-success-text)]" />
                    <span className="text-sm">Success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[var(--color-interactive-primary)]" />
                    <span className="text-sm">Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    <span className="text-sm">Gentle</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample calendar day */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded p-3 bg-[var(--color-background-secondary)]">
                <div className="text-sm font-medium mb-2">Today</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[var(--color-semantic-success-text)]" />
                    <span className="text-xs">3/4 routines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">😊</span>
                    <span className="text-xs">Great mood</span>
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    2 journal entries
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}