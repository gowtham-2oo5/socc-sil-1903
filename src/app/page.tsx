import TypeformUI from "@/components/MainForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Page() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-center font-mono flex-1">
            SOCC - Leetcode Live Arrays edition Submissions
          </h1>
          <ThemeToggle />
        </div>
        <TypeformUI />
      </div>
    </div>
  );
}
