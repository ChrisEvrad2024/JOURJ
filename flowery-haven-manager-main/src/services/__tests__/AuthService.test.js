// src/services/__tests__/AuthService.test.js
import AuthService from '../AuthService';
import DbService from '../db/DbService';

// Mock du DbService
jest.mock('../db/DbService', () => ({
    get: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn(),
    clear: jest.fn(),
}));

describe('AuthService', () => {
    beforeEach(() => {
        // Réinitialiser les mocks entre les tests
        jest.clearAllMocks();

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn(),
            },
            writable: true
        });
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            // Arrange
            const userData = {
                email: 'test@example.com',
                password: 'Password123',
                firstName: 'John',
                lastName: 'Doe'
            };

            DbService.get.mockResolvedValueOnce(null); // Aucun utilisateur existant
            DbService.add.mockResolvedValueOnce({ id: 'user-123', ...userData, role: 'customer' });

            // Act
            const result = await AuthService.register(userData);

            // Assert
            expect(DbService.get).toHaveBeenCalledWith('users', expect.any(String));
            expect(DbService.add).toHaveBeenCalledWith('users', expect.objectContaining({
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: 'customer'
            }));

            expect(result).toEqual(expect.objectContaining({
                id: 'user-123',
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: 'customer'
            }));

            // Le mot de passe ne devrait pas être retourné
            expect(result.password).toBeUndefined();

            // localStorage devrait être mis à jour
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'currentUser',
                expect.any(String)
            );
        });

        it('should throw an error if the email is already in use', async () => {
            // Arrange
            const userData = {
                email: 'existing@example.com',
                password: 'Password123',
                firstName: 'John',
                lastName: 'Doe'
            };

            DbService.get.mockResolvedValueOnce({ id: 'existing-user' }); // Utilisateur existant

            // Act & Assert
            await expect(AuthService.register(userData)).rejects.toThrow('Email already in use');
            expect(DbService.add).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should login a user with valid credentials', async () => {
            // Arrange
            const credentials = {
                email: 'test@example.com',
                password: 'Password123'
            };

            const hashedPassword = await AuthService.hashPassword(credentials.password);
            const mockUser = {
                id: 'user-123',
                email: credentials.email,
                password: hashedPassword,
                firstName: 'John',
                lastName: 'Doe',
                role: 'customer'
            };

            DbService.get.mockResolvedValueOnce(mockUser);

            // Act
            const result = await AuthService.login(credentials.email, credentials.password);

            // Assert
            expect(DbService.get).toHaveBeenCalledWith('users', expect.any(String));

            expect(result).toEqual(expect.objectContaining({
                id: mockUser.id,
                email: mockUser.email,
                firstName: mockUser.firstName,
                lastName: mockUser.lastName,
                role: mockUser.role
            }));

            // Le mot de passe ne devrait pas être retourné
            expect(result.password).toBeUndefined();

            // localStorage devrait être mis à jour
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'currentUser',
                expect.any(String)
            );
        });

        it('should throw an error for invalid email', async () => {
            // Arrange
            DbService.get.mockResolvedValueOnce(null); // Aucun utilisateur trouvé

            // Act & Assert
            await expect(AuthService.login('nonexistent@example.com', 'anyPassword'))
                .rejects.toThrow('Invalid email or password');
        });

        it('should throw an error for invalid password', async () => {
            // Arrange
            const credentials = {
                email: 'test@example.com',
                password: 'WrongPassword'
            };

            const correctPassword = 'Password123';
            const hashedPassword = await AuthService.hashPassword(correctPassword);

            const mockUser = {
                id: 'user-123',
                email: credentials.email,
                password: hashedPassword,
                firstName: 'John',
                lastName: 'Doe'
            };

            DbService.get.mockResolvedValueOnce(mockUser);

            // Act & Assert
            await expect(AuthService.login(credentials.email, credentials.password))
                .rejects.toThrow('Invalid email or password');
        });
    });

    describe('logout', () => {
        it('should log out the current user', async () => {
            // Act
            await AuthService.logout();

            // Assert
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('currentUser');
        });
    });

    describe('getCurrentUser', () => {
        it('should return the current user from localStorage', async () => {
            // Arrange
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'customer'
            };

            window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));

            // Act
            const result = await AuthService.getCurrentUser();

            // Assert
            expect(window.localStorage.getItem).toHaveBeenCalledWith('currentUser');
            expect(result).toEqual(mockUser);
        });

        it('should return null if no user is logged in', async () => {
            // Arrange
            window.localStorage.getItem.mockReturnValueOnce(null);

            // Act
            const result = await AuthService.getCurrentUser();

            // Assert
            expect(result).toBeNull();
        });
    });
});