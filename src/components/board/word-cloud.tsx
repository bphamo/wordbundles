"use client";

import React from "react";

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) + hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface WordCloudProps {
  keywords: Array<{ normalized: string; count: number }>;
}

interface PlacedWord {
  text: string;
  count: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
}

export function WordCloud({ keywords }: WordCloudProps) {
  const [isClient, setIsClient] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const placedWords = React.useMemo(() => {
    if (!isClient) return { words: [], bounds: { width: 480, height: 240 } };

    // Sort by frequency (highest first)
    const sorted = [...keywords].sort((a, b) => b.count - a.count);
    const max = Math.max(...keywords.map((k) => k.count)) || 1;

    const placed: PlacedWord[] = [];

    // Start with larger container size that will grow as needed
    let containerWidth = 480; // Increased from 400 to 480 (20% larger)
    let containerHeight = 240; // Increased from 200 to 240 (20% larger)
    let centerX = containerWidth / 2;
    let centerY = containerHeight / 2;

    // Create canvas for text measurement
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return { words: [], bounds: { width: 480, height: 240 } };

    const colors = [
      "#3b82f6", // blue
      "#ef4444", // red
      "#10b981", // green
      "#8b5cf6", // purple
      "#f59e0b", // orange
      "#06b6d4", // cyan
    ];

    // Collision detection function
    const hasCollision = (newWord: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => {
      const padding = 5; // Increased from 4 to 5 (20% larger)
      return placed.some((existing) => {
        const existingBox = {
          x1: existing.x - existing.width / 2,
          y1: existing.y - existing.height / 2,
          x2: existing.x + existing.width / 2,
          y2: existing.y + existing.height / 2,
        };

        const newBox = {
          x1: newWord.x - newWord.width / 2,
          y1: newWord.y - newWord.height / 2,
          x2: newWord.x + newWord.width / 2,
          y2: newWord.y + newWord.height / 2,
        };

        return !(
          newBox.x2 + padding < existingBox.x1 ||
          newBox.x1 > existingBox.x2 + padding ||
          newBox.y2 + padding < existingBox.y1 ||
          newBox.y1 > existingBox.y2 + padding
        );
      });
    };

    // Archimedean spiral placement with dynamic container expansion
    const findPosition = (width: number, height: number, index: number) => {
      if (index === 0) {
        return { x: centerX, y: centerY };
      }

      const maxAttempts = 5000;
      const spiralTightness = 2.4; // Increased from 2 to 2.4 (20% larger)
      let angle = 0;
      let radius = 12; // Increased from 10 to 12 (20% larger)

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Archimedean spiral: r = a * θ
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Check if we need to expand the container
        const minX = x - width / 2;
        const maxX = x + width / 2;
        const minY = y - height / 2;
        const maxY = y + height / 2;

        // Expand container if needed
        if (minX < 0) {
          const expansion = Math.abs(minX) + 30; // Increased from 25 to 30 (20% larger)
          containerWidth += expansion;
          centerX += expansion / 2;
        }
        if (maxX > containerWidth) {
          containerWidth = maxX + 30; // Increased from 25 to 30 (20% larger)
        }
        if (minY < 0) {
          const expansion = Math.abs(minY) + 30; // Increased from 25 to 30 (20% larger)
          containerHeight += expansion;
          centerY += expansion / 2;
        }
        if (maxY > containerHeight) {
          containerHeight = maxY + 30; // Increased from 25 to 30 (20% larger)
        }

        const testWord = { x, y, width, height };

        if (!hasCollision(testWord)) {
          return { x, y };
        }

        // Move along spiral - smaller increments for tighter packing
        angle += 0.05;
        radius = spiralTightness * angle;

        // Allow much larger spirals since container can grow
        if (radius > 480) {
          // Increased from 400 to 480 (20% larger)
          break;
        }
      }

      // Fallback position - place to the right of last word
      const lastWord = placed[placed.length - 1];
      if (lastWord) {
        return {
          x: lastWord.x + lastWord.width + width / 2 + 12, // Increased from 10 to 12 (20% larger)
          y: lastWord.y,
        };
      }
      return { x: centerX, y: centerY };
    };

    // Place each word
    sorted.forEach((keyword, index) => {
      // Calculate font size based on frequency - increased by 20%
      const ratio = keyword.count / max;
      const fontSize = Math.max(8.4, Math.min(38.4, 8.4 + ratio * 30)); // All values increased by 20%

      // Measure text dimensions
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      const metrics = ctx.measureText(keyword.normalized);
      const width = Math.ceil(metrics.width) + 4.8; // Increased from 4 to 4.8 (20% larger)
      const height = Math.ceil(fontSize * 1.3);

      // Find position using Archimedean spiral
      const position = findPosition(width, height, index);

      // Use hash-based color assignment for consistency
      const wordHash = hashString(keyword.normalized);

      placed.push({
        text: keyword.normalized,
        count: keyword.count,
        x: position.x,
        y: position.y,
        width,
        height,
        fontSize,
        color: colors[wordHash % colors.length],
      });
    });

    return {
      words: placed,
      bounds: { width: containerWidth, height: containerHeight },
    };
  }, [keywords, isClient]);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96 w-full bg-background rounded-lg border">
        <div className="text-muted-foreground">Loading word cloud...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background rounded-lg border overflow-auto p-4 flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative bg-background"
        style={{
          width: `${placedWords.bounds.width}px`,
          height: `${placedWords.bounds.height}px`,
        }}
      >
        {placedWords.words.map((word, index) => {
          const weight = word.count / Math.max(...keywords.map((k) => k.count));
          const fontWeight =
            weight > 0.66
              ? "font-extrabold"
              : weight > 0.33
              ? "font-bold"
              : "font-medium";

          return (
            <span
              key={`${word.text}-${index}`}
              className={`absolute select-none cursor-default transition-all duration-300 hover:scale-110 ${fontWeight}`}
              style={{
                left: `${word.x}px`,
                top: `${word.y}px`,
                fontSize: `${word.fontSize}px`,
                color: word.color,
                transform: "translate(-50%, -50%)",
                transformOrigin: "center",
                whiteSpace: "nowrap",
                zIndex: 1000 - index,
              }}
              title={`${word.text} (${word.count})`}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
