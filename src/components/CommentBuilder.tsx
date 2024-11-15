"use client";

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useChat } from 'ai/react';
import { X, Save, Copy, Send, Edit, Check } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface CommentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  post: RedditPost & { product: Product };
}

export function CommentBuilder({ isOpen, onClose, post }: CommentBuilderProps) {
  const [currentReply, setCurrentReply] = useState(post.latestReply || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const { toast } = useToast();

  const saveReply = async (replyText: string) => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: replyText }),
      });

      if (!response.ok) throw new Error('Failed to save reply');

      toast({
        title: "Success",
        description: "Reply saved successfully",
      });

      return true;
    } catch (error) {
      console.error('Error saving reply:', error);
      toast({
        title: "Error",
        description: "Failed to save reply",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleClose = async () => {
    const saved = await saveReply(currentReply);
    if (saved) {
      onClose();
    }
  };

  const handleSave = async () => {
    const saved = await saveReply(currentReply);
    if (saved) {
      setIsEditing(false);
    }
  };

  // Add dialog close handler
  const handleDialogClose = async (open: boolean) => {
    if (!open) {
      await handleClose();
    }
  };

  // Add this function before the useChat setup
  const handleImprove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsImproving(true);
    await handleSubmit(e);
  };

  // Chat completion setup for improvements
  const { messages, handleSubmit, input, handleInputChange } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'system',
        role: 'system',
        content: `You are an expert at improving Reddit replies while maintaining product promotion.
        
        Product Context:
        Name: ${post.product.name}
        Description: ${post.product.description}
        Keywords: ${post.product.keywords.join(', ')}
        URL: ${post.product.url}
        
        Post Context:
        Subreddit: ${post.subreddit}
        Title: ${post.title}
        Content: ${post.text}
        
        Current Reply: ${currentReply}
        
        Guidelines:
        1. Keep the product mention natural and relevant
        2. Maintain authenticity and helpfulness
        3. Ensure the reply adds value first
        4. Keep the product promotion subtle
        5. Include the product URL exactly once near the end of the reply
        6. Do not repeat or duplicate the URL
        7. Preserve engaging elements`
      }
    ],
    onFinish: async (message) => {
      setCurrentReply(message.content);
      setIsImproving(false);
      await saveReply(message.content);
    },
  });

  // Improvement prompts
  const improvementPrompts = {
    'Make it more personal': 'Make the reply more personal and relatable while maintaining the product mention.',
    'Make it more professional': 'Make the reply more professional and authoritative while keeping the product recommendation credible.',
    'Make it shorter': 'Make the reply more concise while preserving both the helpful advice and product mention.',
    'Make it longer': 'Expand the reply with more details and examples, strengthening both the advice and product relevance.',
    'Add more examples': 'Add relevant examples that reinforce both the advice and product value.',
    'Make it more empathetic': 'Enhance the empathy and understanding while maintaining the natural product recommendation.'
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[800px] bg-gray-950/80 backdrop-blur-sm border border-gray-800/50">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold text-white">
              AI Comment Assistant
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="p-6 flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg" />
            <div className="relative bg-gray-900 p-4 rounded-lg border border-gray-800/50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-gray-400">Current Reply</h4>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(currentReply);
                          toast({
                            title: "Copied",
                            description: "Reply copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <Textarea
                  value={currentReply}
                  onChange={(e) => setCurrentReply(e.target.value)}
                  className="min-h-[150px] w-full bg-gray-900 whitespace-pre-wrap"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              ) : (
                <div className="min-h-[150px] w-full bg-gray-900 rounded-md p-4 whitespace-pre-wrap">
                  {currentReply}
                </div>
              )}
            </div>
          </div>

          {/* Only show improvement options when not editing */}
          {!isEditing && (
            <>
              {/* Improvement Options */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(improvementPrompts).map(([label, prompt]) => (
                  <Button
                    key={label}
                    variant="outline"
                    disabled={isImproving}
                    onClick={() => handleInputChange({ target: { value: prompt } } as any)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Custom Improvement Input */}
              <form onSubmit={handleImprove} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type custom instructions for improving the reply..."
                  className="flex-1"
                  disabled={isImproving}
                />
                <Button 
                  type="submit"
                  disabled={isImproving}
                  className="self-end"
                >
                  {isImproving ? 'Improving...' : 'Improve'}
                </Button>
              </form>
            </>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Reply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
