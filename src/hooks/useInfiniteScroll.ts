import { useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export const useInfiniteScroll = ({
  isLoading,
  hasMore,
  onLoadMore,
  threshold = 0.8
}: UseInfiniteScrollProps) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    }, { threshold });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, onLoadMore, threshold]);

  return lastElementRef;
}; 