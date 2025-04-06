export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export const useToast = () => {
  const toast = (options: ToastOptions) => {
    // For now, just console.log the toast message
    console.log("Toast:", options);
  };

  return { toast };
};
