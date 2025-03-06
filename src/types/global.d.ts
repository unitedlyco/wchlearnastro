// Global type definitions

interface Window {
  showToast?: (options: {
    type: 'success' | 'error' | 'info' | 'warning';
    title?: string;
    message: string;
    duration?: number;
    icon?: string;
  }) => void;
} 