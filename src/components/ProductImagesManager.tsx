import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductImagesManagerProps {
  images: string[];
  onChange: (nextImages: string[]) => void;
  onUploadFiles?: (files: File[]) => Promise<string[]>; // returns public URLs
  onDeleteImage?: (url: string) => Promise<void>;
}

const ProductImagesManager: React.FC<ProductImagesManagerProps> = ({ images, onChange, onUploadFiles, onDeleteImage }) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!onUploadFiles) return;
    const uploaded = await onUploadFiles(Array.from(files));
    if (uploaded && uploaded.length) onChange([...(images || []), ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (idx: number) => {
    const target = images[idx];
    if (onDeleteImage) await onDeleteImage(target);
    const next = [...images];
    next.splice(idx, 1);
    onChange(next);
  };

  const onDragStart = (idx: number) => setDragIndex(idx);
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    setDragIndex(null);
    onChange(next);
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">Drag images to reorder. First image is featured.</div>
          <div>
            <input ref={inputRef} type="file" multiple accept="image/*" onChange={(e) => handleFilesSelected(e.target.files)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {(images || []).map((url, idx) => (
            <div
              key={url}
              className={`relative w-28 h-28 border rounded overflow-hidden ${idx === 0 ? 'ring-2 ring-primary' : ''}`}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(idx)}
              title={idx === 0 ? 'Featured image' : 'Drag to reorder'}
            >
              <img src={url} alt={`Image ${idx + 1}`} className="object-cover w-full h-full" />
              <Button size="icon" variant="destructive" className="absolute top-1 right-1" onClick={() => handleDelete(idx)}>
                ×
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImagesManager;

