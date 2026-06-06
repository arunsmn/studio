"use client";

interface UserMessageBubbleProps {
  text: string;
}

export default function UserMessageBubble({ text }: UserMessageBubbleProps) {
  return (
    <div className="self-end max-w-[75%]">
      <div className="bg-violet-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm whitespace-pre-wrap break-words">
        {text}
      </div>
    </div>
  );
}
