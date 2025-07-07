import { useState, useRef, useCallback } from "react";

// ノードとグローバルオフセットから、ノードとローカルオフセットを返す堅牢な関数
function getNodeAndOffsetByInnerText(root, globalOffset) {
  let currentOffset = 0;
  let found = null;
  function traverse(node) {
    if (found) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (currentOffset + text.length >= globalOffset) {
        found = { node, offset: globalOffset - currentOffset };
        return;
      }
      currentOffset += text.length;
    } else {
      for (let child of node.childNodes) {
        traverse(child);
        if (found) return;
      }
    }
  }
  traverse(root);
  return found || { node: root, offset: globalOffset };
}

export function useSlashCommand({ onSelectCommand, blockRef }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const slashIndexRef = useRef(-1);

  const handleInput = useCallback((e, refArg) => {
    const text = e.target.innerText;
    const slashIndex = text.lastIndexOf("/");
    
    // スラッシュが見つからない場合はメニューを非表示
    if (slashIndex === -1) {
      setIsVisible(false);
      setSearchQuery("");
      slashIndexRef.current = -1;
      return;
    }

    // スラッシュの後にスペースがある場合はメニューを非表示
    if (text[slashIndex + 1] === " ") {
      setIsVisible(false);
      setSearchQuery("");
      slashIndexRef.current = -1;
      return;
    }

    // スラッシュの位置を記録
    slashIndexRef.current = slashIndex;

    // スラッシュの後のテキストを検索クエリとして設定
    const query = text.slice(slashIndex + 1);
    setSearchQuery(query);

    // ブロック全体のrectを使ってメニューの位置を決定
    const blockEl = (refArg && refArg.current) || (blockRef && blockRef.current);
    if (blockEl) {
      const blockRect = blockEl.getBoundingClientRect();
      const parentRect = blockEl.offsetParent ? blockEl.offsetParent.getBoundingClientRect() : { top: 0, left: 0 };
      let top = blockRect.bottom - parentRect.top;
      let left = blockRect.left - parentRect.left;
      // 画面下端に近い場合は上側に表示（仮に300pxの高さで判定）
      const menuHeight = 300;
      if (blockRect.bottom + menuHeight > window.innerHeight) {
        top = blockRect.top - parentRect.top - menuHeight;
      }
      setPosition({ top, left });
    } else {
      // fallback: 旧ロジック
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const root = e.target;
        const { node, offset } = getNodeAndOffsetByInnerText(root, slashIndex);
        setTimeout(() => {
          const slashRange = document.createRange();
          try {
            slashRange.setStart(node, offset);
            slashRange.setEnd(node, offset + 1);
            const rect = slashRange.getBoundingClientRect();
            let top = rect.top;
            let left = rect.left;
            setPosition({ top, left });
          } catch {
            setPosition({ top: 60, left: 60 });
          }
        }, 0);
      }
    }

    setIsVisible(true);
  }, [blockRef]);

  const handleSelectCommand = useCallback((command) => {
    if (slashIndexRef.current === -1) return;
    onSelectCommand(command, slashIndexRef.current);
    setIsVisible(false);
    setSearchQuery("");
    slashIndexRef.current = -1;
  }, [onSelectCommand]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setSearchQuery("");
    slashIndexRef.current = -1;
  }, []);

  return {
    isVisible,
    position,
    searchQuery,
    handleInput,
    handleSelectCommand,
    handleClose,
  };
} 