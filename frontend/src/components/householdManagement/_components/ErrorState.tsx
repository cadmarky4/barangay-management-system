import React from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  error: any;
  onRetry?: () => void;
  onBack?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onBack }) => {
  const { t } = useTranslation();

  const getErrorMessage = () => {
    if (!error) return t('common.errors.unableToLoadData', { defaultValue: 'Unable to load data.' });
    
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      return t('common.errors.resourceNotFound', { 
        defaultValue: 'The requested resource was not found.' 
      });
    }
    
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return t('common.errors.networkError', {
        defaultValue: 'Unable to connect to server. Please check your connection.'
      });
    }
    
    if (error?.message?.includes('Invalid') || error?.message?.includes('invalid')) {
      return error.message;
    }
    
    return t('common.errors.genericError', { 
      defaultValue: 'An error occurred while loading data.' 
    });
  };

  const isNotFound = error?.message?.includes('404') || error?.message?.includes('not found');

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="text-center max-w-md">
        <div className="mb-6">
          {isNotFound ? (
            <>
              <h1 className="text-6xl font-bold text-gray-400 mb-2">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                {t('common.errors.notFound', { defaultValue: 'Not Found' })}
              </h2>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                {t('common.errors.error', { defaultValue: 'Error' })}
              </h2>
            </>
          )}
          <p className="text-gray-600 mb-6">{getErrorMessage()}</p>
        </div>
        <div className="space-y-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-full px-6 py-3 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
            >
              {t('common.actions.goBack', { defaultValue: 'Go Back' })}
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              {t('common.actions.tryAgain', { defaultValue: 'Try Again' })}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default ErrorState;