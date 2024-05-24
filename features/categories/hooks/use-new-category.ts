import { create } from "zustand";

type NewCategoryState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

const useNewCategory = create<NewCategoryState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useNewCategory;
