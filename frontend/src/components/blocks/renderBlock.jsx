import TaskBlock from "./TaskBlock";
import NoteBlock from "./NoteBlock";
import HeadingBlock from "./HeadingBlock";
import ListItemBlock from "./ListItemBlock";
import QuoteBlock from "./QuoteBlock";
import DividerBlock from "./DividerBlock";
import EditableBlock from "./EditableBlock";

export default function renderBlock({
  block,
  index,
  blocks,
  editingBlockId,
  selectedBlockId,
  blockRefs,
  handleBlockClick,
  handleToggleDone,
  handleBlur,
  handleKeyDown,
  handleInput,
  setEditingBlockId,
  setBlocks,
  saveBlock,
  updateBlock,
  setIsSlashMenuVisible,
}) {
  const isTask = block.type === "task" || block.type === "task-done";
  const isEditing = editingBlockId === block.id;

  if (isTask) {
    return (
      <TaskBlock
        key={`task-${block.id}`}
        block={block}
        onClick={() => handleBlockClick(block.id)}
        onToggle={() =>
          handleToggleDone({
            blockId: block.id,
            blocks,
            setBlocks,
            updateBlock,
          })
        }
        onOpenDetail={handleBlockClick}
        isEditable={isEditing}
        onBlur={() => handleBlur(block)}
        editableRef={(el) => {
          if (el) blockRefs.current[block.id] = el;
        }}
        onKeyDown={(e) => handleKeyDown(e, block, index)}
        isSelected={block.id === selectedBlockId}
      />
    );
  }

  if (block.type === "note") {
    return (
      <NoteBlock
        key={`note-${block.id}`}
        block={block}
        onClick={() => handleBlockClick(block.id)}
        onOpenDetail={handleBlockClick}
        isEditable={isEditing}
        onBlur={() => handleBlur(block)}
        editableRef={(el) => {
          if (el) blockRefs.current[block.id] = el;
        }}
        onKeyDown={(e) => handleKeyDown(e, block, index)}
        isSelected={block.id === selectedBlockId}
      />
    );
  }

  if (block.type === "heading1") {
    return (
      <HeadingBlock
        key={`heading1-${block.id}`}
        block={block}
        level={1}
        onClick={() => handleBlockClick(block.id)}
        isEditable={isEditing}
        onBlur={() => handleBlur({
          block,
          el: blockRefs.current[block.id],
          setBlocks,
          saveBlock,
          updateBlock,
        })}
        editableRef={(el) => {
          if (el) blockRefs.current[block.id] = el;
        }}
        onKeyDown={(e) => handleKeyDown(e, block, index)}
        isSelected={block.id === selectedBlockId}
      />
    );
  }

  if (block.type === "heading2") {
    return (
      <HeadingBlock
        key={`heading2-${block.id}`}
        block={block}
        level={2}
        onClick={() => handleBlockClick(block.id)}
        isEditable={isEditing}
        onBlur={() => handleBlur({
          block,
          el: blockRefs.current[block.id],
          setBlocks,
          saveBlock,
          updateBlock,
        })}
        editableRef={(el) => {
          if (el) blockRefs.current[block.id] = el;
        }}
        onKeyDown={(e) => handleKeyDown(e, block, index)}
        isSelected={block.id === selectedBlockId}
      />
    );
  }

  if (block.type === "heading3") {
    return (
      <HeadingBlock
        key={`heading3-${block.id}`}
        block={block}
        level={3}
        onClick={() => handleBlockClick(block.id)}
        isEditable={isEditing}
        onBlur={() => handleBlur({
          block,
          el: blockRefs.current[block.id],
          setBlocks,
          saveBlock,
          updateBlock,
        })}
        editableRef={(el) => {
          if (el) blockRefs.current[block.id] = el;
        }}
        onKeyDown={(e) => handleKeyDown(e, block, index)}
        isSelected={block.id === selectedBlockId}
      />
    );
  }

  if (block.type === "bullet") {
    return (
      <ListItemBlock
        key={`bullet-${block.id}`}
        block={block}
        type="bullet"
        onClick={() => handleBlockClick(block.id)}
        isEditable={isEditing}
        onBlur={() => handleBlur({
          block,
          el: blockRefs.current[block.id],
          setBlocks,
          saveBlock,
          updateBlock,
        })}
        editableRef={(el) => {
          if (el) blockRefs.current[block.id] = el;
        }}
        onKeyDown={(e) => handleKeyDown(e, block, index)}
        isSelected={block.id === selectedBlockId}
      />
    );
  }

  if (block.type === "numbered") {
    return (
      <ListItemBlock
        key={`numbered-${block.id}`}
        block={block}
        type="numbered"
        onClick={() => handleBlockClick(block.id)}
        isEditable={isEditing}
        onBlur={() => handleBlur({
          block,
          el: blockRefs.current[block.id],
          setBlocks,
          saveBlock,
          updateBlock,
        })}
        editableRef={(el) => {
          if (el) blockRefs.current[block.id] = el;
        }}
        onKeyDown={(e) => handleKeyDown(e, block, index)}
        isSelected={block.id === selectedBlockId}
      />
    );
  }

  if (block.type === "quote") {
    return (
      <QuoteBlock
        key={`quote-${block.id}`}
        block={block}
        onClick={() => handleBlockClick(block.id)}
        isEditable={isEditing}
        onBlur={() => handleBlur(block)}
        editableRef={(el) => {
          if (el) blockRefs.current[block.id] = el;
        }}
        onKeyDown={(e) => handleKeyDown(e, block, index)}
        isSelected={block.id === selectedBlockId}
      />
    );
  }

  if (block.type === "divider") {
    return <DividerBlock block={block} onClick={handleBlockClick} />;
  }

  return (
    <EditableBlock
      block={block}
      onFocus={() => setEditingBlockId(block.id)}
      onInput={(e) =>
        handleInput({
          e,
          id: block.id,
          blocks,
          setBlocks,
          updateBlock,
        })
      }
      onBlur={(e) => {
        if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
          handleBlur({
            block,
            el: blockRefs.current[block.id],
            setBlocks,
            saveBlock,
            updateBlock,
          });
        }
      }}
      onKeyDown={(e) => handleKeyDown(e, block, index)}
      editableRef={(el) => {
        if (el) blockRefs.current[block.id] = el;
      }}
      onSelectCommand={(command, block) => {
        // スラッシュコマンドが選択された時の処理
        // 必要に応じてブロックタイプを変更するなどの処理を追加
        console.log("Selected command:", command, "for block:", block);
      }}
      setIsSlashMenuVisible={setIsSlashMenuVisible}
    />
  );
}
