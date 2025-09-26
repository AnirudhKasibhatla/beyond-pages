import { BookOpen } from "lucide-react";

const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <BookOpen className="h-8 w-8 text-slate-800" />
        <h1 className="text-3xl font-bold text-slate-800">Beyond Pages</h1>
      </div>
    </div>
  );
};

export default AuthHeader;