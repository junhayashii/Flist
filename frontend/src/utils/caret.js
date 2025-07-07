export function moveCaretToClosestXAndLine(
  targetEl,
  caretX,
  currentTop,
  direction
) {
  const walker = document.createTreeWalker(targetEl, NodeFilter.SHOW_TEXT);
  let bestNode = null;
  let bestOffset = 0;
  let minDiff = Infinity;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    for (let i = 0; i <= node.length; i++) {
      const range = document.createRange();
      range.setStart(node, i);
      range.setEnd(node, i);
      const rects = range.getClientRects();
      if (rects.length === 0) continue;
      const rect = rects[0];

      const isCorrectLine =
        (direction === "down" && rect.top > currentTop + 2) ||
        (direction === "up" && rect.bottom < currentTop - 2);
      if (!isCorrectLine) continue;

      const diff = Math.abs(rect.left - caretX);
      if (diff < minDiff) {
        minDiff = diff;
        bestNode = node;
        bestOffset = i;
      }
    }
  }

  const sel = window.getSelection();
  const range = document.createRange();
  if (bestNode != null) {
    range.setStart(bestNode, bestOffset);
  } else {
    range.selectNodeContents(targetEl);
    range.collapse(false);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}
