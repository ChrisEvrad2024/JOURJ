// src/components/common/VirtualList.jsx
import { useRef, useEffect } from 'react';
import { useVirtualization } from '../../hooks/useVirtualization';

const VirtualList = ({
  items = [],
  itemHeight = 50,
  renderItem,
  className = '',
  height = 400,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 300,
  ...props
}) => {
  const containerRef = useRef(null);
  
  const {
    visibleIndices,
    totalHeight,
    virtualListStyles,
    virtualItemStyles,
    handleScroll
  } = useVirtualization({
    itemCount: items.length,
    itemHeight,
    overscan,
    windowSize: height
  });
  
  // Configurer l'événement de défilement
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const scrollHandler = () => {
      handleScroll(container.scrollTop);
      
      // Vérifier si l'utilisateur a atteint la fin de la liste
      if (onEndReached) {
        const scrollPosition = container.scrollTop;
        const containerHeight = container.clientHeight;
        const scrollBottom = totalHeight - scrollPosition - containerHeight;
        
        if (scrollBottom < endReachedThreshold) {
          onEndReached();
        }
      }
    };
    
    container.addEventListener('scroll', scrollHandler);
    return () => {
      container.removeEventListener('scroll', scrollHandler);
    };
  }, [handleScroll, totalHeight, onEndReached, endReachedThreshold]);
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height, width: '100%' }}
      {...props}
    >
      <div style={virtualListStyles}>
        {visibleIndices.map(index => (
          <div key={index} style={virtualItemStyles(index)}>
            {renderItem(items[index], index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;