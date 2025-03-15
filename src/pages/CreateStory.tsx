import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Type, Image, Video, Palette, Smile, ChevronLeft, ChevronRight } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { uploadStory } from '../apis/commonApiCalls/storyApi';
import { useApiCall } from '../apis/globalCatchError';
import { Story, StoryData } from '../apis/apiTypes/request';

const CreateStory = () => {
  const [stories, setStories] = useState<Story[]>([{ 
    type: 'text', 
    content: '', 
    theme: 'bg-primary',
    privacy: 1 
  }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const [executeUploadStory, isUploading] = useApiCall(uploadStory);

  const handleTextChange = (newText: string) => {
    setStories(prev => prev.map((story, idx) => 
      idx === currentPage ? { ...story, content: newText } : story
    ));
  };

  const handleThemeChange = (color: string) => {
    setStories(prev => prev.map((story, idx) => 
      idx === currentPage ? { ...story, theme: color } : story
    ));
  };

  // not showing add page and delete page buttons for now as multiple stories not working
  // const handleAddPage = () => {
  //   if (stories.length < 10) {
  //     const currentTheme = stories[currentPage].theme;
  //     setStories(prev => [...prev, { type: 'text', content: '', theme: currentTheme, privacy: 1 }]);
  //     setCurrentPage(stories.length);
  //   }
  // };

  // const handleDeletePage = () => {
  //   if (stories.length > 1) {
  //     setStories(prev => prev.filter((_, idx) => idx !== currentPage));
  //     if (currentPage === stories.length - 1) {
  //       setCurrentPage(currentPage - 1);
  //     }
  //   }
  // };

  // Use these values from stories state
  const currentStory = stories[currentPage];
  const currentTheme = currentStory.theme;
  const currentContentText = typeof currentStory.content === 'string' ? currentStory.content : '';
  const currentPreviewUrl = currentStory.previewUrl || '';

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const newStories = [...stories];
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newStories[currentPage] = {
            type,
            content: file,
            theme: currentTheme,
            privacy: 1,
            previewUrl: reader.result as string
          };
          setStories(newStories);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const navigate = useNavigate();
  const handleCancel = () => {
    navigate('/');
  };

  // Helper function to get computed color from CSS variables
  const getComputedColor = (cssVar: string): string => {
    // For direct color values (like #fff or rgb values)
    if (cssVar.startsWith('#') || cssVar.startsWith('rgb')) {
      return cssVar;
    }
    
    // For CSS variables in the format bg-{name}
    if (cssVar.startsWith('bg-')) {
      // Create a temporary element to compute the style
      const tempEl = document.createElement('div');
      tempEl.className = cssVar;
      document.body.appendChild(tempEl);
      
      // Get the computed style
      const computedStyle = window.getComputedStyle(tempEl);
      const backgroundColor = computedStyle.backgroundColor;
      
      // Clean up
      document.body.removeChild(tempEl);
      
      return backgroundColor || '#000000'; // Fallback to black
    }
    
    return cssVar; // Return as is if not recognized
  };

  // New utility function to render text to canvas and return as image
  const renderTextToImage = (text: string, theme: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Get the actual color value from the theme
      const backgroundColor = getComputedColor(theme);
      
      // Fill background with the computed color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text properties
      ctx.fillStyle = 'white'; // Text color
      ctx.textAlign = 'center';
      ctx.font = '24px sans-serif';
      
      // Word wrap text
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      const maxWidth = canvas.width - 40; // Padding on both sides
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Draw text
      const lineHeight = 30;
      const startY = (canvas.height - (lines.length * lineHeight)) / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback if toBlob fails
          canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
          fetch(canvas.toDataURL('image/png'))
            .then(res => res.blob())
            .then(resolve);
        }
      }, 'image/png');
    });
  };

  // Utility function to process image with theme
  const renderImageWithTheme = (file: File, theme: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions (10:16 aspect ratio)
      canvas.width = 400;
      canvas.height = 640;
      
      // Get the actual color value from the theme
      const backgroundColor = getComputedColor(theme);
      
      // Create image element and load file
      const img = document.createElement('img');
      const reader = new FileReader();
      
      reader.onload = () => {
        img.src = reader.result as string;
      };
      
      img.onload = () => {
        // Fill background with theme color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate dimensions to maintain aspect ratio
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        // Draw image maintaining aspect ratio
        ctx.drawImage(
          img,
          x,
          y,
          img.width * scale,
          img.height * scale
        );
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Fallback if toBlob fails
            fetch(canvas.toDataURL('image/png'))
              .then(res => res.blob())
              .then(resolve);
          }
        }, 'image/png');
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Utility function to process video and create thumbnail
  const renderVideoWithTheme = (file: File, theme: string): Promise<{ 
    thumbnail: Blob;
    video: File;
  }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const videoElement = document.createElement('video');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions (10:16 aspect ratio)
      canvas.width = 400;
      canvas.height = 640;
      
      // Get the actual color value from the theme
      const backgroundColor = getComputedColor(theme);
      
      // Load video and capture first frame
      videoElement.src = URL.createObjectURL(file);
      
      videoElement.onloadeddata = () => {
        videoElement.currentTime = 0;
      };
      
      videoElement.onseeked = () => {
        // Fill background with theme color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate video dimensions to maintain aspect ratio
        const scale = Math.min(
          canvas.width / videoElement.videoWidth,
          canvas.height / videoElement.videoHeight
        );
        const x = (canvas.width - videoElement.videoWidth * scale) / 2;
        const y = (canvas.height - videoElement.videoHeight * scale) / 2;
        
        // Draw video frame
        ctx.drawImage(
          videoElement,
          x,
          y,
          videoElement.videoWidth * scale,
          videoElement.videoHeight * scale
        );
        
        // Convert canvas to blob for thumbnail
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              thumbnail: blob,
              video: file
            });
          } else {
            // Fallback if toBlob fails
            fetch(canvas.toDataURL('image/png'))
              .then(res => res.blob())
              .then(blob => resolve({
                thumbnail: blob,
                video: file
              }));
          }
        }, 'image/png');
      };
    });
  };

  const handleCreateStory = async () => {
    // Validate stories
    const emptyStory = stories.find(story => {
      if (typeof story.content === 'string') {
        return !story.content.trim();
      }
      if (story.content instanceof File || story.content instanceof Blob) {
        return story.content.size === 0;
      }
      return false;
    });
    
    if (emptyStory) {
      return;
    }
    
    // Process all stories and store rendered images
    const processedStories = await Promise.all(
      stories.map(async (story) => {
        try {
          if (story.type === 'text' && typeof story.content === 'string') {
            const imageBlob = await renderTextToImage(story.content, story.theme);
            const filename = `story-text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
            const imageFile = new File([imageBlob], filename, { type: 'image/png' });
            
            return {
              ...story,
              type: 'photo',
              content: imageFile,
              originalText: story.content,
            };
          } 
          else if (story.type === 'photo' && story.content instanceof File) {
            const processedBlob = await renderImageWithTheme(story.content, story.theme);
            const filename = `story-photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
            const processedFile = new File([processedBlob], filename, { type: 'image/png' });
            
            return {
              ...story,
              content: processedFile,
              originalImage: story.content,
            };
          }
          else if (story.type === 'video' && story.content instanceof File) {
            const { thumbnail, video } = await renderVideoWithTheme(story.content, story.theme);
            const thumbnailFile = new File(
              [thumbnail], 
              `thumbnail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`, 
              { type: 'image/png' }
            );
            
            return {
              ...story,
              content: video,
              thumbnail: thumbnailFile,
            };
          }
          
          return story;
        } catch (error) {
          console.error('Error processing story:', error);
          return story;
        }
      })
    );
    
    // Ensure all stories have a privacy value
    const storiesWithPrivacy = processedStories.map(story => ({
      ...story,
      privacy: story.privacy || 1
    }));
    
    // Call the API using the useApiCall hook
    const result = await executeUploadStory(storiesWithPrivacy as StoryData[]);
    
    if (result.success && result.data) {
      navigate('/');
    }
  };

  const handleSetTextType = () => {
    // Set the current story type to text
    setStories(prev => prev.map((story, idx) => 
      idx === currentPage ? { ...story, type: 'text', content: typeof story.content === 'string' ? story.content : '' } : story
    ));
  };

  return (
    <div className="relative h-full bg-background text-foreground">
      {/* Top Controls */}
      <div className="flex items-center justify-between p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/activity/cat.png" alt="Profile" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
            onClick={handleCreateStory}
            disabled={isUploading}
          >
            {isUploading ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

      <div className="h-px bg-border" /> {/* Separator */}

      <div className="flex h-[calc(100vh-145px)]">
        {/* Left Sidebar Tools */}
        <div className="w-16 flex flex-col gap-8 p-4 pt-16">
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground h-auto p-2"
              onClick={handleSetTextType}
            >
              <Type className="w-5 h-5" />
            </Button>
            <span className="text-xs">Text</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleMediaUpload(e, 'photo')}
              />
              <Image className="w-5 h-5 text-foreground" />
            </label>
            <span className="text-xs">Photo</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleMediaUpload(e, 'video')}
              />
              <Video className="w-5 h-5 text-foreground" />
            </label>
            <span className="text-xs">Video</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground h-auto p-2"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
              }}
            >
              <Palette className="w-5 h-5" />
            </Button>
            <span className="text-xs">Theme</span>
            <input
              type="color"
              id="color-picker"
              className="hidden"
              onChange={(e) => {
                handleThemeChange(e.target.value);
                setShowColorPicker(false);
              }}
            />
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground h-auto p-2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-5 h-5" />
            </Button>
            <span className="text-xs">Emoji</span>
            {showEmojiPicker && (
              <div className="absolute left-20 top-1/2 -translate-y-1/2 z-96">
                <EmojiPicker
                  onEmojiClick={(emojiObject) => {
                    handleTextChange(currentContentText + emojiObject.emoji);
                    setShowEmojiPicker(false);
                  }}
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>
        </div>

        {/* Story Content Area */}
        <div className="flex-1 p-4 relative z-50">
          <div
            className={`max-w-xs mx-auto rounded-lg h-full relative`}
            style={{ backgroundColor: currentTheme.startsWith('bg-') ? '' : currentTheme }}
          >
            {currentTheme.startsWith('bg-') && <div className={`absolute inset-0 ${currentTheme} rounded-lg`}></div>}

            {/* Delete and Add Page Buttons
            {stories.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-12 left-4 rounded-full bg-accent/10 hover:bg-accent/20 z-20"
                onClick={handleDeletePage}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}

            {stories.length < 10 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-12 right-4 rounded-full bg-accent/10 hover:bg-accent/20 z-20"
                onClick={handleAddPage}
              >
                <Plus className="w-5 h-5" />
              </Button>
            )} */}

            {/* Progress Indicators */}
            {/* <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className="h-1 flex-1 rounded-full overflow-hidden bg-muted/30"
                >
                  <div
                    className={`h-full bg-foreground ${index === currentPage ? 'w-full' : 'w-0'}`}
                  />
                </div>
              ))}
            </div> */}

            {/* Story Content - Incorporating improved media handling from first file */}
            <div className="h-full w-full flex items-center justify-center relative z-10">
              {currentStory.type === 'text' && (
                <div className="w-full px-4">
                  <textarea
                    value={currentContentText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="What's on your mind..."
                    className="w-full bg-transparent resize-none outline-none text-foreground text-center"
                    rows={3}
                    autoFocus
                  />
                </div>
              )}
              
              {/* Improved image handling from first file */}
              {currentStory.type === 'photo' && (
                <div className="w-full h-full px-4 py-18 overflow-y-auto flex items-center justify-center">
                  <img
                    src={currentPreviewUrl}
                    alt="Story"
                    className="max-w-full object-contain"
                    style={{ maxHeight: 'calc(100% - 40px)' }} // Subtract space for buttons
                  />
                </div>
              )}
              
              {/* Improved video handling from first file */}
              {currentStory.type === 'video' && (
                <div className="w-full h-full px-4 py-18 overflow-y-auto flex items-center justify-center">
                  <video
                    src={currentPreviewUrl}
                    className="max-w-full object-contain"
                    style={{ maxHeight: 'calc(100% - 40px)' }} // Subtract space for buttons
                    controls
                  />
                </div>
              )}

              {/* Show color picker only for text type */}
              {showColorPicker && currentStory.type === 'text' && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-background/50 rounded-full animate-in fade-in duration-200">
                  {['bg-primary', 'bg-accent', 'bg-secondary', 'bg-destructive', 'bg-muted'].map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full ${color} ${currentTheme === color ? 'ring-2 ring-foreground' : ''}`}
                      onClick={() => {
                        handleThemeChange(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                  <button
                    className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center"
                    onClick={() => {
                      const colorPicker = document.getElementById('color-picker');
                      if (colorPicker) colorPicker.click();
                    }}
                  >
                    <Palette className="w-4 h-4 text-background" />
                  </button>
                </div>
              )}
              
              {/* Navigation Arrows - Keeping EXACTLY as in the second file */}
              {currentPage > 0 && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+10px)] bg-accent/60 p-2 rounded-full z-20 hover:bg-accent/20"
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
              )}

              {currentPage < stories.length - 1 && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+10px)] bg-accent/60 p-2 rounded-full z-20 hover:bg-accent/20"
                >
                  <ChevronRight className="w-6 h-6 text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;