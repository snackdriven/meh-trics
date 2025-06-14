import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "../constants/features";

export function FeaturesList() {
  return (
    <Card className="bg-white/50">
      <CardHeader>
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4 text-gray-700 dark:text-gray-200">
          {features.map((group) => (
            <li key={group.name} className="space-y-1">
              <div className="font-medium">{group.name}</div>
              <ul className="list-disc pl-5 space-y-1">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
