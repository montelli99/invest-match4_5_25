interface SocialLinksError {
  linkedin?: string;
  twitter?: string;
  website?: string;
}

const URL_PATTERNS = {
  linkedin: /^https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
  twitter: /^https?:\/\/(?:www\.)?twitter\.com\/[\w-]+\/?$/,
  website: /^https?:\/\/(?:[\w-]+\.)+[\w-]+(?:\/[\w-./?%&=]*)?$/
};

const ERROR_MESSAGES = {
  linkedin: "Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)",
  twitter: "Please enter a valid Twitter profile URL (e.g., https://twitter.com/username)",
  website: "Please enter a valid website URL starting with http:// or https://"
};

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export const validateSocialLinks = (links: SocialLinks): SocialLinksError => {
  const errors: SocialLinksError = {};

  Object.entries(links).forEach(([key, value]) => {
    if (value && key in URL_PATTERNS) {
      const pattern = URL_PATTERNS[key as keyof typeof URL_PATTERNS];
      if (!pattern.test(value)) {
        errors[key as keyof SocialLinksError] = ERROR_MESSAGES[key as keyof typeof ERROR_MESSAGES];
      }
    }
  });

  return errors;
};
