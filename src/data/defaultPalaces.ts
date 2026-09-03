import { UserPalace } from '../types';

export const defaultPalaces: UserPalace[] = [
  {
    id: 'palace_home_default',
    name: 'My Cozy Home',
    type: 'home',
    iconName: 'home-outline',
    createdAt: '2026-01-01T00:00:00.000Z',
    spots: [
      { id: 'spot_1', order: 1, name: 'Front Porch & Door', iconName: 'door-closed' },
      { id: 'spot_2', order: 2, name: 'Comfy Living Room Sofa', iconName: 'chair-rolling' },
      { id: 'spot_3', order: 3, name: 'Big Screen TV', iconName: 'television' },
      { id: 'spot_4', order: 4, name: 'Kitchen Dining Table', iconName: 'silverware-fork-knife' },
      { id: 'spot_5', order: 5, name: 'Master Bed', iconName: 'bed' },
    ],
  },
  {
    id: 'palace_cafe_default',
    name: 'Favorite Coffee Shop',
    type: 'custom',
    iconName: 'coffee-outline',
    createdAt: '2026-01-01T00:00:00.000Z',
    spots: [
      { id: 'spot_c1', order: 1, name: 'Entrance Glass Door', iconName: 'glass-door' },
      { id: 'spot_c2', order: 2, name: 'Espresso Bar Counter', iconName: 'coffee' },
      { id: 'spot_c3', order: 3, name: 'Bakery Pastry Shelf', iconName: 'bread-slice' },
      { id: 'spot_c4', order: 4, name: 'Corner Leather Armchair', iconName: 'seat' },
      { id: 'spot_c5', order: 5, name: 'Sunny Window Table', iconName: 'window-closed' },
    ],
  },
];
