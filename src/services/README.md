# Services

This directory contains service modules for API calls and Firebase operations.

## Structure

```
services/
├── firebase.ts         # Firebase initialization
├── auth.service.ts     # Authentication operations
├── firestore.service.ts # Firestore CRUD operations
├── storage.service.ts  # Firebase Storage operations
└── [feature].service.ts # Feature-specific services
```

## Service Template

```typescript
import { firestore } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

export class UserService {
  private collectionName = 'users';

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(firestore, this.collectionName, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Create or update user
   */
  async setUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, userId);
      await setDoc(docRef, {
        ...userData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  }

  /**
   * Update user fields
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
```

## Best Practices

- Use class-based or functional approach consistently
- Add JSDoc comments for public methods
- Handle errors gracefully
- Return typed responses
- Separate Firebase logic from components
- Use singleton pattern for service instances
- Add retry logic for network failures


