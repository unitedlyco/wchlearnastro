// Toast types
type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast options
interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  title?: string;
}

// Extend the Window interface
interface Window {
  showToast: (options: ToastOptions) => void;
} 