import { create } from "zustand";
import { SocialLinks } from "./validateSocialLinks";

interface SocialLinksState {
  links: SocialLinks;
  setLinks: (links: SocialLinks) => void;
  updateLink: (key: keyof SocialLinks, value: string) => void;
  resetLinks: () => void;
}

export const useSocialLinksStore = create<SocialLinksState>((set) => ({
  links: {
    linkedin: "",
    twitter: "",
    website: "",
  },
  setLinks: (links) => set({ links }),
  updateLink: (key, value) =>
    set((state) => ({
      links: { ...state.links, [key]: value },
    })),
  resetLinks: () =>
    set({
      links: {
        linkedin: "",
        twitter: "",
        website: "",
      },
    }),
}));
