import { ImagePlus, Lock, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";

export const Dropzone = ({ files, onChange, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (incomingFiles) => {
    if (disabled) return;
    const filtered = Array.from(incomingFiles).filter((file) => file.type.startsWith("image/"));
    onChange([...(files ?? []), ...filtered].slice(0, 4));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(event.dataTransfer.files);
  };

  const removeFile = (fileName) => {
    if (disabled) return;
    onChange(files.filter((file) => file.name !== fileName));
  };

  return (
    <div>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-[30px] border border-dashed p-8 text-center transition ${
          disabled ? "cursor-not-allowed border-border/15 bg-surface/20 opacity-55" : isDragging ? "cursor-pointer border-primary bg-primary/10" : "cursor-pointer border-border/20 bg-surface/35"
        }`}
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/12 text-primary">
          {disabled ? <Lock className="h-7 w-7" /> : isDragging ? <UploadCloud className="h-7 w-7" /> : <ImagePlus className="h-7 w-7" />}
        </div>
        <h4 className="font-display text-xl font-semibold">Drag and drop issue images</h4>
        <p className="mt-2 max-w-md text-sm leading-7 text-muted">
          {disabled ? "Log in first to upload photos with your report." : "Add up to four photos. The backend will determine priority automatically, so the citizen only needs to capture the situation clearly."}
        </p>
        <input type="file" accept="image/*" multiple disabled={disabled} className="hidden" onChange={(event) => addFiles(event.target.files ?? [])} />
      </label>

      {files.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {files.map((file) => (
            <div key={file.name} className="glass-panel rounded-[24px] p-3">
              <img src={URL.createObjectURL(file)} alt={file.name} className="h-40 w-full rounded-[18px] object-cover" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="truncate text-sm text-muted">{file.name}</p>
                <button type="button" disabled={disabled} onClick={() => removeFile(file.name)} className="rounded-full p-2 text-muted transition hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
