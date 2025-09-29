"use client";

import { useCredentials } from "@/hooks/use-credentials";
import CredentialsModal from "@/components/credentials-modal";
import Chat from "@/app/components/chat";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";

export default function Home() {
  const { isConfigured, clearCredentials } = useCredentials();

  const handleClearCredentials = () => {
    clearCredentials();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CredentialsModal />

      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Cloudflare AI Assistant
              </h1>
            </div>
            {isConfigured && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCredentials}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Reset Credentials</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {isConfigured ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-8rem)] sm:h-[calc(100vh-12rem)] flex flex-col">
            <Chat />
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="max-w-md mx-auto px-4">
              <Settings className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Cloudflare AI Assistant
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                Please configure your Cloudflare credentials to get started. The
                modal should appear automatically.
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                If the modal didn&apos;t appear, please refresh the page.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
