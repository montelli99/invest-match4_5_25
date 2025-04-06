import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookmarkState {
  bookmarkedInvestors: Set<string>;
  toggleBookmark: (investorId: string) => void;
  isBookmarked: (investorId: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>(
  persist(
    (set, get) => ({
      bookmarkedInvestors: new Set<string>(),
      toggleBookmark: (investorId: string) =>
        set((state) => {
          const newBookmarks = new Set(state.bookmarkedInvestors);
          if (newBookmarks.has(investorId)) {
            newBookmarks.delete(investorId);
          } else {
            newBookmarks.add(investorId);
          }
          return { bookmarkedInvestors: newBookmarks };
        }),
      isBookmarked: (investorId: string) =>
        get().bookmarkedInvestors.has(investorId),
    }),
    {
      name: "investor-bookmarks",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              bookmarkedInvestors: new Set(state.bookmarkedInvestors),
            },
          };
        },
        setItem: (name, value) => {
          const { state } = value;
          const serializedState = {
            ...state,
            bookmarkedInvestors: Array.from(state.bookmarkedInvestors),
          };
          localStorage.setItem(
            name,
            JSON.stringify({ state: serializedState }),
          );
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);
