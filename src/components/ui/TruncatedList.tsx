import { useState } from 'react';

interface TruncatedListProps<T> {
  items: T[];
  limit: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  itemsContainerClassName?: string;
  buttonClassName?: string;
}

/**
 * A component that shows a list of items with "show more/less" functionality
 * 
 * @param items - The array of items to display
 * @param limit - Maximum number of items to show before truncation
 * @param renderItem - Function to render each item
 * @param emptyMessage - Optional message to display if items array is empty
 * @param className - Optional className for the container
 * @param itemsContainerClassName - Optional className for the items container
 * @param buttonClassName - Optional className for the show more/less button
 */
export function TruncatedList<T>({
  items,
  limit,
  renderItem,
  emptyMessage = "No items to display",
  className = "",
  itemsContainerClassName = "",
  buttonClassName = "text-foreground text-xs mt-2 cursor-pointer hover:underline"
}: TruncatedListProps<T>) {
  const [showAll, setShowAll] = useState(false);
  
  // If no items, show empty message
  if (!items || items.length === 0) {
    return <div className={className}>{emptyMessage}</div>;
  }
  
  // Check if truncation is needed
  const needsTruncation = items.length > limit;
  
  // The items to display (either all or limited)
  const displayItems = showAll ? items : items.slice(0, limit);
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={itemsContainerClassName}>
        {displayItems.map((item, index) => renderItem(item, index))}
      </div>
      
      {needsTruncation && (
        <button 
          type="button"
          onClick={() => setShowAll(!showAll)}
          className={buttonClassName}
        >
          {showAll ? 'Show less' : `Show ${items.length - limit} more`}
        </button>
      )}
    </div>
  );
} 