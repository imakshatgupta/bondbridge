import { useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Pencil, Trash2, Image, Smile, Plus } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface CreatePostProps {
  onSubmit?: (content: string, media?: File[]) => void;
}

const CreatePost = ({ onSubmit }: CreatePostProps) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

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

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentFiles(prev => [...prev, ...files]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (content.trim() || mediaFiles.length > 0 || documentFiles.length > 0) {
      try {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('whoCanComment', '1');
        formData.append('privacy', '1');
        
        // Append media files
        mediaFiles.forEach((file, index) => {
          formData.append('image', file);
        });

        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        console.log("userId from local storage: ", userId);
        console.log("token from local storage: ", token);

        if (!userId || !token) {
          throw new Error('User not authenticated');
        }

        // Properly inspect FormData contents
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        console.log("mediaFiles: ", mediaFiles);

        const response = await axios.post('http://18.144.2.16/api/post', formData, {
          headers: {
            'userId': userId,
            'token': token,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.status !== 200) {
          throw new Error('Failed to create post');
        }

        console.log('Post created successfully:', response.data);

        // Clear form after successful submission
        setContent('');
        setMediaFiles([]);
        setMediaPreviews([]);
        setDocumentFiles([]);
        
        // Call the onSubmit prop if provided
        onSubmit?.(content, [...mediaFiles, ...documentFiles]);
      } catch (error) {
        console.error('Error creating post:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] rounded-lg p-6">
      <div className="flex items-start gap-3 pb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/activity/cat.png" alt="Profile" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        

        <div className="flex items-center gap-6 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--muted-foreground)] px-8 border"
            onClick={() => setContent('')}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[var(--primary)] px-10 hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)]"
            onClick={handleSubmit}
          >
            Post
          </Button>
        </div>
      </div>

      

      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <label className="cursor-pointer hover:opacity-75 transition-opacity">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMediaUpload}
            />
            <Image size={20} className="text-[var(--foreground)]" />
          </label>
          <div className="relative">
            <button 
              onClick={() => setShowPicker(!showPicker)}
              type="button"
              className="hover:opacity-75 transition-opacity"
            >
              <Smile size={20} className="text-[var(--foreground)]" />
            </button>
            {showPicker && (
              <div className='absolute z-50'>
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
          <label className="cursor-pointer hover:opacity-75 transition-opacity">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleDocumentUpload}
            />
            <Plus size={20} className="text-[var(--foreground)]" />
          </label>
        </div>

        <div className=" flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1 bg-[var(--secondary)]"
          >
            <img src="/bondchat.svg" alt="BondChat" className="w-4 h-4" />
            <div className='text-[var(--foreground)]'>Re-write with <span className='text-[var(--primary)]'>BondChat </span></div>
          </Button>
        </div>


      </div>

      <Separator className="my-3 bg-[var(--border)]" />

      <div className="flex-1">
          <textarea
            placeholder="What's on your mind..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent outline-none resize-none text-sm"
            rows={2}
          />

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