import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadToAwsMedia } from "@/lib/storage";

export type StandardConfigItem = {
  id: string;
  title: string;
  image: string;
};

interface StandardConfigsEditorProps {
  items: StandardConfigItem[];
  onChange: (next: StandardConfigItem[]) => void;
}

const StandardConfigsEditor: React.FC<StandardConfigsEditorProps> = ({ items, onChange }) => {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addItem = () => {
    const id = Math.random().toString(36).slice(2);
    onChange([...(items || []), { id, title: "", image: "" }]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= next.length) return;
    const [m] = next.splice(index, 1);
    next.splice(newIndex, 0, m);
    onChange(next);
  };

  const updateField = (id: string, field: keyof StandardConfigItem, value: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleUpload = async (id: string, file?: File) => {
    if (!file) return;
    const url = await uploadToAwsMedia(file);
    updateField(id, "image", url);
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex justify-between items-center">
          <div className="font-medium">Standard Configurations</div>
          <Button type="button" size="sm" onClick={addItem}>Add</Button>
        </div>
        <div className="space-y-4">
          {(items || []).map((item, idx) => (
            <div key={item.id} className="p-3 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Title</div>
                  <Input value={item.title} onChange={(e) => updateField(item.id, "title", e.target.value)} placeholder="Configuration title" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Image URL</div>
                  <Input value={item.image} onChange={(e) => updateField(item.id, "image", e.target.value)} placeholder="https://..." />
                  {item.image ? (
                    <img src={item.image} alt={item.title || 'config image'} className="mt-2 h-24 w-24 object-cover rounded border" />
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={(el) => (fileRefs.current[item.id] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(item.id, e.target.files?.[0] || undefined)}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => move(idx, -1)} disabled={idx === 0}>↑</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => move(idx, 1)} disabled={idx === items.length - 1}>↓</Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(item.id)} disabled={!item.title && !item.image}>Remove</Button>
                </div>
              </div>
              {(!item.title || !item.image) && (
                <div className="text-xs text-red-600 mt-2">{!item.title && 'Title is required.'} {!item.image && 'Image is required.'}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardConfigsEditor;

