import { useState } from 'react';
import { truncateText } from '@/lib/utils';

interface TruncatedTextProps {
  text: string | undefined;
  limit: number;
  placeholderText?: string;
  className?: string;
  buttonClassName?: string;
  showToggle?: boolean;
  align?: 'left' | 'center' | 'right';
}

/**
 * A component that shows text with "show more/less" functionality
 * 
 * @param text - The text to display
 * @param limit - The character limit before truncation
 * @param placeholderText - Optional text to display if text is empty or undefined
 * @param className - Optional className for the text container
 * @param buttonClassName - Optional className for the show more/less button
 * @param showToggle - Optional flag to control whether to show the toggle button (defaults to true)
 * @param align - Optional text alignment (defaults to center)
 */
export function TruncatedText({
  text,
  limit,
  placeholderText = "",
  className = "",
  buttonClassName = "text-foreground text-xs mt-1 cursor-pointer hover:underline font-bold",
  showToggle = true,
  align = 'center'
}: TruncatedTextProps) {
  const [showFull, setShowFull] = useState(false);
  
  // Use placeholder if text is empty or undefined
  const displayText = (text && text.trim() !== "") ? text : placeholderText;
  
  // Check if truncation is needed
  const { text: truncated, isTruncated } = truncateText(displayText, limit);
  
  // The text to actually display
  const finalText = showFull ? displayText : truncated;

  // Set alignment class
  const containerClass = `flex flex-col items-${align}`;
  
  return (
    <div className={containerClass}>
      <p className={className}>
        {finalText}
      </p>
      {isTruncated && showToggle && (
        <button 
          onClick={() => setShowFull(!showFull)}
          className={buttonClassName}
        >
          {showFull ? 'Show Less' : 'Show More+'}
        </button>
      )}
    </div>
  );
} 