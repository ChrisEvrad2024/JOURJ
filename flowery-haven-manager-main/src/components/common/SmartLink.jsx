// src/components/common/SmartLink.jsx
import { forwardRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PreFetchService from '../../services/PreFetchService';
import ChunkLoadingService from '../../services/ChunkLoadingService';

const SmartLink = forwardRef(({
  to,
  children,
  prefetch = true,
  delay = 200,
  className = '',
  activeClassName = '',
  ...props
}, ref) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  // Combinaison de classes
  const combinedClassName = `${className} ${isActive ? activeClassName : ''}`.trim();
  
  // Préchargement de la route au survol
  const handleMouseEnter = useCallback(() => {
    if (!prefetch) return;
    
    // Précharger la route
    PreFetchService.prefetchRoute(to);
    
    // Précharger les chunks associés
    ChunkLoadingService.preloadRoute(to);
  }, [to, prefetch]);
  
  // Préchargement de la route en focus
  const handleFocus = useCallback(() => {
    if (!prefetch) return;
    
    // Précharger la route
    PreFetchService.prefetchRoute(to);
  }, [to, prefetch]);
  
  return (
    <Link
      ref={ref}
      to={to}
      className={combinedClassName}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    >
      {children}
    </Link>
  );
});

SmartLink.displayName = 'SmartLink';

export default SmartLink;