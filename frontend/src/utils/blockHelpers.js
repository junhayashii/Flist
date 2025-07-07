export const toggleBlockDone = (block) => {
  const isDone = block.type === "task-done";
  return {
    ...block,
    type: isDone ? "task" : "task-done",
    html:
      (isDone ? "- [ ] " : "- [x] ") + block.html.replace(/^- \[[ x]\] /, ""),
  };
};
