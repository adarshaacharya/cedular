import { Loader } from "./loader";

export const ThinkingMessage = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <Loader size={16} />
      <span>Thinking...</span>
    </div>
  );
};
