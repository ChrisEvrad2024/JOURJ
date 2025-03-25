// src/components/common/SmartImage.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import ImageOptimizationService from '../../services/ImageOptimizationService';

const SmartImage = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  fit = 'cover',
  quality = 80,
  loading = 'lazy',
  placeholder = true,
  sizes = '100vw',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [srcSet, setSrcSet] = useState('');
  const imgRef = useRef(null);
  const { t } = useTranslation();
  
  useEffect(() => {
    const optimizeImage = async () => {
      try {
        // Générer l'URL optimisée
        const optimizedUrl = await ImageOptimizationService.getAutoOptimizedImageUrl(src, {
          width,
          height,
          quality,
          fit
        });
        
        // Générer le srcset pour les différentes tailles
        const widths = [width, width * 1.5, width * 2].filter(w => w <= 1920);
        const newSrcSet = ImageOptimizationService.generateSrcSet(src, widths, { quality });
        
        setOptimizedSrc(optimizedUrl);
        setSrcSet(newSrcSet);
      } catch (error) {
        console.error('Error optimizing image:', error);
        setOptimizedSrc(src); // Fallback à l'URL originale
      }
    };
    
    if (src) {
      optimizeImage();
    }
  }, [src, width, height, quality, fit]);
  
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };
  
  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
    if (onError) onError();
  };
  
  const placeholderUrl = width && height && placeholder
    ? `/api/placeholder/${width}/${height}${alt ? `?text=${encodeURIComponent(alt)}` : ''}`
    : '';
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && placeholder && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {isError && placeholder ? (
        <img
          src={placeholderUrl}
          alt={alt || t('common.imageError')}
          width={width}
          height={height}
          className={`w-full h-full object-${fit}`}
          {...props}
        />
      ) : (
        <img
          ref={imgRef}
          src={optimizedSrc || (placeholder ? placeholderUrl : '')}
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

export default SmartImage;