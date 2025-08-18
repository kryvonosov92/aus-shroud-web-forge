import React from "react";
import { Button } from "@/components/ui/button";

type FileUploadButtonProps = {
  onFilesSelected: (files: File[]) => void | Promise<void>;
  accept?: string;
  multiple?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFilesSelected,
  accept,
  multiple,
  children = "Upload",
  className,
  disabled,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await onFilesSelected(files);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <Button type="button" onClick={handleClick} className={className} disabled={disabled}>
        {children}
      </Button>
    </>
  );
};

export default FileUploadButton;

