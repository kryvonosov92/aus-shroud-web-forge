import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Specifications {
  overview?: Record<string, string>;
  applications?: Record<string, string>;
  dimensions?: Record<string, string>;
  warranty?: Record<string, string>;
}

interface SpecificationsEditorProps {
  value: Specifications | null;
  onChange: (v: Specifications | null) => void;
}

const sectionFields: Record<keyof Specifications, string[]> = {
  overview: ["category", "profile", "windRating", "material", "profileDepth", "standardProfileDepth", "profileSlope", "fixingFlange"],
  applications: ["usage", "exterior"],
  dimensions: ["maxHeight", "maxWidth", "density", "materialWeight", "AS1530_3", "curvedProfiles"],
  warranty: ["term", "coverage"],
};

const SpecificationsEditor: React.FC<SpecificationsEditorProps> = ({ value, onChange }) => {
  const updateField = (section: keyof Specifications, key: string, val: string) => {
    const next = { ...(value || {}) } as Specifications;
    const sec = { ...(next[section] || {}) } as Record<string, string>;
    sec[key] = val;
    (next as any)[section] = sec;
    onChange(next);
  };

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {Object.entries(sectionFields).map(([sectionKey, keys]) => (
          <div key={sectionKey} className="space-y-3">
            <div className="font-medium capitalize">{sectionKey}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keys.map((k) => (
                <div key={k}>
                  <div className="text-xs text-muted-foreground mb-1">{k}</div>
                  <Input
                    value={(value as any)?.[sectionKey]?.[k] || ""}
                    onChange={(e) => updateField(sectionKey as keyof Specifications, k, e.target.value)}
                    placeholder={k}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SpecificationsEditor;

