import React from "react";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  return (
    <div className={`${className} w-full py-3`}>
      <div className="mx-auto flex items-center justify-between p-3">
        <Link href={"/"}>
          <h1 className="font-extrabold text-2xl">GitHub Issue Analyzer</h1>
        </Link>
        <div className="flex gap-x-5">
          <Link
            href={
              "https://github.com/Adedoyin-Emmanuel/cf_ai_github_issue_manager"
            }
          >
            <Github className="w-5 h-5 cursor-pointer" strokeWidth={1.5} />
          </Link>
          <Link href={"https://x.com/Emmysoft_Tm"}>
            <Twitter className="w-5 h-5 cursor-pointer" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  );
};
