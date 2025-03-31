import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Pencil, Trash2, Image, Smile, Video, Mic } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { createPost, rewriteWithBondChat } from '../apis/commonApiCalls/createPostApi';
import { useApiCall } from '../apis/globalCatchError';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { useAppSelector } from '../store';
import { 
  SpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent,
  registerRecognitionInstance,
  unregisterRecognitionInstance
} from '../types/speech-recognition';

interface CreatePostProps {
  onSubmit?: (content: string, media?: File[]) => void;
}

const CreatePost = ({ onSubmit }: CreatePostProps) => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const recognitionActiveRef = useRef(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  
  
  // Get the current user's avatar from Redux store
  const { avatar, nickname } = useAppSelector(state => state.currentUser);
  
  // Use the API call hook for the createPost function
  const [executeCreatePost, isCreatingPost] = useApiCall(createPost);
  // Use the API call hook for the rewriteWithBondChat function
  const [executeRewriteWithBondChat, isRewritingWithBondChat] = useApiCall(rewriteWithBondChat);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...mediaFiles, ...files].slice(0, 4);
    
    setMediaFiles(newFiles);
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  };

  // const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || []);
  //   setDocumentFiles(prev => [...prev, ...files]);
  // };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRewriteWithBondChat = async () => {
    // Only proceed if there's content to rewrite
    if (!content.trim()) {
      toast.error('Please add some text to rewrite');
      return;
    }
    
    // Execute the API call with error handling
    const { data, success } = await executeRewriteWithBondChat(content);
    
    if (success && data) {
      // Update the content with the rewritten text
      setContent(data.rewritten);
    }
  };

  // Initialize speech recognition on component mount
  useEffect(() => {
    // Get the correct Speech Recognition API based on browser
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported by this browser');
      return;
    }
    
    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    recognitionInstance.onstart = () => {
      setIsListening(true);
      registerRecognitionInstance(recognitionInstance);
    };
    
    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setContent(transcript);
    };
    
    recognitionInstance.onend = () => {
      // Recognition has ended, update our active flag
      recognitionActiveRef.current = false;
      unregisterRecognitionInstance(recognitionInstance);
      if (isListening) {
        // Try to restart the recognition if it ended automatically and we're still in listening mode
        setTimeout(() => {
          if (isListening && !recognitionActiveRef.current && recognitionInstance) {
            try {
              recognitionInstance.start();
              registerRecognitionInstance(recognitionInstance);
              recognitionActiveRef.current = true;
            } catch (error) {
              console.error('Error restarting speech recognition:', error);
              setIsListening(false);
            }
          }
        }, 100);
      }
    };
    
    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      recognitionActiveRef.current = false;
      setIsListening(false);
      unregisterRecognitionInstance(recognitionInstance);
    };
    
    setRecognition(recognitionInstance);
    
    // Cleanup function
    return () => {
      if (recognitionInstance && recognitionActiveRef.current) {
        try {
          recognitionInstance.stop();
          unregisterRecognitionInstance(recognitionInstance);
          recognitionActiveRef.current = false;
          setIsListening(false);
        } catch (error) {
          console.error('Error stopping speech recognition on unmount:', error);
        }
      }
    };
  }, []); // Empty dependency array to initialize once

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isListening) {
      // Stop listening
      try {
        recognition.stop();
        unregisterRecognitionInstance(recognition);
        recognitionActiveRef.current = false;
        setIsListening(false);
        // toast.info('Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    } else {
      // Start listening
      try {
        recognition.start();
        registerRecognitionInstance(recognition);
        recognitionActiveRef.current = true;
        setIsListening(true);
        // toast.success('Listening... speak now');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        // toast.error('Failed to start speech recognition');
      }
    }
  };

  const handleSubmit = async () => {
    console.log("mediaFiles: ", mediaFiles);
    console.log("documentFiles: ", documentFiles);
    if (content.trim() || mediaFiles.length > 0 || documentFiles.length > 0) {
      setIsSubmitting(true);
      
      // Prepare the post data
      const postData = {
        content: content.trim(),
        whoCanComment: 1, // Default value
        privacy: 1, // Default value
        image: mediaFiles,
        document: documentFiles
      };
      
      // Execute the API call with error handling
      const { data, success } = await executeCreatePost(postData);
      
      if (success && data) {
        // Show success message
        toast.success('Post created successfully!');
        
        // Clear form after successful submission
        setContent('');
        setMediaFiles([]);
        setMediaPreviews([]);
        setDocumentFiles([]);
        
        // Call the onSubmit prop if provided
        onSubmit?.(content, [...mediaFiles, ...documentFiles]);
        navigate('/');
      }
      
      setIsSubmitting(false);
    } else {
      toast.error('Please add some content to your post');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showPicker && 
        emojiPickerRef.current && 
        emojiButtonRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    // Use mousedown instead of click to handle the event before the emoji picker's click event
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] rounded-lg p-6">
      <div className="flex items-start gap-3 pb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar || "/activity/cat.png"} alt={nickname || "Profile"} />
          <AvatarFallback>{nickname ? nickname[0].toUpperCase() : "U"}</AvatarFallback>
        </Avatar>

        

        <div className="flex items-center gap-6 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--muted-foreground)] px-8 border cursor-pointer"
            onClick={() => navigate('/')}
            disabled={isSubmitting || isCreatingPost}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-primary px-10 hover:bg-primary/90 text-primary-foreground cursor-pointer"
            onClick={handleSubmit}
            disabled={isSubmitting || isCreatingPost}
          >
            {isSubmitting || isCreatingPost ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>

      

      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={toggleSpeechRecognition}
              type="button"
              className={`hover:opacity-75 transition-opacity cursor-pointer ${isListening ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}
            >
              <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
            </button>
          </div>
          <label className="cursor-pointer hover:opacity-75 transition-opacity">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleMediaUpload}
            />
            <Video size={20} className="text-[var(--foreground)]" />
          </label>
          <label className="cursor-pointer hover:opacity-75 transition-opacity">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMediaUpload}
            />
            <Image size={20} className="text-[var(--foreground)]" />
          </label>
          <div className="relative">
            <button 
              ref={emojiButtonRef}
              onClick={() => setShowPicker(!showPicker)}
              type="button"
              className="hover:opacity-75 transition-opacity cursor-pointer"
            >
              <Smile size={20} className="text-[var(--foreground)]" />
            </button>
            {showPicker && (
              <div ref={emojiPickerRef} className='absolute z-50'>
                <EmojiPicker 
                  onEmojiClick={(emojiObject) => {
                    setContent(prevContent => prevContent + emojiObject.emoji);
                    setShowPicker(false);
                  }}
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>
                  


          
          
          
        </div>

        <div className=" flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1 bg-[var(--secondary)] cursor-pointer"
            onClick={handleRewriteWithBondChat}
            disabled={isRewritingWithBondChat}
          >
            {isRewritingWithBondChat ? (
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent"></div>
                <span className="text-[var(--foreground)]">Rewriting...</span>
              </div>
            ) : (
              <>
                <img src="/bondchat.svg" alt="BondChat" className="w-4 h-4" />
                <div className='text-[var(--foreground)]'>Re-write with <span className='text-[var(--primary)]'>BondChat </span></div>
              </>
            )}
          </Button>
        </div>


      </div>

      <Separator className="my-3 bg-[var(--border)]" />

      <div className="flex-1">
          {isRewritingWithBondChat ? (
            <div className="w-full animate-pulse pb-2">
              <div className="h-6 bg-[var(--secondary)] rounded mb-2 w-3/4"></div>
              <div className="h-6 bg-[var(--secondary)] rounded mb-2 w-5/6"></div>
              <div className="h-6 bg-[var(--secondary)] rounded w-2/3"></div>
            </div>
          ) : (
            <TextareaAutosize
              placeholder="What's on your mind..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent outline-none resize-none text-sm h-auto"
              maxRows={20}
            />
          )}

          {mediaPreviews.length > 0 && (
            <div className="relative mt-2 rounded-md overflow-hidden">
              <div className={`grid gap-1 ${
                mediaPreviews.length === 1 ? 'grid-cols-1' : 
                mediaPreviews.length === 2 ? 'grid-cols-2' :
                'grid-cols-[2fr_1fr]'
              }`}>
                <div className={`relative ${mediaPreviews.length > 2 ? 'row-span-2' : ''}`}>
                  {mediaFiles[0]?.type.startsWith('video/') ? (
                    <video 
                      src={mediaPreviews[0]} 
                      className="w-full h-full object-cover"
                      style={{ maxHeight: mediaPreviews.length === 1 ? '400px' : '300px' }}
                      controls
                    />
                  ) : (
                    <img 
                      src={mediaPreviews[0]} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      style={{ maxHeight: mediaPreviews.length === 1 ? '400px' : '300px' }}
                    />
                  )}
                  <MediaControls onRemove={() => handleRemoveMedia(0)} />
                </div>

                {mediaPreviews.length > 1 && (
                  <div className="relative">
                    {mediaFiles[1]?.type.startsWith('video/') ? (
                      <video 
                        src={mediaPreviews[1]} 
                        className="w-full h-full object-cover"
                        style={{ height: '150px' }}
                        controls
                      />
                    ) : (
                      <img 
                        src={mediaPreviews[1]} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        style={{ height: '150px' }}
                      />
                    )}
                    <MediaControls onRemove={() => handleRemoveMedia(1)} />
                  </div>
                )}

                {mediaPreviews.length > 2 && (
                  <div className="relative">
                    {mediaFiles[2]?.type.startsWith('video/') ? (
                      <video 
                        src={mediaPreviews[2]} 
                        className="w-full h-full object-cover"
                        style={{ height: '150px' }}
                        controls
                      />
                    ) : (
                      <img 
                        src={mediaPreviews[2]} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        style={{ height: '150px' }}
                      />
                    )}
                    <MediaControls onRemove={() => handleRemoveMedia(2)} />
                    
                    {mediaPreviews.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                          +{mediaPreviews.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {documentFiles.length > 0 && (
            <div className="mt-2 space-y-2">
              {documentFiles.map((file, index) => (
                <div key={index} className="p-2 bg-[var(--secondary)] rounded-md flex justify-between items-center">
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {file.name}
                  </span>
                  <button
                    onClick={() => setDocumentFiles(prev => prev.filter((_, i) => i !== index))}
                    className="p-1 hover:bg-[var(--secondary-hover)] rounded-full"
                  >
                    <Trash2 size={16} className="text-[var(--muted-foreground)]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>


    </div>
  );
};

const MediaControls = ({ onRemove }: { onRemove: () => void }) => (
  <div className="absolute top-2 right-2 flex gap-2">
    <button
      onClick={() => {/* Edit functionality */}}
      className="bg-black/70 p-1.5 rounded-full"
    >
      <Pencil size={16} className="text-white" />
    </button>
    <button
      onClick={onRemove}
      className="bg-black/70 p-1.5 rounded-full"
    >
      <Trash2 size={16} className="text-white" />
    </button>
  </div>
);

export default CreatePost; 