import { create } from "zustand";

type NewTransactionState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

const useNewTransaction = create<NewTransactionState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useNewTransaction;
