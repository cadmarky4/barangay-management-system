import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingStateProps {
 message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
 const { t } = useTranslation();
 
 const displayMessage = message || t('common.loading', { defaultValue: 'Loading...' });

 return (
   <main className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
     <div className="text-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-400 mx-auto"></div>
       <p className="mt-2 text-gray-600">{displayMessage}</p>
     </div>
   </main>
 );
};

export default LoadingState;