// src/services/WorkerService.js
class WorkerService {
    constructor() {
        // Vérifier si Web Workers est supporté
        this.supported = typeof Worker !== 'undefined';
        this.workers = new Map();
        this.callbacks = new Map();
    }

    /**
     * Crée un nouveau worker pour une tâche spécifique
     * @param {string} taskName - Nom unique pour la tâche
     * @param {Function} workerFunction - Fonction à exécuter dans le worker
     */
    createWorker(taskName, workerFunction) {
        if (!this.supported) {
            console.warn('Web Workers not supported in this browser');
            return;
        }

        // Supprimer un worker existant avec le même nom
        if (this.workers.has(taskName)) {
            this.terminateWorker(taskName);
        }

        // Convertir la fonction en string pour le worker
        const workerCode = `
        self.onmessage = function(e) {
          const result = (${workerFunction.toString()})(e.data);
          self.postMessage(result);
        }
      `;

        // Créer un blob contenant le code du worker
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);

        // Créer un nouveau worker
        const worker = new Worker(workerUrl);
        this.workers.set(taskName, worker);
        this.callbacks.set(taskName, new Map());

        // Configurer l'événement de message
        worker.onmessage = (e) => {
            const { id, result } = e.data;
            const callbackMap = this.callbacks.get(taskName);

            if (callbackMap && callbackMap.has(id)) {
                const { resolve } = callbackMap.get(id);
                resolve(result);
                callbackMap.delete(id);
            }
        };

        worker.onerror = (e) => {
            console.error(`Error in worker ${taskName}:`, e);
            // Rejeter toutes les promesses en attente
            const callbackMap = this.callbacks.get(taskName);
            if (callbackMap) {
                callbackMap.forEach(({ reject }) => {
                    reject(new Error(`Worker error: ${e.message}`));
                });
                callbackMap.clear();
            }
        };

        // Nettoyer l'URL
        URL.revokeObjectURL(workerUrl);
    }

    /**
     * Exécute une tâche dans un worker
     * @param {string} taskName - Nom de la tâche
     * @param {any} data - Données à traiter
     * @returns {Promise<any>} - Résultat de la tâche
     */
    executeTask(taskName, data) {
        if (!this.supported || !this.workers.has(taskName)) {
            return Promise.reject(new Error(`Worker ${taskName} not available`));
        }

        const worker = this.workers.get(taskName);
        const callbackMap = this.callbacks.get(taskName);
        const id = Date.now() + Math.random().toString(36).substr(2, 9);

        return new Promise((resolve, reject) => {
            callbackMap.set(id, { resolve, reject });
            worker.postMessage({ id, data });

            // Timeout de sécurité
            setTimeout(() => {
                if (callbackMap.has(id)) {
                    callbackMap.delete(id);
                    reject(new Error(`Task ${taskName} timed out`));
                }
            }, 30000); // 30s timeout
        });
    }

    /**
     * Arrête un worker spécifique
     * @param {string} taskName - Nom de la tâche
     */
    terminateWorker(taskName) {
        if (this.workers.has(taskName)) {
            const worker = this.workers.get(taskName);
            worker.terminate();
            this.workers.delete(taskName);
            this.callbacks.delete(taskName);
        }
    }

    /**
     * Arrête tous les workers
     */
    terminateAll() {
        this.workers.forEach((worker, taskName) => {
            this.terminateWorker(taskName);
        });
    }
}

export default new WorkerService();