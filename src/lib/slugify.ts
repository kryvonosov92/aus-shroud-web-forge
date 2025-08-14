export function createSlug(text: string): string {
  return text
    .toLowerCase()
    // Replace special characters with their normalized equivalents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    // Handle specific special characters
    .replace(/©/g, 'copyright')
    .replace(/®/g, 'registered')
    .replace(/™/g, 'trademark')
    .replace(/&/g, 'and')
    .replace(/@/g, 'at')
    .replace(/%/g, 'percent')
    .replace(/\$/g, 'dollar')
    .replace(/£/g, 'pound')
    .replace(/€/g, 'euro')
    .replace(/¥/g, 'yen')
    // Remove or replace other special characters
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
}

export function generateExcerpt(content: string, maxWords: number = 30): string {
  // Remove markdown formatting for excerpt
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/`(.*?)`/g, '$1') // Remove code formatting
    .replace(/>\s/g, '') // Remove blockquotes
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim();

  const words = plainText.split(/\s+/);
  if (words.length <= maxWords) {
    return plainText;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
}