"use client";

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useChat } from 'ai/react';

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
  const [comment, setComment] = useState(initialComment);
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: `You are a helpful assistant helping to improve a Reddit comment. Context:
          Subreddit: ${postContext?.subreddit || ''}
          Post Title: ${postContext?.title || ''}
          Post Content: ${postContext?.content || ''}
          Current Comment: ${initialComment}`
      }
    ],
  });

  const handleSave = () => {
    onSave(comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl p-6 space-y-4 bg-gray-900 border-gray-800">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-100">Comment Builder</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="grid grid-cols-2 gap-4 h-[500px]">
          <div className="space-y-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-[400px] bg-gray-800 border-gray-700 text-gray-100"
              placeholder="Your comment..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSave}>
                Save Changes
              </Button>
              <Button onClick={() => navigator.clipboard.writeText(comment)}>
                Copy to Clipboard
              </Button>
            </div>
          </div>

          <div className="border-l border-gray-700 pl-4 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask for suggestions..."
                className="h-[100px] bg-gray-800 border-gray-700 text-gray-100"
              />
              <Button type="submit">Get Suggestions</Button>
            </form>

            <div className="h-[300px] overflow-y-auto space-y-4">
              {messages.map(m => (
                <div key={m.id} className="text-sm bg-gray-800 p-3 rounded-lg">
                  <p className="font-semibold text-gray-300">
                    {m.role === 'assistant' ? 'AI Suggestion:' : 'You:'}
                  </p>
                  <p className="mt-1 text-gray-100">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
