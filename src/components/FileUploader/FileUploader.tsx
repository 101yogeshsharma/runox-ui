"use client";

import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  forwardRef,
} from "react";
import { UploadCloud, X, File as FileIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../Button";
import { Text } from "../../atoms/Text";
import { Box } from "../../atoms/Box";
import { Image as RunoxImage } from "../Image/Image";
import { Progress } from "../Progress/Progress";
import { rnx } from "../../utils/rnx";
import "./FileUploader.css";
// Uses: Button, Image, Progress

/**
 * Props for the FileUploader component.
 */
export interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
  progresses?: Record<string, number>;
  maxSize?: number;
  onFileRejected?: (file: File, reason: string) => void;
  disabled?: boolean;
}

export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(
  function FileUploader(
    {
      className,
      onFilesChange,
      maxFiles = 0,
      accept,
      multiple = true,
      progresses,
      maxSize,
      onFileRejected,
      disabled,
      ...props
    }: FileUploaderProps,
    ref,
  ) {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);
    // Stable map from file object reference → object URL to avoid creating a new URL every render
    const objectUrlMap = useRef<Map<File, string>>(new Map());

    // Revoke URLs for files that have been removed from the list
    useEffect(() => {
      const currentFiles = new Set(files);
      for (const [file, url] of objectUrlMap.current.entries()) {
        if (!currentFiles.has(file)) {
          URL.revokeObjectURL(url);
          objectUrlMap.current.delete(file);
        }
      }
      // No cleanup return here — returning a cleanup would revoke URLs for
      // files still in the list whenever files changes (e.g. a new file is added)
    }, [files]);

    // Revoke ALL remaining URLs only when the component unmounts
    useEffect(() => {
      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup; the ref map is intentionally not a dependency
        for (const url of objectUrlMap.current.values()) {
          URL.revokeObjectURL(url);
        }
        objectUrlMap.current.clear();
      };
    }, []);

    const getPreviewUrl = (file: File): string | null => {
      if (!file.type.startsWith("image/")) return null;
      if (!objectUrlMap.current.has(file)) {
        objectUrlMap.current.set(file, URL.createObjectURL(file));
      }
      return objectUrlMap.current.get(file)!;
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const validateFile = useCallback(
      (file: File): string | null => {
        if (maxSize && file.size > maxSize) {
          return `File size exceeds the limit of ${formatFileSize(maxSize)}`;
        }
        if (accept) {
          const acceptList = accept
            .split(",")
            .map((a) => a.trim().toLowerCase());
          const fileType = file.type.toLowerCase();
          const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

          const isAccepted = acceptList.some((a) => {
            if (a.startsWith(".")) return fileExtension === a;
            if (a.endsWith("/*"))
              return fileType.startsWith(a.replace("/*", ""));
            return fileType === a;
          });
          if (!isAccepted)
            return `File type ${fileType || fileExtension} not supported`;
        }
        return null;
      },
      [maxSize, accept],
    );

    const handleFiles = useCallback(
      (newFiles: FileList | File[]) => {
        if (disabled) return;
        const fileArray = Array.from(newFiles);

        const validFiles: File[] = [];
        fileArray.forEach((file) => {
          const error = validateFile(file);
          if (error) {
            onFileRejected?.(file, error);
          } else {
            validFiles.push(file);
          }
        });

        if (validFiles.length === 0) return;

        if (!multiple && validFiles.length > 1) {
          validFiles.splice(1); // keep only the first file
        }

        setFiles((prev) => {
          let updated = multiple ? [...prev, ...validFiles] : [...validFiles];
          if (maxFiles > 0 && updated.length > maxFiles) {
            updated = updated.slice(0, maxFiles);
          }
          onFilesChange?.(updated);
          return updated;
        });
      },
      [
        disabled,
        maxFiles,
        multiple,
        onFilesChange,
        validateFile,
        onFileRejected,
      ],
    );

    const onDragOver = (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragActive(true);
    };

    const onDragLeave = () => {
      if (disabled) return;
      setIsDragActive(false);
    };

    const onDrop = (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    };

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      // Reset so the same file can be re-selected after removal
      e.target.value = "";
    };

    const inputRef = useRef<HTMLInputElement>(null);

    const removeFile = (index: number) => {
      if (disabled) return;
      setFiles((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        onFilesChange?.(updated);
        return updated;
      });
    };

    return (
      <Box
        {...rnx({
          component: "FileUploader",
          state: disabled ? "disabled" : "active",
        })}
        className={cn("w-full space-y-4", className)}
        {...props}
      >
        <Box
          className={cn(
            "rnx-file-uploader-dropzone relative flex w-full cursor-pointer flex-col items-center justify-center p-6",
            isDragActive && "rnx-file-uploader-dropzone--active",
          )}
          role="button"
          aria-label="Upload files"
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            onChange={onFileInputChange}
          />
          <UploadCloud className="rnx-file-uploader-icon mb-3 h-10 w-10" />
          <Text as="p" variant="body" className="mb-1 text-sm font-semibold">
            Click to upload or drag and drop
          </Text>
          <Text
            as="p"
            variant="body"
            className="rnx-file-uploader-text-muted text-xs"
          >
            {accept
              ? `Accepted formats: ${accept}`
              : "Any file format accepted"}
          </Text>
        </Box>

        {files.length > 0 && (
          <Box className="space-y-2">
            {files.map((file, i) => {
              const previewUrl = getPreviewUrl(file);

              return (
                <Box
                  key={`${file.name}-${i}`}
                  className="rnx-file-uploader-item flex items-center justify-between p-3"
                >
                  <Box className="flex items-center space-x-3 overflow-hidden">
                    <Box className="rnx-file-uploader-icon-wrapper flex h-10 w-10 flex-shrink-0 items-center justify-center">
                      {previewUrl ? (
                        <RunoxImage
                          src={previewUrl}
                          alt={file.name}
                          className="rnx-file-uploader-image h-full w-full object-cover"
                        />
                      ) : (
                        <FileIcon className="rnx-file-uploader-icon h-5 w-5" />
                      )}
                    </Box>
                    <Box className="flex min-w-0 flex-col">
                      <Box as="span" className="truncate text-sm font-medium">
                        {file.name}
                      </Box>
                      <Box
                        as="span"
                        className="rnx-file-uploader-text-muted text-xs"
                      >
                        {formatFileSize(file.size)}
                      </Box>
                    </Box>
                  </Box>
                  <Box className="flex items-center space-x-3">
                    {progresses && progresses[file.name] !== undefined && (
                      <Progress
                        value={progresses[file.name]}
                        className="h-2 w-24"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rnx-file-uploader-remove-btn flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        removeFile(i);
                      }}
                      disabled={disabled}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
);
FileUploader.displayName = "FileUploader";
