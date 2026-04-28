import { create } from 'zustand';
import { Shop } from '../database/shops';
import { Driver } from '../database/drivers';

type AuthStore = {
  role: 'shop' | 'driver' | null;
  shop: Shop | null;
  driver: Driver | null;
  setShop: (shop: Shop) => void;
  setDriver: (driver: Driver) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  role: null,
  shop: null,
  driver: null,
  setShop: (shop) => set({ shop, role: 'shop', driver: null }),
  setDriver: (driver) => set({ driver, role: 'driver', shop: null }),
  logout: () => set({ role: null, shop: null, driver: null }),
}));