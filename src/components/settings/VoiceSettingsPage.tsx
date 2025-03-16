import React, { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedVoice, setSettingsActive } from '@/store/settingsSlice';
import { Button } from '@/components/ui/button';
import { Play, Check, ArrowLeft, Square } from 'lucide-react';

const VoiceSettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedVoice, voiceOptions } = useAppSelector((state) => state.settings);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element on component mount
  React.useEffect(() => {
    audioRef.current = new Audio();
    
    // Clean up audio element on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  const handleCloseSettings = () => {
    dispatch(setSettingsActive(false));
  };
  const [currentVoice, setCurrentVoice] = useState(selectedVoice);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  
  const handleVoiceSelect = (voiceId: string) => {
    setCurrentVoice(voiceId);
  };
  
  const handlePlayVoice = (voiceId: string, e: React.MouseEvent) => {
    // Prevent the click from selecting the voice
    e.stopPropagation();
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Find the voice sample URL from the voice options
    const voice = voiceOptions.find(v => v.id === voiceId);
    if (!voice || !voice.preview) {
      console.error('Voice sample URL not found');
      return;
    }
    
    // Set the audio source and play
    if (audioRef.current) {
      audioRef.current.src = voice.preview;
      
      // Update UI state when playing starts
      setPlayingVoice(voiceId);
      
      // Play the audio
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setPlayingVoice(null);
      });
      
      // Update UI state when playing ends
      audioRef.current.onended = () => {
        setPlayingVoice(null);
      };
    }
  };
  
  const handleStopVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingVoice(null);
    }
  };
  
  const handleSaveVoice = () => {
    dispatch(setSelectedVoice(currentVoice));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium"> <ArrowLeft className="h-4 w-4 mr-2 inline" onClick={handleCloseSettings} /> Bond Chat Voice Settings</h3>
      </div>
      
      <p className="text-muted-foreground">
        Choose a voice that will be used when your messages are read aloud in Bond Chat.
      </p>
      
      <div className="space-y-3">
        {voiceOptions.map((voice) => (
          <div 
            key={voice.id}
            className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${
              currentVoice === voice.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
            }`}
            onClick={() => handleVoiceSelect(voice.id)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${currentVoice === voice.id ? 'bg-primary' : 'border border-muted-foreground'}`}></div>
              <span className={`font-medium ${currentVoice === voice.id ? 'text-primary' : ''}`}>
                {voice.name}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => playingVoice === voice.id ? handleStopVoice(e) : handlePlayVoice(voice.id, e)}
            >
              {playingVoice === voice.id ? (
                <span className="flex items-center">
                  <Square className="h-4 w-4 mr-1" /> Stop
                </span>
              ) : (
                <span className="flex items-center">
                  <Play className="h-4 w-4 mr-1" /> Preview
                </span>
              )}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveVoice}
          disabled={currentVoice === selectedVoice}
          className="cursor-pointer"
        >
          <Check className="h-4 w-4 mr-2" />
          Save Voice Setting
        </Button>
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-md">
        <h4 className="font-medium mb-2">About Bond Chat Voice</h4>
        <p className="text-sm text-muted-foreground">
          Bond Chat uses text-to-speech technology to read messages aloud. 
          Your selected voice will be used when your messages are read to other users.
          This feature can be disabled in the Bond Chat settings.
        </p>
      </div>
    </div>
  );
};

export default VoiceSettingsPage; 