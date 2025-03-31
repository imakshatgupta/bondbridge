// Type declarations for Web Speech API
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

// Add these to the global Window interface
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

// Active recognition instances tracker
let activeRecognitionInstances: SpeechRecognition[] = [];

// Helper function to register an active recognition instance
export const registerRecognitionInstance = (instance: SpeechRecognition): void => {
  activeRecognitionInstances.push(instance);
};

// Helper function to unregister a recognition instance
export const unregisterRecognitionInstance = (instance: SpeechRecognition): void => {
  activeRecognitionInstances = activeRecognitionInstances.filter(i => i !== instance);
};

// Helper function to stop all active recognition instances
export const stopAllRecognitionInstances = (): void => {
  activeRecognitionInstances.forEach(instance => {
    try {
      instance.stop();
    } catch (error) {
      console.error('Error stopping speech recognition instance:', error);
    }
  });
  activeRecognitionInstances = [];
};

// Function to add cleanup to route change events
export const setupSpeechRecognitionCleanup = (): void => {
  // This can be called from your app's main component
  const handleRouteChange = () => {
    stopAllRecognitionInstances();
  };
  
  // For React Router, you would use a listener or hook
  // For Next.js, you would use router.events.on('routeChangeStart', handleRouteChange)
  
  // For a general solution that works in most cases
  window.addEventListener('beforeunload', handleRouteChange);
  
  // Some SPAs might use popstate for navigation
  window.addEventListener('popstate', handleRouteChange);
}; 