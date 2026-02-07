"use client"

import { useEffect, useRef, useState } from 'react';
import { TopBar } from "@/components/top-bar";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AIChatPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasError, setHasError] = useState(false);

  const handleIframeError = () => {
    setHasError(true);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 pb-20 sm:pb-0">
          {hasError ? (
            <div className="h-full flex items-center justify-center">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  Unable to load the chatbot. Please try again later.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src="https://aichatbot-flax-eta.vercel.app/"
              className="w-full h-full border-0"
              allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
              allowFullScreen
              onError={handleIframeError}
              title="AI Chatbot"
            />
          )}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}