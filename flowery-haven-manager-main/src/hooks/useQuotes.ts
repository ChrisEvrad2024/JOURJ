// src/hooks/useQuotes.js
import { useState, useEffect, useCallback } from 'react';
import { QuoteService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useQuotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    const fetchUserQuotes = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);
        try {
            const data = await QuoteService.getQuotesByUserId(currentUser.id);
            setQuotes(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch quotes');
            console.error('Error fetching quotes:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const requestQuote = useCallback(async (quoteData) => {
        setLoading(true);
        try {
            const result = await QuoteService.createQuote({
                ...quoteData,
                userId: currentUser?.id
            });

            toast.success('Demande de devis envoyée', {
                description: 'Nous reviendrons vers vous rapidement.'
            });

            fetchUserQuotes();
            return result;
        } catch (err) {
            toast.error('Échec de la demande de devis', {
                description: err.message || 'Une erreur est survenue'
            });
            console.error('Error requesting quote:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [currentUser, fetchUserQuotes]);

    const acceptQuote = useCallback(async (quoteId) => {
        setLoading(true);
        try {
            await QuoteService.updateQuoteStatus(quoteId, 'accepted');
            toast.success('Devis accepté');
            fetchUserQuotes();
        } catch (err) {
            toast.error('Échec de l\'acceptation du devis');
            console.error('Error accepting quote:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchUserQuotes]);

    const rejectQuote = useCallback(async (quoteId) => {
        setLoading(true);
        try {
            await QuoteService.updateQuoteStatus(quoteId, 'rejected');
            toast.success('Devis refusé');
            fetchUserQuotes();
        } catch (err) {
            toast.error('Échec du refus du devis');
            console.error('Error rejecting quote:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchUserQuotes]);

    useEffect(() => {
        if (currentUser) {
            fetchUserQuotes();
        }
    }, [currentUser, fetchUserQuotes]);

    return {
        quotes,
        loading,
        error,
        requestQuote,
        acceptQuote,
        rejectQuote
    };
};useAddresses.ts