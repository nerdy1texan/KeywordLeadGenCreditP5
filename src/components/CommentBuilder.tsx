"use client";

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useChat } from 'ai/react';
import { X, Save, Copy, Send, Edit, Check } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { RedditPost, Product } from '@/types/product';

interface CommentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  post: RedditPost & { 
    product: Pick<Product, 'name' | 'description' | 'keywords' | 'url'>;
  };
  onReplyUpdate?: (updatedPost: RedditPost & { 
    product: Pick<Product, 'name' | 'description' | 'keywords' | 'url'>;
  }) => void;
}

export function CommentBuilder({ isOpen, onClose, post, onReplyUpdate }: CommentBuilderProps) {
  const [currentReply, setCurrentReply] = useState(post.latestReply || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (post.latestReply) {
      setCurrentReply(post.latestReply);
    }
  }, [post.latestReply]);

  const productData = {
    name: post?.product?.name || 'Product',
    description: post?.product?.description || '',
    keywords: post?.product?.keywords || [],
    url: post?.product?.url || ''
  };

  const saveReply = async (reply: string) => {
    try {
      const response = await fetch(`/api/posts/${post.id}/reply`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latestReply: reply }),
      });

      if (!response.ok) throw new Error('Failed to save reply');

      const updatedPost = await response.json();
      
      if (onReplyUpdate) {
        onReplyUpdate({
          ...updatedPost,
          product: post.product
        });
      }
      
      return updatedPost;
    } catch (error) {
      console.error('Error saving reply:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setIsImproving(false);
    onClose();
  };

  const handleSaveAndClose = async () => {
    if (!currentReply.trim()) {
      toast("Reply cannot be empty", "error");
      return;
    }

    try {
      setIsSaving(true);
      await saveReply(currentReply);
      toast("Reply saved successfully", "success");
      onClose();
    } catch (error) {
      console.error('Error saving reply:', error);
      toast("Failed to save reply", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const { messages, handleSubmit, input, handleInputChange } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'system',
        role: 'system',
        content: `You are an expert at improving Reddit replies while maintaining subtle product promotion.
        
        Product Context:
        Name: ${productData.name}
        Description: ${productData.description}
        Keywords: ${productData.keywords.join(', ')}
        URL: ${productData.url}
        
        Post Context:
        Subreddit: ${post?.subreddit || ''}
        Title: ${post?.title || ''}
        Content: ${post?.text || ''}
        
        Current Reply: ${currentReply}
        
        Guidelines:
        1. Keep the product mention natural and relevant
        2. Maintain authenticity and helpfulness
        3. Ensure the reply adds value first
        4. Keep the product promotion subtle
        5. Include the product URL ONLY ONCE using round parentheses
        6. NEVER repeat URLs or product mentions
        7. Format URLs as: "Check it out (URL)" or similar
        8. Remove any duplicate URLs from the response
        9. Make the reply feel naturally hand-typed:
           - Add occasional typos (but not too many)
           - Use casual language and contractions
           - Include filler words like "tbh", "imo", "..."
           - Vary sentence structure
           - Add personal touches or anecdotes
        10. If multiple URLs exist, keep only the last one`
      }
    ],
    onFinish: async (message) => {
      try {
        const cleanedContent = message.content.replace(/(?:https?:\/\/[^\s]+)(?:.*)(https?:\/\/[^\s]+)/g, '$1');
        const updatedPost = await saveReply(cleanedContent);
        if (updatedPost) {
          setCurrentReply(updatedPost.latestReply);
          if (onReplyUpdate) {
            onReplyUpdate({
              ...updatedPost,
              product: post.product
            });
          }
        }
      } finally {
        setIsImproving(false);
      }
    },
  });

  const improvementPrompts = {
    'Make it more personal': 'Make the reply more personal and relatable while maintaining the product mention.',
    'Make it more professional': 'Make the reply more professional and authoritative while keeping the product recommendation credible.',
    'Make it shorter': 'Make the reply more concise while preserving both the helpful advice and product mention.',
    'Make it longer': 'Expand the reply with more details and examples, strengthening both the advice and product relevance.',
    'Add more examples': 'Add relevant examples that reinforce both the advice and product value.',
    'Make it more empathetic': 'Enhance the empathy and understanding while maintaining the natural product recommendation.'
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentReply);
      toast("Reply copied to clipboard", "success");
    } catch (error) {
      toast("Failed to copy to clipboard", "error");
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl transform-gpu overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              AI Reply Assistant
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-y-auto">
          <div className="relative">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Reply</h4>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        className="border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await saveReply(currentReply);
                        setIsEditing(false);
                      }}
                      className="border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                  className="min-h-[300px] w-full bg-gray-100 dark:bg-gray-800 resize-y"
                />
              ) : (
                <div className="min-h-[150px] w-full bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                  {currentReply}
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {Object.entries(improvementPrompts).map(([label, prompt]) => (
                  <Button
                    key={label}
                    variant="outline"
                    disabled={isImproving}
                    onClick={() => handleInputChange({ target: { value: prompt } } as any)}
                    className="border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type custom instructions for improving the reply..."
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-h-[80px]"
                  disabled={isImproving}
                />
                <Button 
                  type="submit"
                  disabled={isImproving}
                  className="bg-[#5244e1] hover:bg-opacity-90 text-white sm:w-24"
                >
                  {isImproving ? 'Improving...' : 'Improve'}
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isImproving || isSaving}
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAndClose}
            disabled={isImproving || isSaving}
            className="bg-[#5244e1] hover:bg-opacity-90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save & Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
