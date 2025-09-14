import { ArrowDown } from "lucide-react";

const TransitionButton = ({ href, text }) => {
  return (
    <a
      href={href}
      className="flex gap-4 justify-center items-center
        rounded-sm px-7 py-1.5 bg-zinc-100/50 hover:bg-zinc-100 
        transition duration-300 ease"
    >
      <p className="text-sm text-gray-700">{text}</p>
      <ArrowDown className="size-5 text-primary" />
    </a>
  );
};

export default TransitionButton;
