import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ColourOptions {
  systems?: string[];
  properties?: Record<string, string>;
}

interface ColourOptionsEditorProps {
  value: ColourOptions | null;
  onChange: (v: ColourOptions | null) => void;
}

const ColourOptionsEditor: React.FC<ColourOptionsEditorProps> = ({ value, onChange }) => {
  const addSystem = () => {
    const next = { ...(value || {}), systems: [ ...((value?.systems)||[]), "" ] } as ColourOptions;
    onChange(next);
  };
  const updateSystem = (idx: number, val: string) => {
    const list = [ ...((value?.systems)||[]) ];
    list[idx] = val;
    onChange({ ...(value||{}), systems: list });
  };
  const removeSystem = (idx: number) => {
    const list = [ ...((value?.systems)||[]) ];
    list.splice(idx, 1);
    onChange({ ...(value||{}), systems: list });
  };
  const updateProp = (key: string, val: string) => {
    const props = { ...((value?.properties)||{}) } as Record<string, string>;
    props[key] = val;
    onChange({ ...(value||{}), properties: props });
  };

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <div className="font-medium">Powder Coating Systems</div>
          <div className="space-y-2">
            {(value?.systems||[]).map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input value={s} onChange={(e)=>updateSystem(idx, e.target.value)} placeholder="System name" />
                <Button type="button" variant="destructive" size="sm" onClick={()=>removeSystem(idx)}>Remove</Button>
              </div>
            ))}
            <Button type="button" size="sm" onClick={addSystem}>Add System</Button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="font-medium">Coating Properties</div>
          {Object.entries(value?.properties||{ VOCEmissions: "", materialUtilisation: "", ecoFriendly: "", residentialUse: "", commercialUse: "", colourRange: "", customFinishes: "" }).map(([k,v]) => (
            <div key={k}>
              <div className="text-xs text-muted-foreground mb-1">{k}</div>
              <Input value={v} onChange={(e)=>updateProp(k, e.target.value)} placeholder={k} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ColourOptionsEditor;

