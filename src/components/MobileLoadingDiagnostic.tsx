
import React, { useEffect, useState } from 'react';

interface MobileLoadingDiagnosticProps {
  children: React.ReactNode;
}

const MobileLoadingDiagnostic: React.FC<MobileLoadingDiagnosticProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string[]>([]);

  useEffect(() => {
    const diagnostics: string[] = [];
    
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    diagnostics.push(`Mobile device: ${isMobile}`);
    
    // Check viewport
    diagnostics.push(`Viewport: ${window.innerWidth}x${window.innerHeight}`);
    
    // Check if React is loaded
    diagnostics.push(`React loaded: ${typeof React !== 'undefined'}`);
    
    // Check if modules are supported
    diagnostics.push(`ES modules supported: ${typeof document.createElement('script').noModule !== 'undefined'}`);
    
    setDiagnosticInfo(diagnostics);
    
    // Simulate loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="text-lg font-semibold mb-2">Loading Natty or Juicy...</h2>
        <div className="text-sm text-muted-foreground text-center max-w-sm">
          {diagnosticInfo.map((info, index) => (
            <p key={index}>{info}</p>
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileLoadingDiagnostic;
