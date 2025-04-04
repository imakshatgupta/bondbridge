import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Trash2, Image, Smile, Video, Mic } from 'lucide-react';
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
import { WORD_LIMIT } from '@/lib/constants';
import { countWords } from '@/lib/utils';
import { CreatePostRequest } from '@/apis/apiTypes/request';
import { MediaCropModal, CroppedFile } from '@/components/MediaCropModal';

interface PostData extends Partial<CreatePostRequest> {
  content: string;
  postId?: string;
}

interface CreatePostProps {
  onSubmit?: (content: string, media?: File[]) => void;
  uploadMedia?: boolean;
  submitButtonText?: string;
  submitHandler?: (data: PostData) => void;
  initialContent?: string;
  postId?: string;
  onCancel?: () => void;
}

const CreatePost = ({ 
  onSubmit,
  uploadMedia = true,
  submitButtonText = 'Post',
  submitHandler,
  initialContent = '',
  postId,
  onCancel
}: CreatePostProps) => {
  const navigate = useNavigate();
  const [content, setContent] = useState(initialContent);
  const [mediaFiles, setMediaFiles] = useState<CroppedFile[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const recognitionActiveRef = useRef(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  
  // Media cropping state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentMediaFile, setCurrentMediaFile] = useState<File | null>(null);
  
  // Update content when initialContent changes (for edit mode)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);
  
  // Get the current user's avatar from Redux store
  const { avatar, nickname, profilePic } = useAppSelector(state => state.currentUser);
  
  // Use the API call hook for the createPost function
  const [executeCreatePost, isCreatingPost] = useApiCall(createPost);
  // Use the API call hook for the rewriteWithBondChat function
  const [executeRewriteWithBondChat, isRewritingWithBondChat] = useApiCall(rewriteWithBondChat);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uploadMedia) return;
    
    const files = Array.from(e.target.files || []);
    
    // Check for video files exceeding 1MB limit
    const invalidFiles = files.filter(file => 
      file.type.startsWith('video/') && file.size > 1024 * 1024
    );
    
    if (invalidFiles.length > 0) {
      toast.error('Videos must be less than 1MB in size');
      return;
    }
    
    if (files.length > 0) {
      // Open crop modal with the first file
      setCurrentMediaFile(files[0]);
      setIsCropModalOpen(true);
    }
  };

  const handleCropComplete = (croppedFile: CroppedFile) => {
    const newFiles = [...mediaFiles, croppedFile].slice(0, 4);
    setMediaFiles(newFiles);
    
    // Create preview for the cropped file
    if (croppedFile.type.startsWith('video/') && croppedFile.previewUrl) {
      // For videos, use the preview image URL directly for thumbnail display
      setMediaPreviews(prev => [...prev, croppedFile.previewUrl!].slice(0, 4));
    } else {
      // For images, generate preview from the file
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string].slice(0, 4));
      };
      reader.readAsDataURL(croppedFile);
    }
    
    // Reset crop modal state
    setCurrentMediaFile(null);
  };

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
    // Check word count
    if (countWords(content) > WORD_LIMIT) {
      toast.error(`Your post exceeds the ${WORD_LIMIT} word limit.`);
      return;
    }

    if (content.trim() || (uploadMedia && (mediaFiles.length > 0 || documentFiles.length > 0))) {
      setIsSubmitting(true);
      
      // Prepare the post data
      let postData: PostData = {
        content: content.trim(),
      };
      
      // Only include media files if uploadMedia is true
      if (uploadMedia) {
        postData = {
          ...postData,
          whoCanComment: 1, // Default value
          privacy: 1, // Default value
          image: mediaFiles as unknown as File[],
          document: documentFiles
        };
      }
      
      // If editing a post, add postId
      if (postId) {
        postData.postId = postId;
      }
      
      if (submitHandler) {
        // Use custom submit handler if provided
        await submitHandler(postData);
      } else {
        // Execute the default API call with error handling
        const apiPostData: CreatePostRequest = {
          content: postData.content,
          whoCanComment: postData.whoCanComment ?? 1,
          privacy: postData.privacy ?? 1,
          image: postData.image,
          document: postData.document
        };
        
        const { data, success } = await executeCreatePost(apiPostData);
        
        if (success && data) {
          // Show success message
          toast.success(postId ? 'Post updated successfully!' : 'Post created successfully!');
          
          // Clear form after successful submission
          setContent('');
          setMediaFiles([]);
          setMediaPreviews([]);
          setDocumentFiles([]);
          
          // Call the onSubmit prop if provided
          onSubmit?.(content, [...mediaFiles, ...documentFiles]);
          navigate('/');
        }
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] rounded-lg p-6">
      <div className="flex items-start gap-3 pb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profilePic || avatar} alt={nickname || "Profile"} />
          <AvatarFallback>{nickname ? nickname[0].toUpperCase() : "U"}</AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--muted-foreground)] border cursor-pointer border-primary"
            onClick={handleCancel}
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
            {isSubmitting || isCreatingPost ? 'Processing...' : submitButtonText}
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
          {uploadMedia && (
            <>
              <label className="cursor-pointer hover:opacity-75 transition-opacity">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMediaUpload}
                />
                <Image size={20} className="text-[var(--foreground)]" />
              </label>
              <label className="cursor-pointer hover:opacity-75 transition-opacity">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleMediaUpload}
                />
                <Video size={20} className="text-[var(--foreground)]" />
              </label>
            </>
          )}
         
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
            <>
              <TextareaAutosize
                placeholder="What's on your mind..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
                className="w-full bg-transparent outline-none resize-none text-sm h-auto"
                maxRows={20}
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${countWords(content) > WORD_LIMIT ? 'text-destructive-foreground' : 'text-muted-foreground'}`}>
                  {countWords(content)}/{WORD_LIMIT} words
                </span>
              </div>
            </>
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
                    <div className="relative w-full pt-[100%] overflow-hidden">
                      {/* Use stored preview image for video thumbnail if available */}
                      {mediaFiles[0].previewUrl ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                          <img 
                            src={mediaFiles[0].previewUrl} 
                            alt="Video thumbnail"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                              <Video className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <video 
                          key={`video-preview-0-${mediaPreviews[0]}`}
                          src={mediaPreviews[0]} 
                          className="absolute inset-0 w-full h-full object-cover"
                          controls
                          preload="metadata"
                          playsInline
                        />
                      )}
                    </div>
                  ) : (
                    <img 
                      src={mediaPreviews[0]} 
                      alt="Preview" 
                      className="w-full h-full object-cover aspect-square"
                    />
                  )}
                  <MediaControls onRemove={() => handleRemoveMedia(0)} />
                </div>

                {mediaPreviews.length > 1 && (
                  <div className="relative">
                    {mediaFiles[1]?.type.startsWith('video/') ? (
                      <div className="relative w-full pt-[100%] overflow-hidden">
                        {/* Use stored preview image for video thumbnail if available */}
                        {mediaFiles[1].previewUrl ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black">
                            <img 
                              src={mediaFiles[1].previewUrl} 
                              alt="Video thumbnail"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <video 
                            key={`video-preview-1-${mediaPreviews[1]}`}
                            src={mediaPreviews[1]} 
                            className="absolute inset-0 w-full h-full object-cover"
                            controls
                            preload="metadata"
                            playsInline
                          />
                        )}
                      </div>
                    ) : (
                      <img 
                        src={mediaPreviews[1]} 
                        alt="Preview" 
                        className="w-full h-full object-cover aspect-square"
                      />
                    )}
                    <MediaControls onRemove={() => handleRemoveMedia(1)} />
                  </div>
                )}

                {mediaPreviews.length > 2 && (
                  <div className="relative">
                    {mediaFiles[2]?.type.startsWith('video/') ? (
                      <div className="relative w-full pt-[100%] overflow-hidden">
                        {/* Use stored preview image for video thumbnail if available */}
                        {mediaFiles[2].previewUrl ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black">
                            <img 
                              src={mediaFiles[2].previewUrl} 
                              alt="Video thumbnail"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <video 
                            key={`video-preview-2-${mediaPreviews[2]}`}
                            src={mediaPreviews[2]} 
                            className="absolute inset-0 w-full h-full object-cover"
                            controls
                            preload="metadata"
                            playsInline
                          />
                        )}
                      </div>
                    ) : (
                      <img 
                        src={mediaPreviews[2]} 
                        alt="Preview" 
                        className="w-full h-full object-cover aspect-square"
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

      {/* Media Crop Modal */}
      <MediaCropModal
        open={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setCurrentMediaFile(null);
        }}
        media={currentMediaFile}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

const MediaControls = ({ onRemove }: { onRemove: () => void }) => (
  <div className="absolute top-2 right-2 flex gap-2">
    <button
      onClick={onRemove}
      className="bg-black/70 p-1.5 rounded-full"
    >
      <Trash2 size={16} className="text-white" />
    </button>
  </div>
);

export default CreatePost; 