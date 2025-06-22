export const slugify = (text: string) => {
  return text.toLowerCase().replace(/ /g, '-');
};

export const formatSlug = (text: string) => {
  return text.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};
