import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  icon?: React.ComponentType<{ className?: string }>;
  onReset?: () => void;
}

export class FeatureErrorBoundary extends React.Component<FeatureErrorBoundaryProps, FeatureErrorBoundaryState> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.featureName}:`, error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const Icon = this.props.icon || AlertTriangle;
      
      return (
        <Card className="bg-red-50/50 border-red-200 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Icon className="h-5 w-5" />
              {this.props.featureName} Temporarily Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">
              We're having trouble loading the {this.props.featureName.toLowerCase()} feature right now. 
              Don't worry - your data is safe and other features are still working.
            </p>
            
            <div className="bg-red-100 p-3 rounded-lg">
              <p className="text-sm text-red-600 font-medium mb-2">What you can do:</p>
              <ul className="text-sm text-red-600 space-y-1">
                <li>• Try refreshing this feature using the button below</li>
                <li>• Continue using other tabs - they're working fine</li>
                <li>• Check back in a few minutes</li>
              </ul>
            </div>

            {this.state.error && (
              <details className="text-sm">
                <summary className="text-red-600 cursor-pointer font-medium">
                  Technical details (for troubleshooting)
                </summary>
                <pre className="text-xs text-red-500 mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.error.stack && '\n\n' + this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={this.resetError} 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
