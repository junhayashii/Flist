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

  if (editingBlockId !== block.id) {
    switch (block.type) {
      case "heading1":
        return (
          <HeadingBlock block={block} level={1} onClick={handleBlockClick} />
        );
      case "heading2":
        return (
          <HeadingBlock block={block} level={2} onClick={handleBlockClick} />
        );
      case "heading3":
        return (
          <HeadingBlock block={block} level={3} onClick={handleBlockClick} />
        );
      case "bullet":
        return (
          <ListItemBlock
            block={block}
            type="bullet"
            onClick={handleBlockClick}
          />
        );
      case "numbered":
        return (
          <ListItemBlock
            block={block}
            type="numbered"
            onClick={handleBlockClick}
          />
        );
      case "quote":
        return <QuoteBlock block={block} onClick={handleBlockClick} />;
      case "divider":
        return <DividerBlock block={block} onClick={handleBlockClick} />;
      case "note":
        return (
          <NoteBlock
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
    />
  );
}
