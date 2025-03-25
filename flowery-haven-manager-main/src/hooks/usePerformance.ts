// src/hooks/usePerformance.js
import { useEffect, useRef } from 'react';

/**
 * Hook pour mesurer et surveiller les performances d'un composant
 * @param {string} componentName - Nom du composant à surveiller
 * @param {Array} dependencies - Dépendances qui déclenchent une nouvelle mesure
 */
export const usePerformance = (componentName, dependencies = []) => {
    const renderCount = useRef(0);
    const lastRenderTime = useRef(performance.now());
    const isActive = process.env.NODE_ENV === 'development' || localStorage.getItem('enablePerformanceMetrics') === 'true';

    useEffect(() => {
        if (!isActive) return;

        const currentTime = performance.now();
        const renderTime = currentTime - lastRenderTime.current;
        renderCount.current += 1;

        console.log(`[Performance] ${componentName} rendered #${renderCount.current} (${renderTime.toFixed(2)}ms)`);

        return () => {
            lastRenderTime.current = performance.now();
        };
    }, dependencies);

    // Fonction pour créer un mark dans les DevTools de performance
    const markPerformance = (markName) => {
        if (!isActive) return;

        const fullMarkName = `${componentName}-${markName}`;
        performance.mark(fullMarkName);
        console.log(`[Performance] Mark: ${fullMarkName}`);
    };

    // Fonction pour mesurer le temps entre deux marks
    const measurePerformance = (startMark, endMark, measureName) => {
        if (!isActive) return;

        const fullStartMark = `${componentName}-${startMark}`;
        const fullEndMark = `${componentName}-${endMark}`;
        const fullMeasureName = `${componentName}-${measureName}`;

        try {
            performance.measure(fullMeasureName, fullStartMark, fullEndMark);
            const entries = performance.getEntriesByName(fullMeasureName);
            const duration = entries.length > 0 ? entries[0].duration : 0;

            console.log(`[Performance] Measure: ${fullMeasureName} (${duration.toFixed(2)}ms)`);
        } catch (error) {
            console.error(`[Performance] Error measuring ${fullMeasureName}:`, error);
        }
    };

    return {
        markPerformance,
        measurePerformance
    };
};