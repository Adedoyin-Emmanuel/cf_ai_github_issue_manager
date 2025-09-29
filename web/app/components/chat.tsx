"use client";

import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import { Response } from "@/components/ai-elements/response";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/query",
    });

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-2rem)]">
      <div className="flex-1 min-h-0">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="Welcome to Cloudflare AI Assistant"
                description="Ask me anything about your Cloudflare configuration or firewall rules."
                icon={<Bot className="h-8 w-8 text-muted-foreground" />}
              />
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 p-3 sm:p-4 rounded-lg",
                      message.role === "user"
                        ? "bg-blue-50 dark:bg-blue-950/20 ml-2 sm:ml-8"
                        : "bg-gray-50 dark:bg-gray-900/50 mr-2 sm:mr-8"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium mb-1">
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                        <Response>{message.content}</Response>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 mr-2 sm:mr-8">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium mb-1">
                        AI Assistant
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ConversationContent>
        </Conversation>
      </div>

      <div className="border-t bg-white dark:bg-gray-900 p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input || ""}
            onChange={handleInputChange}
            placeholder="Ask about your Cloudflare configuration..."
            className="flex-1 text-sm sm:text-base"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input?.trim()}
            size="sm"
            className="px-3 sm:px-4"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
