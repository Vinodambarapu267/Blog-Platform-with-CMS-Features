import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageDropzone({ onFileSelected }: { onFileSelected?: (file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setPreview(URL.createObjectURL(file));
      onFileSelected?.(file);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-white/10">
        <img src={preview} alt="Cover preview" className="h-48 w-full object-cover" />
        <button
          onClick={() => setPreview(null)}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur hover:bg-black/80"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-white/15 hover:border-white/25 hover:bg-white/[0.02]"
      )}
    >
      <input {...getInputProps()} />
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-text-muted">
        <ImagePlus className="h-4 w-4" />
      </span>
      <p className="text-sm text-text-secondary">
        {isDragActive ? "Drop the image here" : "Drag & drop a cover image, or click to browse"}
      </p>
      <p className="text-xs text-text-muted">PNG, JPG, or WEBP up to 5MB</p>
    </div>
  );
}
