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

  // Handle save
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: currentReply }),
      });

      if (!response.ok) throw new Error('Failed to save reply');
      
      toast({
        title: "Saved",
        description: "Your reply has been saved successfully!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save reply",
        variant: "destructive",
      });
    }
  };

  // Handle copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentReply);
      toast({
        title: "Copied",
        description: "Reply copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy reply",
        variant: "destructive",
      });
    }
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
        5. Preserve engaging elements`
      }
    ],
    onFinish: (message) => {
      setCurrentReply(message.content);
      setIsImproving(false);
    },
  });

  // Improvement prompts
  const improvementPrompts = {
    'Make it more personal': 'Make the reply more personal and relatable while maintaining the product mention.',
    'Make it more professional': 'Make the reply more professional and authoritative while keeping the product recommendation credible.',
    'Make it shorter': 'Make the reply more concise while preserving both the helpful advice and product mention.',
    'Make it longer': 'Expand the reply with more details and examples, strengthening both the advice and product relevance.',
    'Add more examples': 'Add relevant examples that reinforce both the advice and the product\'s value proposition.',
    'Make it more empathetic': 'Enhance the empathy and understanding while maintaining the natural product recommendation.'
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => handleSave()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Comment Assistant</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-y-auto">
          {/* Current Reply Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current Reply</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isEditing ? (
              <Textarea
                value={currentReply}
                onChange={(e) => setCurrentReply(e.target.value)}
                className="min-h-[150px] w-full"
              />
            ) : (
              <div className="min-h-[150px] w-full bg-secondary/50 rounded-md p-4">
                {currentReply}
              </div>
            )}
          </div>

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
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type custom instructions for improving the reply..."
              className="flex-1"
            />
            <Button 
              type="submit"
              disabled={isImproving}
              className="self-end"
            >
              {isImproving ? 'Improving...' : 'Improve'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
