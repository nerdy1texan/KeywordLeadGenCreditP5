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
  const { toast } = useToast();
  
  // Set initial reply when it's available
  useEffect(() => {
    if (initialComment) {
      setCurrentReply(initialComment);
    }
  }, [initialComment]);

  // Handle closing with save
  const handleClose = () => {
    onSave(currentReply);
    onClose();
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
      // Update current reply with the latest AI response
      setCurrentReply(message.content);
    },
  });

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[80vh] overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <h3 className="text-xl font-semibold text-white">AI Comment Assistant</h3>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-4 h-[calc(80vh-64px)] overflow-hidden">
          {/* Current Reply Editor with rotating gradient */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-slow rounded-lg" />
            <div className="relative bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium text-gray-200">Current Reply</h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSave(currentReply);
                      toast({
                        title: "Saved",
                        description: "Your reply has been saved successfully!",
                      });
                    }}
                    className="text-gray-300 hover:text-white text-base"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(currentReply)}
                    className="text-gray-300 hover:text-white text-base"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              <Textarea
                value={currentReply}
                onChange={(e) => setCurrentReply(e.target.value)}
                className="min-h-[150px] w-full bg-transparent border-none text-gray-100 text-base leading-relaxed focus:ring-0 resize-none"
                placeholder="Your reply will appear here..."
              />
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
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-base py-6"
                onClick={() => {
                  handleInputChange({ target: { value: `Please ${prompt.toLowerCase()} while keeping the main points: ${currentReply}` } } as any);
                  handleSubmit(new Event('submit') as any);
                }}
              >
                {prompt}
              </Button>
            ))}
          </div>

          {/* Custom Input Area */}
          <form 
            onSubmit={handleSubmit} 
            className="flex gap-2 items-end bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-3 rounded-lg mt-auto"
          >
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type custom instructions for improving the reply..."
              className="flex-1 bg-gray-800/50 border-gray-700 text-gray-100 resize-none text-base"
              rows={2}
            />
            <Button 
              type="submit" 
              className="h-[58px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6"
            >
              <Send className="h-5 w-5 mr-2" />
              <span className="text-base">Improve</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
