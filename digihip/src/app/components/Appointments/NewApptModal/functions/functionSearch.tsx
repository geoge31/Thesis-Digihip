/**
 * 
 * @param text 
 * @param searchTerm 
 * @returns 
 */
export default function highlightMatch(text: string, searchTerm: string) {
    if (!searchTerm) return text;
  
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = (text || '').split(regex);
  
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <span key={index} style={{ backgroundColor: 'lightblue' }}>{part}</span> 
        : part
    );
  }