// src/components/common/LazyImage.jsx
import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import ImageOptimizationService from '../../services/ImageOptimizationService';

const LazyImage = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  placeholderColor = '#f3f4f6',
  threshold = 0.01, // Seuil pour l'Intersection Observer
  priority = false, // Priorité de chargement (skip lazy loading)
  quality = 80, // Qualité de l'image (1-100)
  onLoad = () => {},
  onError = () => {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const { t } = useI18n();
  
  // Configuration de l'URL de l'image optimisée
  const [imageUrl, setImageUrl] = useState('');
  const [srcSet, setSrcSet] = useState('');
  
  useEffect(() => {
    const configureImageUrl = async () => {
      try {
        // Générer l'URL optimisée
        const optimizedUrl = await ImageOptimizationService.getAutoOptimizedImageUrl(src, {
          width,
          height,
          quality
        });
        
        // Générer le srcset pour les différentes tailles
        const srcSetWidths = [width, width * 1.5, width * 2].filter(w => w <= 1920);
        const newSrcSet = ImageOptimizationService.generateSrcSet(src, srcSetWidths, { quality });
        
        setImageUrl(optimizedUrl);
        setSrcSet(newSrcSet);
      } catch (error) {
        console.error('Error optimizing image:', error);
        setImageUrl(src);
      }
    };
    
    if (src) {
      configureImageUrl();
    }
  }, [src, width, height, quality]);
  
  // Configurer l'IntersectionObserver pour le lazy loading
  useEffect(() => {
    // Si l'image est prioritaire, on ne met pas en place d'observer
    if (priority) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '200px' }
    );
    
    observerRef.current = observer;
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, threshold]);
  
  // Gestionnaires d'événements
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };
  
  const handleError = () => {
    setIsError(true);
    onError();
  };
  
  // Génération du placeholder en fonction des dimensions
  const placeholderUrl = width && height
    ? `/api/placeholder/${width}/${height}?text=${encodeURIComponent(alt || t('common.image'))}`
    : '';
  
  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        backgroundColor: placeholderColor,
        transition: 'opacity 0.3s ease'
      }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse"
          style={{ opacity: isLoaded ? 0 : 1 }}
        >
          {alt && <span className="sr-only">{alt}</span>}
        </div>
      )}
      
      {/* Image réelle - chargée uniquement quand elle est dans le viewport */}
      {(isInView || priority) && imageUrl && (
        <img
          src={imageUrl}
          srcSet={srcSet}
          sizes={props.sizes || '100vw'}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      )}
      
      {/* Fallback en cas d'erreur */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <img
            src={placeholderUrl}
            alt={alt || t('common.imageError')}
            width={width}
            height={height}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default LazyImage;