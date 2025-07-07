export const isEmptyBlock = (el) => {
  return el?.textContent.trim() === "";
};

export const isCursorAtStart = () => {
  const sel = window.getSelection();
  if (!sel.rangeCount) return false;
  const range = sel.getRangeAt(0);
  return range.startOffset === 0 && range.endOffset === 0;
};
