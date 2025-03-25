// src/components/common/VirtualizedList.jsx
import { useState, useEffect, useRef, useCallback } from 'react';

const VirtualizedList = ({
  items = [],
  height = 500,
  itemHeight = 50,
  renderItem = () => null,
  overscan = 5,
  className = '',
  onEndReached = null,
  endReachedThreshold = 500
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleItemsCount, setVisibleItemsCount] = useState(0);
  const containerRef = useRef(null);
  const scrollingRef = useRef(false);
  const lastScrollTop = useRef(0);
  const [scrollDirection, setScrollDirection] = useState('down');

  // Calculer le nombre d'éléments visibles
  useEffect(() => {
    const count = Math.ceil(height / itemHeight) + overscan * 2;
    setVisibleItemsCount(count);
  }, [height, itemHeight, overscan]);

  // Gestion du scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    
    // Détecter la direction du défilement
    const direction = scrollTop > lastScrollTop.current ? 'down' : 'up';
    setScrollDirection(direction);
    lastScrollTop.current = scrollTop;
    
    // Calculer l'index de début
    const index = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    setStartIndex(index);
    
    // Vérifier si on approche de la fin
    if (onEndReached && direction === 'down') {
      const containerHeight = containerRef.current.clientHeight;
      const contentHeight = items.length * itemHeight;
      const scrollBottom = contentHeight - scrollTop - containerHeight;
      
      if (scrollBottom < endReachedThreshold) {
        onEndReached();
      }
    }
    
    if (!scrollingRef.current) {
      scrollingRef.current = true;
      window.requestAnimationFrame(() => {
        scrollingRef.current = false;
      });
    }
  }, [itemHeight, overscan, onEndReached, endReachedThreshold, items.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Calculer les indices visibles
  const endIndex = Math.min(startIndex + visibleItemsCount, items.length);
  const visibleItems = items.slice(startIndex, endIndex);
  
  // Calculer la taille du contenu pour le scrolling
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height, width: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetY, width: '100%' }}>
          {visibleItems.map((item, index) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedList;