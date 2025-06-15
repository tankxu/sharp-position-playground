
import React, { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadPanelProps {
  onImageSelected: (file: File, url: string) => void;
  loading: boolean;
}

const ImageUploadPanel: React.FC<ImageUploadPanelProps> = ({
  onImageSelected,
  loading,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Drag-and-drop handlers
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const url = URL.createObjectURL(file);
        onImageSelected(file, url);
      }
    },
    [onImageSelected]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        onImageSelected(file, url);
      }
    },
    [onImageSelected]
  );

  const handleFetchRandom = async () => {
    // Fetch image blob from picsum
    const resp = await fetch("https://picsum.photos/1920/1080?random");
    const blob = await resp.blob();
    const file = new File([blob], "random.jpg", { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    onImageSelected(file, url);
  };

  return (
    <div className="bg-white rounded-l-xl h-full p-10 flex flex-col gap-8">
      <div className="mb-12">
        <h1 className="text-2xl font-bold mb-2">Sharp Resize Position Demo</h1>
        <p className="text-muted-foreground text-sm">
          Upload an image or fetch a random one, then preview how <b>sharp</b> resizes it by different <span className="font-mono">position</span> options.
        </p>
      </div>
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-primary flex flex-col items-center justify-center py-12 px-5 transition-colors"
        style={{ minHeight: 160 }}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="image/*"
          onChange={onChange}
          disabled={loading}
        />
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >{loading ? "Loading..." : "Upload Image"}</Button>
        <span className="mt-3 text-sm text-muted-foreground">or drag and drop here</span>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleFetchRandom}
        disabled={loading}
      >{loading ? "Loading..." : "Fetch Random Image"}</Button>
      <div className="flex-1" />
      <div className="text-xs text-muted-foreground">
        Powered by <a href="https://sharp.pixelplumbing.com/" target="_blank" rel="noreferrer" className="underline">sharp</a> and Node.js backend.<br />
        <a href="https://github.com/lovell/sharp" target="_blank" className="text-gray-600 hover:underline">See sharp documentation &rarr;</a>
      </div>
    </div>
  );
};

export default ImageUploadPanel;
