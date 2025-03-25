// src/hooks/useAddresses.js
import { useState, useEffect, useCallback } from 'react';
import { AddressService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    const fetchAddresses = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);
        try {
            const data = await AddressService.getAddressesByUserId(currentUser.id);
            setAddresses(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch addresses');
            console.error('Error fetching addresses:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const addAddress = useCallback(async (addressData) => {
        if (!currentUser) {
            toast.error('Vous devez être connecté pour ajouter une adresse');
            return;
        }

        setLoading(true);
        try {
            const newAddress = await AddressService.addAddress({
                ...addressData,
                userId: currentUser.id
            });

            toast.success('Adresse ajoutée', {
                description: 'Votre adresse a été ajoutée avec succès'
            });

            // Refresh addresses list
            fetchAddresses();
            return newAddress;
        } catch (err) {
            toast.error('Échec de l\'ajout d\'adresse', {
                description: err.message || 'Une erreur est survenue'
            });
            console.error('Error adding address:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, fetchAddresses]);

    const updateAddress = useCallback(async (addressId, addressData) => {
        setLoading(true);
        try {
            await AddressService.updateAddress(addressId, addressData);

            toast.success('Adresse mise à jour', {
                description: 'Votre adresse a été modifiée avec succès'
            });

            // Refresh addresses list
            fetchAddresses();
        } catch (err) {
            toast.error('Échec de la mise à jour d\'adresse', {
                description: err.message || 'Une erreur est survenue'
            });
            console.error('Error updating address:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchAddresses]);

    const deleteAddress = useCallback(async (addressId) => {
        setLoading(true);
        try {
            await AddressService.deleteAddress(addressId);

            toast.success('Adresse supprimée', {
                description: 'Votre adresse a été supprimée avec succès'
            });

            // Refresh addresses list
            fetchAddresses();
        } catch (err) {
            toast.error('Échec de la suppression d\'adresse', {
                description: err.message || 'Une erreur est survenue'
            });
            console.error('Error deleting address:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchAddresses]);

    const setDefaultAddress = useCallback(async (addressId, type) => {
        setLoading(true);
        try {
            await AddressService.setAsDefault(addressId, type);

            toast.success('Adresse par défaut mise à jour', {
                description: `Cette adresse est maintenant votre adresse ${type === 'shipping' ? 'de livraison' : 'de facturation'} par défaut`
            });

            // Refresh addresses list
            fetchAddresses();
        } catch (err) {
            toast.error('Échec de la mise à jour d\'adresse par défaut', {
                description: err.message || 'Une erreur est survenue'
            });
            console.error('Error setting default address:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchAddresses]);

    useEffect(() => {
        if (currentUser) {
            fetchAddresses();
        }
    }, [currentUser, fetchAddresses]);

    return {
        addresses,
        loading,
        error,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getShippingAddresses: () => addresses.filter(addr => addr.type === 'shipping'),
        getBillingAddresses: () => addresses.filter(addr => addr.type === 'billing'),
        getDefaultShippingAddress: () => addresses.find(addr => addr.type === 'shipping' && addr.isDefault),
        getDefaultBillingAddress: () => addresses.find(addr => addr.type === 'billing' && addr.isDefault)
    };
};