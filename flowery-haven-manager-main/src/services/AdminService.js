// src/services/AdminService.js
import DbService from './db/DbService';
import { STORES } from './db/DbConfig';
import AuthService from './AuthService';
import OrderService from './OrderService';
import ProductService from './ProductService';
import StorageService from './StorageService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour les fonctionnalités d'administration
 */
class AdminService {
  /**
   * Vérifie si l'utilisateur actuel est un administrateur
   * @returns {Promise<boolean>} True si l'utilisateur est admin
   */
  static async isAdmin() {
    try {
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        return false;
      }
      
      return currentUser.role === 'admin';
    } catch (error) {
      console.error('Erreur lors de la vérification des droits admin:', error);
      return false;
    }
  }
  
  /**
   * Génère un tableau de bord avec des statistiques pour l'admin
   * @returns {Promise<Object>} Données du tableau de bord
   */
  static async getDashboardStats() {
    try {
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Accès non autorisé');
      }
      
      // Récupérer les données nécessaires
      const orders = await DbService.getAll(STORES.ORDERS);
      const products = await DbService.getAll(STORES.PRODUCTS);
      const users = await DbService.getAll(STORES.USERS);
      
      // Statistiques de vente
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const processingOrders = orders.filter(order => order.status === 'processing').length;
      const shippedOrders = orders.filter(order => order.status === 'shipped').length;
      const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
      const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
      
      // Statistiques produits
      const totalProducts = products.length;
      const lowStockProducts = products.filter(product => product.stock !== undefined && product.stock < 5).length;
      const outOfStockProducts = products.filter(product => product.stock !== undefined && product.stock === 0).length;
      
      // Statistiques utilisateurs
      const totalUsers = users.length;
      
      // Récupérer les 5 dernières commandes
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      // Statistiques des ventes du mois
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthOrders = orders.filter(order => new Date(order.createdAt) >= monthStart);
      const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      return {
        totalRevenue,
        monthRevenue,
        ordersCount: {
          total: orders.length,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        productsCount: {
          total: totalProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        },
        usersCount: totalUsers,
        recentOrders
      };
    } catch (error) {
      console.error('Erreur lors de la génération des statistiques du tableau de bord:', error);
      throw error;
    }
  }
  
  /**
   * Génère et télécharge une facture PDF pour une commande
   * @param {string} orderId - ID de la commande
   * @returns {Promise<Blob>} Blob du fichier PDF
   */
  static async generateInvoice(orderId) {
    try {
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Accès non autorisé');
      }
      
      const order = await OrderService.getOrderById(orderId);
      
      if (!order) {
        throw new Error('Commande non trouvée');
      }
      
      // Dans une application réelle, cela utiliserait une bibliothèque
      // comme jsPDF, pdfmake ou appellerait une API pour générer un vrai PDF
      
      // Simuler un délai de génération
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simule le contenu d'une facture pour cette implémentation de démonstration
      const invoiceContent = `
        FACTURE #INV-${orderId}
        Date: ${new Date().toLocaleDateString()}
        
        Client: ${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}
        Commande: ${orderId}
        
        Articles:
        ${order.items.map(item => `- ${item.name} x${item.quantity}: ${(item.price * item.quantity).toFixed(2)} XAF`).join('\n')}
        
        Sous-total: ${order.subtotal.toFixed(2)} XAF
        Frais de livraison: ${order.shippingCost.toFixed(2)} XAF
        TVA: ${order.taxAmount.toFixed(2)} XAF
        
        Total: ${order.total.toFixed(2)} XAF
      `;
      
      // Dans une vraie application, retournez le Blob du PDF
      // Pour cette démo, on retourne juste un Blob du texte
      return new Blob([invoiceContent], { type: 'text/plain' });
    } catch (error) {
      console.error(`Erreur lors de la génération de la facture pour la commande ${orderId}:`, error);
      throw error;
    }
  }
  
  /**
   * Envoie un email au client concernant sa commande
   * @param {string} orderId - ID de la commande
   * @param {string} type - Type d'email (confirmation, shipped, delivered, etc.)
   * @param {string} [customMessage] - Message personnalisé à inclure
   * @returns {Promise<boolean>} Succès de l'opération
   */
  static async sendOrderEmail(orderId, type, customMessage = '') {
    try {
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Accès non autorisé');
      }
      
      const order = await OrderService.getOrderById(orderId);
      
      if (!order) {
        throw new Error('Commande non trouvée');
      }
      
      if (!order.shippingAddress?.email) {
        throw new Error('Email du client non disponible');
      }
      
      // Dans une application réelle, cela enverrait un véritable email
      // en utilisant un service comme SendGrid, Mailgun, SES, etc.
      
      console.log(`Simulation d'envoi d'email de type "${type}" pour la commande ${orderId} à ${order.shippingAddress.email}`);
      console.log(`Message personnalisé: ${customMessage}`);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email pour la commande ${orderId}:`, error);
      throw error;
    }
  }
  
  /**
   * Récupère les performances des ventes par période
   * @param {string} period - Période ('day', 'week', 'month', 'year')
   * @param {Date} [startDate] - Date de début
   * @param {Date} [endDate] - Date de fin
   * @returns {Promise<Object>} Statistiques de performance
   */
  static async getSalesPerformance(period = 'month', startDate = null, endDate = null) {
    try {
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Accès non autorisé');
      }
      
      // Récupérer les données de vente par période
      const salesByPeriod = await OrderService.getSalesByPeriod(period, startDate, endDate);
      
      // Récupérer toutes les commandes
      const orders = await DbService.getAll(STORES.ORDERS);
      
      // Déterminer la période précédente pour comparaison
      const now = new Date();
      let previousStart, previousEnd;
      
      switch (period) {
        case 'day':
          previousStart = new Date(now);
          previousStart.setDate(previousStart.getDate() - 1);
          break;
        case 'week':
          previousStart = new Date(now);
          previousStart.setDate(previousStart.getDate() - 7);
          previousEnd = new Date(previousStart);
          previousEnd.setDate(previousEnd.getDate() - 7);
          break;
        case 'month':
          previousStart = new Date(now);
          previousStart.setMonth(previousStart.getMonth() - 1);
          previousEnd = new Date(previousStart);
          previousEnd.setMonth(previousEnd.getMonth() - 1);
          break;
        case 'year':
          previousStart = new Date(now);
          previousStart.setFullYear(previousStart.getFullYear() - 1);
          previousEnd = new Date(previousStart);
          previousEnd.setFullYear(previousEnd.getFullYear() - 1);
          break;
        default:
          previousStart = new Date(now);
          previousStart.setMonth(previousStart.getMonth() - 1);
      }
      
      // Filtrer les commandes pour la période précédente
      const previousOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= previousStart && orderDate <= (previousEnd || now);
      });
      
      // Calculer les chiffres pour la période précédente
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const currentRevenue = salesByPeriod.reduce((sum, data) => sum + data.revenue, 0);
      
      // Calculer les variations
      const revenueChange = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : 100;
      
      return {
        currentPeriod: {
          revenue: currentRevenue,
          orders: salesByPeriod.reduce((sum, data) => sum + data.orders, 0),
          averageOrderValue: currentRevenue / Math.max(1, salesByPeriod.reduce((sum, data) => sum + data.orders, 0))
        },
        previousPeriod: {
          revenue: previousRevenue,
          orders: previousOrders.length
        },
        changes: {
          revenue: revenueChange.toFixed(1),
          orders: previousOrders.length > 0 
            ? (((salesByPeriod.reduce((sum, data) => sum + data.orders, 0) - previousOrders.length) / previousOrders.length) * 100).toFixed(1)
            : '100'
        },
        salesByPeriod,
        period
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des performances de vente:', error);
      throw error;
    }
  }
  
  /**
   * Génère un rapport au format CSV
   * @param {string} type - Type de rapport ('orders', 'products', 'users')
   * @param {Object} [filters] - Filtres à appliquer
   * @returns {Promise<string>} Contenu CSV
   */
  static async generateReport(type, filters = {}) {
    try {
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Accès non autorisé');
      }
      
      let csvContent = '';
      
      switch (type) {
        case 'orders':
          // Récupérer les commandes (filtrées si nécessaire)
          const orders = await OrderService.getAllOrders(filters);
          csvContent = OrderService.exportOrdersToCsv(orders);
          break;
          
        case 'products':
          // Récupérer tous les produits
          const products = await ProductService.getAllProducts();
          
          // Créer le contenu CSV pour les produits
          const productHeaders = ['ID', 'Nom', 'Prix', 'Stock', 'Catégorie', 'Date de création', 'Dernière mise à jour'];
          
          const productRows = products.map(product => [
            product.id,
            product.name,
            product.price,
            product.stock !== undefined ? product.stock : 'N/A',
            product.category || 'N/A',
            new Date(product.createdAt).toLocaleDateString(),
            new Date(product.updatedAt).toLocaleDateString()
          ]);
          
          csvContent = [
            productHeaders.join(','),
            ...productRows.map(row => row.join(','))
          ].join('\n');
          break;
          
        case 'users':
          // Récupérer tous les utilisateurs
          const users = await DbService.getAll(STORES.USERS);
          
          // Créer le contenu CSV pour les utilisateurs
          const userHeaders = ['ID', 'Nom', 'Prénom', 'Email', 'Rôle', 'Date d\'inscription'];
          
          const userRows = users.map(user => [
            user.id,
            user.lastName,
            user.firstName,
            user.email,
            user.role || 'client',
            new Date(user.createdAt).toLocaleDateString()
          ]);
          
          csvContent = [
            userHeaders.join(','),
            ...userRows.map(row => row.join(','))
          ].join('\n');
          break;
          
        default:
          throw new Error(`Type de rapport non pris en charge: ${type}`);
      }
      
      return csvContent;
    } catch (error) {
      console.error(`Erreur lors de la génération du rapport ${type}:`, error);
      throw error;
    }
  }
}

export default AdminService;