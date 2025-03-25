// src/components/common/OptimizedImage.jsx
import { useState, useEffect } from 'react';
import ImageOptimizationService from '../../services/ImageOptimizationService';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '100vw',
  loading = 'lazy',
  fit = 'cover',
  placeholder = true,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [srcSet, setSrcSet] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      if (!src) {
        setIsLoading(false);
        setError(true);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Générer l'URL optimisée
        const optimizedUrl = await ImageOptimizationService.getAutoOptimizedImageUrl(src, {
          width,
          height,
          fit
        });
        
        // Générer le srcset pour les différentes tailles
        const newSrcSet = ImageOptimizationService.generateSrcSet(src, [
          width,
          width * 1.5,
          width * 2
        ], { fit });
        
        if (isMounted) {
          setImageSrc(optimizedUrl);
          setSrcSet(newSrcSet);
          setError(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to optimize image:', err);
          setImageSrc(src); // Fallback à l'image originale
          setError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [src, width, height, fit]);
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };
  
  const placeholderUrl = width && height
    ? `/api/placeholder/${width}/${height}${alt ? `?text=${encodeURIComponent(alt)}` : ''}`
    : '';
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && placeholder && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {error && placeholder ? (
        <img
          src={placeholderUrl}
          alt={alt || 'Image could not be loaded'}
          width={width}
          height={height}
          className={`w-full h-full object-${fit}`}
          {...props}
        />
      ) : (
        <img
          src={imageSrc || (placeholder ? placeholderUrl : '')}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt || ''}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-${fit}`}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;