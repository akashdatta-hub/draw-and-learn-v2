import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Check } from 'lucide-react';

interface DrawCanvasProps {
  onComplete: (dataUrl: string) => void;
  traceImage?: string;
}

export function DrawCanvas({ onComplete, traceImage }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load trace image if provided
    if (traceImage) {
      const img = new Image();
      img.onload = () => {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
      };
      img.src = traceImage;
    }
  }, [traceImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onComplete(dataUrl);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <canvas
        ref={canvasRef}
        className="border-4 border-primary-300 rounded-lg bg-white cursor-crosshair touch-none"
        style={{ width: '100%', height: '400px' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setColor('#000000')}
            className={`w-8 h-8 rounded-full bg-black border-2 ${
              color === '#000000' ? 'border-primary-500' : 'border-gray-300'
            }`}
          />
          <button
            onClick={() => setColor('#ff0000')}
            className={`w-8 h-8 rounded-full bg-red-500 border-2 ${
              color === '#ff0000' ? 'border-primary-500' : 'border-gray-300'
            }`}
          />
          <button
            onClick={() => setColor('#0000ff')}
            className={`w-8 h-8 rounded-full bg-blue-500 border-2 ${
              color === '#0000ff' ? 'border-primary-500' : 'border-gray-300'
            }`}
          />
          <button
            onClick={() => setColor('#00ff00')}
            className={`w-8 h-8 rounded-full bg-green-500 border-2 ${
              color === '#00ff00' ? 'border-primary-500' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearCanvas}
            className="btn-secondary flex items-center gap-2 py-2 px-4"
          >
            <Trash2 size={18} />
            Clear
          </button>
          <button
            onClick={handleComplete}
            className="btn-primary flex items-center gap-2 py-2 px-4"
          >
            <Check size={18} />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
