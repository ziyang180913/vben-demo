import { defineStore } from 'pinia';
import { getCategories } from '@/api/global';
import { createLocalStorage } from '@/utils/cache';

const Storage = createLocalStorage({
  prefixKey: 'categroyTree',
});

export type IUserState = {
  categroyTree: any[];
};

export const useCategroyStore = defineStore('categroy', {
  state: (): IUserState => ({
    categroyTree: [],
  }),
  getters: {
    getCategroyTree(state): any[] {
      return state.categroyTree || Storage.get('categroyTree') || [];
    },
  },
  actions: {
    setCategroyTree(data: any) {
      this.categroyTree = data;
      // 存储到 localStorage
      Storage.set('categroyTree', data);
    },
    // 获取业态数据
    async fetchCategroyTree() {
      const res = await getCategories();
      const data = res?.tree || [];
      this.setCategroyTree(data);
    },
  },
});
