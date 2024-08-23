import { Badge } from "./ui/badge";

const Header = () => {
  return (
    <header className="flex justify-center bg-background px-4 py-3 shadow-sm sm:px-6">
      <div className="flex items-center gap-4">
        <div className="rounded-full w-8 h-8 bg-[#55efc4] flex items-center justify-center text-2xl">
          🤖
        </div>
        <div className="flex gap-2">
          <span className="font-medium">הייטקיסטGPT</span>
          <Badge variant={"outline"}>beta</Badge>
        </div>
      </div>
    </header>
  );
};

export { Header };
