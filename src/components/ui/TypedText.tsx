import React, { useState, useEffect } from 'react';

interface TypedTextProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
}

export function TypedText({ 
  words, 
  className = '',
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenWords = 2000 
}: TypedTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPaused) {
      timer = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(false);
      }, delayBetweenWords);
      return () => clearTimeout(timer);
    }

    const currentWord = words[wordIndex];

    if (isTyping) {
      if (displayText === currentWord) {
        setIsPaused(true);
        return;
      }

      timer = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      }, typingSpeed);
    } else {
      if (displayText === '') {
        setWordIndex((prev) => (prev + 1) % words.length);
        setIsTyping(true);
        return;
      }

      timer = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, deletingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, wordIndex, isTyping, isPaused, words, typingSpeed, deletingSpeed, delayBetweenWords]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="inline-block">{displayText || '\u00A0'}</span>
      <span className="border-r-4 border-[#06b6d4] ml-1 animate-blink h-[1em] mb-1"></span>
    </span>
  );
}
