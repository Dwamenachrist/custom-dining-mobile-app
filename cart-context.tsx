import React, { createContext, useContext, useState, ReactNode } from 'react';

// Generic meal interface that works with both mock and backend data
interface CartMeal {
  id: string;
  name: string;
  price: number;
  image: any;
  restaurant?: string;
}

interface CartItem {
  meal: CartMeal;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (meal: CartMeal, quantity?: number) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (meal: CartMeal, quantity: number = 1) => {
    setItems(currentItems => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(
        item => item.meal.id === meal.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item to cart
        const newCartItem: CartItem = {
          meal,
          quantity,
        };
        return [...currentItems, newCartItem];
      }
    });
  };

  const removeFromCart = (mealId: string) => {
    setItems(currentItems => 
      currentItems.filter(item => item.meal.id !== mealId)
    );
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.meal.id === mealId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + (item.meal.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 