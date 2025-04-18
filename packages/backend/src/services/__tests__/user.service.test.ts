import { UserService } from '../user.service';
import { UserRepository } from '../../db/repositories/user.repository';
import { AppError } from '../../api/middlewares/error.middleware';

// Mock dependencies
jest.mock('../../db/repositories/user.repository');
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new instance of the service for each test
    userService = new UserService();
    
    // Get the mocked repository instance
    mockUserRepository = (UserRepository as jest.MockedClass<typeof UserRepository>).mock.instances[0] as jest.Mocked<UserRepository>;
  });
  
  describe('findById', () => {
    it('should return a user if found', async () => {
      // Arrange
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        is_email_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.findById('123');
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
    });
    
    it('should return undefined if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(undefined);
      
      // Act
      const result = await userService.findById('456');
      
      // Assert
      expect(result).toBeUndefined();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('456');
    });
  });
  
  describe('createUser', () => {
    it('should create a user with roles', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
      };
      
      const createdUser = {
        ...userData,
        id: 'new-user-id',
        password: 'hashed_password',
        is_email_verified: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.createUserWithRoles.mockResolvedValue(createdUser);
      
      // Act
      const result = await userService.createUser(userData, [1]);
      
      // Assert
      expect(result).toEqual(createdUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUserRepository.createUserWithRoles).toHaveBeenCalledWith(
        expect.objectContaining({
          ...userData,
          password: 'hashed_password',
        }),
        [1]
      );
    });
    
    it('should throw error if email already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };
      
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing-id',
        email: 'existing@example.com',
        password: 'hashed_password',
        is_email_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        new AppError(409, 'User with this email already exists')
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(mockUserRepository.createUserWithRoles).not.toHaveBeenCalled();
    });
  });
});