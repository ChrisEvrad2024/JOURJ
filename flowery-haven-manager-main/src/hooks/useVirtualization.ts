// src/hooks/useVirtualization.js
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook pour gérer la virtualisation des listes longues
 * @param {Object} options - Options de configuration
 * @returns {Object} - Propriétés et méthodes pour la virtualisation
 */
export const useVirtualization = ({
    itemCount = 0,
    itemHeight = 50,
    overscan = 3,
    windowSize = typeof window !== 'undefined' ? window.innerHeight : 800,
    scrollingDelay = 150
}) => {
    const [startIndex, setStartIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(
        Math.ceil(windowSize / itemHeight) + overscan * 2
    );
    const [scrollTop, setScrollTop] = useState(0);
    const scrollTimeoutRef = useRef(null);
    const totalHeight = itemCount * itemHeight;

    // Calculer le nombre d'éléments visibles
    useEffect(() => {
        setVisibleCount(Math.ceil(windowSize / itemHeight) + overscan * 2);
    }, [windowSize, itemHeight, overscan]);

    // Calculer l'index de départ en fonction du scrollTop
    const calculateStartIndex = useCallback((scrollPosition) => {
        const index = Math.max(0, Math.floor(scrollPosition / itemHeight) - overscan);
        return index;
    }, [itemHeight, overscan]);

    // Gérer le défilement
    const handleScroll = useCallback((scrollPosition) => {
        setScrollTop(scrollPosition);

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Limiter les mises à jour pendant le défilement rapide
        scrollTimeoutRef.current = setTimeout(() => {
            const newStartIndex = calculateStartIndex(scrollPosition);
            setStartIndex(newStartIndex);
        }, scrollingDelay);
    }, [calculateStartIndex, scrollingDelay]);

    // Nettoyer les timeouts
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    // Calculer l'index de fin
    const endIndex = Math.min(startIndex + visibleCount, itemCount);

    // Liste des indices visibles
    const visibleIndices = Array.from(
        { length: endIndex - startIndex },
        (_, i) => startIndex + i
    );

    return {
        visibleIndices,
        startIndex,
        endIndex,
        totalHeight,
        itemHeight,
        scrollTop,
        handleScroll,
        visibleItemsCount: visibleCount,
        virtualListStyles: {
            height: totalHeight,
            position: 'relative',
            width: '100%'
        },
        virtualItemStyles: (index) => ({
            position: 'absolute',
            top: index * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight
        })
    };
};