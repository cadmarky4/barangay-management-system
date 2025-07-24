// ============================================================================
// components/__shared/ErrorDisplay.tsx - Reusable error display component
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiAlertTriangle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onBack?: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  onBack,
  onRetry,
  showRetry = true,
  className = ''
}) => {
  const { t } = useTranslation();

  const defaultTitle = title || t('common.error.title');
  const defaultMessage = message || t('common.error.message');

  return (
    <main className={`p-6 bg-gray-50 min-h-screen flex justify-center items-center ${className}`}>
      <div className="text-center max-w-md w-full">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Error Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {defaultTitle}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            {defaultMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-full px-6 py-3 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors flex items-center justify-center space-x-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>{t('common.actions.goBack')}</span>
            </button>
          )}
          
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>{t('common.actions.tryAgain')}</span>
            </button>
          )}
        </div>

        {/* Additional Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>{t('common.error.helpText')}</p>
        </div>
      </div>
    </main>
  );
};

// ============================================================================
// Specialized Error Components
// ============================================================================

interface NotFoundErrorProps {
  entityName?: string;
  onBack?: () => void;
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({ 
  entityName = 'item', 
  onBack 
}) => {
  const { t } = useTranslation();
  
  return (
    <ErrorDisplay
      title="404"
      message={t('common.error.notFound', { entity: entityName })}
      onBack={onBack}
      showRetry={false}
    />
  );
};

interface NetworkErrorProps {
  onRetry?: () => void;
  onBack?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ 
  onRetry, 
  onBack 
}) => {
  const { t } = useTranslation();
  
  return (
    <ErrorDisplay
      title={t('common.error.networkTitle')}
      message={t('common.error.networkMessage')}
      onBack={onBack}
      onRetry={onRetry}
      showRetry={true}
    />
  );
};

interface UnauthorizedErrorProps {
  onBack?: () => void;
}

export const UnauthorizedError: React.FC<UnauthorizedErrorProps> = ({ 
  onBack 
}) => {
  const { t } = useTranslation();
  
  return (
    <ErrorDisplay
      title={t('common.error.unauthorizedTitle')}
      message={t('common.error.unauthorizedMessage')}
      onBack={onBack}
      showRetry={false}
    />
  );
};

// ============================================================================
// Error Boundary Component
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <ErrorDisplay
          title="Something went wrong"
          message="An unexpected error occurred. Please try refreshing the page."
          onRetry={this.resetError}
          showRetry={true}
        />
      );
    }

    return this.props.children;
  }
}