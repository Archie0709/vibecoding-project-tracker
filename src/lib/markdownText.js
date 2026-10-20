/**
 * Turns Markdown into plain text for short previews (e.g. the 2-line description on a
 * card), so cards don't show raw symbols like ** or #. The full formatted version is
 * shown in the task modal.
 */
export function stripMarkdown(md = '') {
  return md
    .replace(/```[\s\S]*?```/g, ' ')           // fenced code blocks
    .replace(/`([^`]*)`/g, '$1')               // inline code
    .replace(/!\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g, '$1') // images → alt text
    .replace(/\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g, '$1')  // links → link text (allows one level of brackets in the URL)
    .replace(/<[^>]+>/g, ' ')                   // raw HTML tags
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')        // headings
    .replace(/^\s{0,3}>\s?/gm, '')             // blockquotes
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '') // task list items
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')     // list markers
    .replace(/(\*\*|__)(.*?)\1/g, '$2')        // bold
    .replace(/\*(.+?)\*/g, '$1')                // italic *text*
    .replace(/(^|\W)_(.+?)_(?=\W|$)/g, '$1$2') // italic _text_ (leaves snake_case names alone)
    .replace(/~~(.*?)~~/g, '$1')               // strikethrough
    .replace(/^\s*([-*_]\s*){3,}$/gm, ' ')     // horizontal rules
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/gm, ' ') // table divider rows
    .replace(/\|/g, ' ')                       // table pipes
    .replace(/\s+/g, ' ')
    .trim();
}
