"use client";

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useChat } from 'ai/react';
import { X, Save, Copy, Send, Edit, Check } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface CommentBuilderProps {
  initialComment: string;
  postContext: {
    title: string;
    content: string;
    subreddit: string;
  };
  onSave: (comment: string) => void;
  onClose: () => void;
}

export function CommentBuilder({ 
  initialComment = '', 
  postContext, 
  onSave, 
  onClose 
}: CommentBuilderProps) {
  const [currentReply, setCurrentReply] = useState(initialComment);
  const [isImproving, setIsImproving] = useState(false);
  const { toast } = useToast();
  
  // Immediately set initial reply when component mounts
  useEffect(() => {
    setCurrentReply(initialComment);
  }, []);

  // Handle saving and closing
  const handleSaveAndClose = async () => {
    try {
      await onSave(currentReply);
      onClose();
      toast({
        title: "Saved",
        description: "Your reply has been saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save reply",
        variant: "destructive",
      });
    }
  };

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'system',
        role: 'system',
        content: `You are a helpful assistant improving a Reddit comment. Current comment: ${currentReply}`
      },
      {
        id: 'context',
        role: 'system',
        content: `Context:
          Subreddit: ${postContext?.subreddit || ''}
          Post Title: ${postContext?.title || ''}
          Post Content: ${postContext?.content || ''}`
      }
    ],
    onFinish(message) {
      setCurrentReply(message.content);
      setIsImproving(false);
    },
    onError() {
      setIsImproving(false);
      toast({
        title: "Error",
        description: "Failed to improve reply",
        variant: "destructive",
      });
    }
  });

  // Custom submit handler to show loading state
  const handleImprove = async (e: React.FormEvent) => {
    setIsImproving(true);
    handleSubmit(e);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <Card className="relative w-full max-w-4xl h-[80vh] overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 shadow-xl mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <h3 className="text-xl font-semibold text-white">AI Comment Assistant</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSaveAndClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-4 h-[calc(80vh-64px)] overflow-hidden">
          {/* Current Reply Editor with loading state */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-slow rounded-lg" />
            <div className="relative bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium text-gray-200">Current Reply</h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveAndClose}
                    className="text-gray-300 hover:text-white text-base"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(currentReply);
                      toast({
                        title: "Copied",
                        description: "Reply copied to clipboard",
                      });
                    }}
                    className="text-gray-300 hover:text-white text-base"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="relative">
                {isImproving && (
                  <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-white text-sm animate-pulse">Improving reply...</div>
                  </div>
                )}
                <Textarea
                  value={currentReply}
                  onChange={(e) => setCurrentReply(e.target.value)}
                  className="min-h-[150px] w-full bg-transparent border-none text-gray-100 text-base leading-relaxed focus:ring-0 resize-none"
                  placeholder="Your reply will appear here..."
                />
              </div>
            </div>
          </div>

          {/* Improvement Options */}
          <div className="grid grid-cols-2 gap-3">
            {[
              'Make it more personal',
              'Make it more professional',
              'Make it shorter',
              'Make it longer',
              'Add more examples',
              'Make it more empathetic'
            ].map((prompt) => (
              <Button
                key={prompt}
                disabled={isImproving}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-base py-6 disabled:opacity-50"
                onClick={() => {
                  handleInputChange({ target: { value: `Please ${prompt.toLowerCase()} while keeping the main points: ${currentReply}` } } as any);
                  handleImprove(new Event('submit') as any);
                }}
              >
                {prompt}
              </Button>
            ))}
          </div>

          {/* Custom Input Area */}
          <form 
            onSubmit={handleImprove}
            className="flex gap-2 items-end bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-3 rounded-lg mt-auto"
          >
            <Textarea
              value={input}
              onChange={handleInputChange}
              disabled={isImproving}
              placeholder="Type custom instructions for improving the reply..."
              className="flex-1 bg-gray-800/50 border-gray-700 text-gray-100 resize-none text-base disabled:opacity-50"
              rows={2}
            />
            <Button 
              type="submit"
              disabled={isImproving}
              className="h-[58px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 disabled:opacity-50"
            >
              <Send className="h-5 w-5 mr-2" />
              <span className="text-base">{isImproving ? 'Improving...' : 'Improve'}</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
