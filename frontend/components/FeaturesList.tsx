import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "../constants/features";

export function FeaturesList() {
  return (
    <Card className="bg-white/50">
      <CardHeader>
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-200">
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
