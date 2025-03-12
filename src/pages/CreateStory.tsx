import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Type, Image, Video, Palette, Smile, X, ChevronLeft, ChevronRight } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';


interface Story {
  type: 'text' | 'photo' | 'video';
  content: string;
  theme?: string;
}

const CreateStory = () => {
  const [stories, setStories] = useState<Story[]>([{ type: 'text', content: '' }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [text, setText] = useState('');
  const [themeColor, setThemeColor] = useState('bg-purple-600');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAddPage = () => {
    if (stories.length < 10) { // Limit to 10 stories
      const newStories: Story[] = [...stories, { type: 'text' as const, content: '', theme: themeColor }];
      setStories(newStories);
      setCurrentPage(newStories.length - 1);
      setText(''); // Reset text for new page
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newStories = [...stories];
        newStories[currentPage] = {
          type,
          content: reader.result as string
        };
        setStories(newStories);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (color: string) => {
    setThemeColor(color);
    const newStories = [...stories];
    newStories[currentPage] = {
      ...newStories[currentPage],
      theme: color
    };
    setStories(newStories);
  };

  const currentTheme = stories[currentPage]?.theme || themeColor;

  const handleTextClick = () => {
    // Update current story to text type
    const newStories = [...stories];
    newStories[currentPage] = { type: 'text', content: text };
    setStories(newStories);
    
    // Hide other pickers
    setShowEmojiPicker(false);
    setShowColorPicker(false);
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
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
          >
            Post
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
              onClick={handleTextClick}
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
              <div className="absolute left-20 top-1/2 -translate-y-1/2 z-50">
                <EmojiPicker
                  onEmojiClick={(emojiObject) => {
                    setText(prev => prev + emojiObject.emoji);
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
        <div className="flex-1 p-4 relative">
          <div 
            className={`max-w-xs mx-auto rounded-lg h-full relative`}
            style={{ backgroundColor: currentTheme.startsWith('bg-') ? '' : currentTheme }}
          >
            {currentTheme.startsWith('bg-') && <div className={`absolute inset-0 ${currentTheme} rounded-lg`}></div>}
            
            {/* Delete and Add Page Buttons */}
            {stories.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-12 left-4 rounded-full bg-accent/10 hover:bg-accent/20 z-20"
                onClick={() => {
                  const newStories = stories.filter((_, i) => i !== currentPage);
                  setStories(newStories);
                  setCurrentPage(prev => prev >= newStories.length ? newStories.length - 1 : prev);
                }}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}

            {stories.length < 10 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-12 right-4 rounded-full bg-accent/10 hover:bg-accent/20 z-20"
                onClick={() => {
                  const newStories = [...stories, { type: 'text' as const, content: '', theme: themeColor }];
                  setStories(newStories);
                  setCurrentPage(newStories.length - 1);
                  setText('');
                }}
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}

            {/* Navigation Arrows */}
            {currentPage > 0 && (
              <button 
                onClick={() => setCurrentPage(currentPage - 1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-accent/10 p-2 rounded-full z-10 hover:bg-accent/20"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
            )}
            
            {currentPage < stories.length - 1 && (
              <button 
                onClick={() => setCurrentPage(currentPage + 1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-accent/10 p-2 rounded-full z-10 hover:bg-accent/20"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            )}

            {/* Progress Indicators */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className="h-1 flex-1 rounded-full overflow-hidden bg-muted/30"
                >
                  <div
                    className={`h-full bg-foreground transition-all duration-300 ${
                      index === currentPage ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Story Content */}
            <div className="h-full w-full flex items-center justify-center relative z-10">
              {stories[currentPage]?.type === 'text' && (
                <div className="w-full px-4">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What's on your mind..."
                    className="w-full bg-transparent resize-none outline-none text-foreground text-center"
                    rows={3}
                    autoFocus
                  />
                </div>
              )}
              {stories[currentPage]?.type === 'photo' && (
                <img
                  src={stories[currentPage].content}
                  alt="Story"
                  className="w-full h-full p-4 object-contain"
                />
              )}
              {stories[currentPage]?.type === 'video' && (
                <video
                  src={stories[currentPage].content}
                  className="w-full h-full p-4 object-contain"
                  controls
                />
              )}
              
              {/* Show color picker only for text type */}
              {showColorPicker && stories[currentPage]?.type === 'text' && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-background/50 rounded-full animate-in fade-in duration-200">
                  {['bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-red-600', 'bg-yellow-600'].map(color => (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStory; 