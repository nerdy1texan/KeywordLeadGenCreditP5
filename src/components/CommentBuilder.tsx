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
  const [editMode, setEditMode] = useState(false);
  const [currentReply, setCurrentReply] = useState(initialComment);
  const { toast } = useToast();
  
  const improvementPrompts = {
    'Make it more personal': 'Please make this reply more personal and relatable, adding a touch of individual experience while maintaining professionalism.',
    'Make it more professional': 'Please make this reply more professional and formal, focusing on clear, business-like communication.',
    'Make it shorter': 'Please make this reply more concise while keeping the key points.',
    'Make it longer': 'Please expand this reply with more details and explanations while maintaining engagement.',
    'Add more examples': 'Please add relevant examples to illustrate the points being made.',
    'Make it more empathetic': 'Please make this reply more empathetic and understanding, showing more emotional awareness.'
  };
  
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    initialMessages: [
      {
        id: 'system',
        role: 'system',
        content: `You are a helpful assistant helping to improve a Reddit comment. Be concise and authentic.`
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
  });

  const handlePromptClick = (promptText: string) => {
    const fullPrompt = improvementPrompts[promptText as keyof typeof improvementPrompts];
    handleInputChange({ target: { value: fullPrompt } } as any);
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[80vh] overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <h3 className="text-lg font-semibold text-white">AI Comment Assistant</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-4 h-[calc(80vh-64px)] overflow-hidden">
          {/* Current Reply Editor */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-300">Current Reply</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(currentReply)}
                  className="text-gray-300 hover:text-white"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className="text-gray-300 hover:text-white"
                >
                  {editMode ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {editMode ? (
              <Textarea
                value={currentReply}
                onChange={(e) => setCurrentReply(e.target.value)}
                className="min-h-[150px] bg-gray-800/50 border-gray-700 text-gray-100"
              />
            ) : (
              <p className="text-gray-100 whitespace-pre-wrap min-h-[150px]">{currentReply}</p>
            )}
          </div>

          {/* Suggestion Area */}
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Improvement Options in Grid */}
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(improvementPrompts).map((prompt) => (
                <Button
                  key={prompt}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                  size="sm"
                  onClick={() => handlePromptClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            {/* AI Suggestions */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-lg p-4">
              {messages.slice(2).map((m) => (
                <div 
                  key={m.id} 
                  className={`mb-4 ${m.role === 'user' ? 'text-right' : ''}`}
                >
                  <div className={`
                    inline-block max-w-[80%] p-4 rounded-lg
                    ${m.role === 'user' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100'}
                  `}>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    {m.role === 'assistant' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCurrentReply(m.content)}
                        className="mt-2 text-gray-300 hover:text-white"
                      >
                        Use This Suggestion
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSubmit} 
              className="flex gap-2 items-end bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-2 rounded-lg"
            >
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Type your instructions for improving the reply..."
                className="flex-1 bg-gray-800/50 border-gray-700 text-gray-100 resize-none"
                rows={2}
              />
              <Button 
                type="submit" 
                className="h-[58px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Improve
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
