import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string; // Product ID (string to handle potentially complex IDs or UUIDs)
    productId: number; // Original DB ID
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    options?: { name: string; value: string }[];
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;

    // Actions
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;

    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;

    // Getters
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            addItem: (newItem) => {
                set((state) => {
                    // Generate a unique ID based on product ID and options (for future option support)
                    // For now, simple product check
                    const existingItemIndex = state.items.findIndex(
                        (item) => item.productId === newItem.productId
                    );

                    if (existingItemIndex > -1) {
                        // Update quantity if exists
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += newItem.quantity;
                        return { items: newItems, isOpen: true }; // Auto open cart on add
                    }

                    return {
                        items: [...state.items, { ...newItem, id: `${newItem.productId}-${Date.now()}` }],
                        isOpen: true,
                    };
                });
            },

            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),

            updateQuantity: (id, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        return {
                            items: state.items.filter((item) => item.id !== id),
                        };
                    }
                    return {
                        items: state.items.map((item) =>
                            item.id === id ? { ...item, quantity } : item
                        ),
                    };
                }),

            clearCart: () => set({ items: [] }),

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'meaningfill-cart-storage', // key in localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);
