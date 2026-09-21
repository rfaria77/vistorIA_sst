import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Check,
  RotateCcw,
  Circle,
  MoveUpRight,
  Square,
  Sparkles,
  Info,
} from "lucide-react";

interface PhotoAnnotatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  onSaveAnnotatedImage: (newImageDataUrl: string) => void;
}

type AnnotationTool = "circle" | "arrow" | "rect";
type ToolColor = "#ef4444" | "#f59e0b" | "#0ea5e9" | "#10b981";

interface Shape {
  type: AnnotationTool;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: ToolColor;
  strokeWidth: number;
}

export const PhotoAnnotatorModal: React.FC<PhotoAnnotatorModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  onSaveAnnotatedImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>("circle");
  const [selectedColor, setSelectedColor] = useState<ToolColor>("#ef4444");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isOpen || !imageDataUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageDataUrl;
    img.onload = () => {
      imageObjRef.current = img;
      setShapes([]);
      setCurrentShape(null);
      redraw();
    };
  }, [isOpen, imageDataUrl]);

  useEffect(() => {
    redraw();
  }, [shapes, currentShape]);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObjRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageObjRef.current;
    // Set internal canvas resolution to original image resolution for maximum quality
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    // Draw background image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw saved shapes
    const allShapes = currentShape ? [...shapes, currentShape] : shapes;
    allShapes.forEach((s) => drawShape(ctx, s));
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save();
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Shadow for high contrast on any photo background
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    if (shape.type === "circle") {
      const radiusX = Math.abs(shape.endX - shape.startX) / 2;
      const radiusY = Math.abs(shape.endY - shape.startY) / 2;
      const centerX = Math.min(shape.startX, shape.endX) + radiusX;
      const centerY = Math.min(shape.startY, shape.endY) + radiusY;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX || 5, radiusY || 5, 0, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (shape.type === "rect") {
      const x = Math.min(shape.startX, shape.endX);
      const y = Math.min(shape.startY, shape.endY);
      const w = Math.abs(shape.endX - shape.startX);
      const h = Math.abs(shape.endY - shape.startY);

      ctx.beginPath();
      ctx.strokeRect(x, y, w, h);
    } else if (shape.type === "arrow") {
      // Draw line with arrowhead
      const fromX = shape.startX;
      const fromY = shape.startY;
      const toX = shape.endX;
      const toY = shape.endY;
      const headlen = Math.max(16, shape.strokeWidth * 3);
      const angle = Math.atan2(toY - fromY, toX - fromX);

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }

    ctx.restore();
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    // Scale stroke width based on image size
    const baseStroke = canvas ? Math.max(4, Math.round(canvas.width / 180)) : 6;

    setIsDrawing(true);
    setCurrentShape({
      type: selectedTool,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      color: selectedColor,
      strokeWidth: baseStroke,
    });
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentShape) return;
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    setCurrentShape({
      ...currentShape,
      endX: x,
      endY: y,
    });
  };

  const handleEnd = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentShape) return;
    e.preventDefault();
    setIsDrawing(false);
    // Only keep shape if there is meaningful size
    const dist = Math.hypot(currentShape.endX - currentShape.startX, currentShape.endY - currentShape.startY);
    if (dist > 10) {
      setShapes((prev) => [...prev, currentShape]);
    }
    setCurrentShape(null);
  };

  const handleUndo = () => {
    setShapes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setShapes([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const annotatedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    onSaveAnnotatedImage(annotatedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl flex flex-col max-h-[95vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm sm:text-base">Destaque Visual da Irregularidade</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-2 sm:p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Tool selectors */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedTool("circle")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                selectedTool === "circle"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Círculo de Alerta"
            >
              <Circle className="w-3.5 h-3.5" />
              <span>Círculo</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTool("arrow")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                selectedTool === "arrow"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Seta Indicativa"
            >
              <MoveUpRight className="w-3.5 h-3.5" />
              <span>Seta</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTool("rect")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                selectedTool === "rect"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Retângulo de Destaque"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Retângulo</span>
            </button>
          </div>

          {/* Color Palettes */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(["#ef4444", "#f59e0b", "#0ea5e9", "#10b981"] as ToolColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  selectedColor === c ? "scale-110 border-white ring-2 ring-sky-400" : "border-transparent opacity-80"
                }`}
              />
            ))}
          </div>

          {/* Undo / Clear actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={shapes.length === 0}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-medium flex items-center gap-1"
              title="Desfazer última marcação"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desfazer</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={shapes.length === 0}
              className="px-2 py-1.5 text-slate-400 hover:text-rose-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-medium"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-slate-950">
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="max-w-full max-h-[60vh] object-contain cursor-crosshair rounded-lg border border-slate-800 shadow-lg touch-none"
          />
        </div>

        {/* Footer info and save */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden xs:inline">Arraste o dedo ou mouse sobre a área com irregularidade.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Marcação à Evidência</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
