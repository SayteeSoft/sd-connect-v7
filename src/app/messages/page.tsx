
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ChatClient } from './chat-client';
import { getConversations, getProfile, type Conversation, type Profile, type ConversationWithParticipantId } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

const ChatSkeleton = () => (
  <div className="flex h-full w-full">
    {/* Left Pane Skeleton */}
    <aside className="w-full md:w-1/3 lg:w-1/4 h-full flex flex-col border-r">
      <div className="p-4 border-b">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-grow p-3 space-y-3 overflow-y-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-grow space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </aside>
    {/* Right Pane Skeleton */}
    <section className="hidden md:flex flex-col flex-grow h-full">
      <header className="flex items-center p-3 border-b shadow-sm">
        <Skeleton className="h-10 w-10 rounded-full mr-3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </header>
      <div className="flex-grow p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading chats...</p>
      </div>
      <footer className="p-3 border-t bg-background">
        <Skeleton className="h-10 w-full" />
      </footer>
    </section>
  </div>
);

// We wrap the logic that uses useSearchParams in a component
// as it must be inside a Suspense boundary.
function MessagesContent() {
    const searchParams = useSearchParams();
    const { user: currentUserProfile, isLoading: isAuthLoading } = useAuth();
    
    const [conversations, setConversations] = useState<Conversation[] | null>(null);

    const initialSelectedProfileId = searchParams.get('chatWith')
        ? parseInt(searchParams.get('chatWith') as string, 10)
        : undefined;

    const fetchAndJoinData = useCallback(async () => {
        if (!isAuthLoading && currentUserProfile) {
            
            // This now fetches conversations with profiles already joined on the backend.
            let joinedConversations: Conversation[] = await getConversations();

            // Filter out conversations with users of the same role
            joinedConversations = joinedConversations.filter(convo => 
                convo.participant.role !== currentUserProfile.role
            );
            
            // Sort by most recent message
            joinedConversations.sort((a, b) => {
                const lastMessageA = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp).getTime() : 0;
                const lastMessageB = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp).getTime() : 0;
                return lastMessageB - lastMessageA;
            });
            
            // If a chat is opened via URL and doesn't exist, create a placeholder
            if (initialSelectedProfileId && !joinedConversations.some(c => c.participant.id === initialSelectedProfileId)) {
                const participantProfile = await getProfile(initialSelectedProfileId);
                if (participantProfile) {
                    const newConversation: Conversation = {
                        id: initialSelectedProfileId * -1, // Use a negative, unique ID for placeholders
                        participant: participantProfile,
                        messages: [],
                        unreadCount: 0,
                    };
                    // Add the new placeholder conversation to the top of the list
                    joinedConversations = [newConversation, ...joinedConversations];
                }
            }
            
            setConversations(joinedConversations);
        }
    }, [isAuthLoading, currentUserProfile, initialSelectedProfileId]);
    
    useEffect(() => {
        fetchAndJoinData();

        // When a profile is updated anywhere, re-run the entire fetch and join process
        window.addEventListener('profileUpdated', fetchAndJoinData);
        return () => {
            window.removeEventListener('profileUpdated', fetchAndJoinData);
        };
    }, [fetchAndJoinData]);

    // Show skeleton while auth is loading or we haven't fetched conversations yet.
    if (isAuthLoading || conversations === null) {
      return <ChatSkeleton />;
    }
    
    if (!currentUserProfile) {
        return (
            <div className="flex flex-col flex-grow items-center justify-center h-full">
                <p className="text-muted-foreground">Please log in to view your messages.</p>
            </div>
        );
    }

    return (
        <ChatClient
            initialConversations={conversations}
            currentUser={currentUserProfile}
            initialSelectedProfileId={initialSelectedProfileId}
        />
    );
}

export default function MessagesPage() {
    return (
        <>
            <Header />
            <main className="flex-grow flex flex-col overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 py-6 flex-grow flex flex-col">
                    <div className="bg-background border rounded-lg overflow-hidden flex-grow flex">
                        <Suspense fallback={<ChatSkeleton />}>
                            <MessagesContent />
                        </Suspense>
                    </div>
                </div>
            </main>
        </>
    );
}
