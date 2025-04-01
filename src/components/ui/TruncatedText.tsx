import { useState } from 'react';
import { truncateText } from '@/lib/utils';

interface TruncatedTextProps {
  text: string | undefined;
  limit: number;
  placeholderText?: string;
  className?: string;
  buttonClassName?: string;
}

/**
 * A component that shows text with "show more/less" functionality
 * 
 * @param text - The text to display
 * @param limit - The character limit before truncation
 * @param placeholderText - Optional text to display if text is empty or undefined
 * @param className - Optional className for the text container
 * @param buttonClassName - Optional className for the show more/less button
 */
export function TruncatedText({
  text,
  limit,
  placeholderText = "",
  className = "",
  buttonClassName = "text-primary text-xs mt-1 cursor-pointer hover:underline"
}: TruncatedTextProps) {
  const [showFull, setShowFull] = useState(false);
  
  // Use placeholder if text is empty or undefined
  const displayText = (text && text.trim() !== "") ? text : placeholderText;
  
  // Check if truncation is needed
  const { text: truncated, isTruncated } = truncateText(displayText, limit);
  
  // The text to actually display
  const finalText = showFull ? displayText : truncated;
  
  return (
    <div className="flex flex-col items-center">
      <p className={className}>
        {finalText}
      </p>
      {isTruncated && (
        <button 
          onClick={() => setShowFull(!showFull)}
          className={buttonClassName}
        >
          {showFull ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
} 