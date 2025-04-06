// Allowed file types and their corresponding MIME types
export const ALLOWED_FILE_TYPES = {
  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",

  // Images
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",

  // Spreadsheets
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // Presentations
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

// Maximum file size in bytes (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// File validation errors
export enum FileValidationError {
  TYPE_NOT_ALLOWED = "File type not allowed",
  SIZE_TOO_LARGE = "File size exceeds limit",
  EMPTY_FILE = "File is empty",
  CORRUPTED = "File appears to be corrupted",
}

/**
 * Check if a file type is allowed
 */
export function isAllowedFileType(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension) return false;

  const allowedMimeTypes = Object.values(ALLOWED_FILE_TYPES);
  return allowedMimeTypes.includes(file.type);
}

/**
 * Validate a file
 */
export function validateFile(file: File): {
  isValid: boolean;
  error?: FileValidationError;
} {
  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: FileValidationError.EMPTY_FILE };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: FileValidationError.SIZE_TOO_LARGE };
  }

  // Check file type
  if (!isAllowedFileType(file)) {
    return { isValid: false, error: FileValidationError.TYPE_NOT_ALLOWED };
  }

  return { isValid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
