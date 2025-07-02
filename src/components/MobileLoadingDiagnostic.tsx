
import React, { useEffect, useState } from 'react';

interface MobileLoadingDiagnosticProps {
  children: React.ReactNode;
}

const MobileLoadingDiagnostic: React.FC<MobileLoadingDiagnosticProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="text-lg font-semibold mb-2">Loading...</h2>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileLoadingDiagnostic;
