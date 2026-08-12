import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text, Image as KonvaImage } from 'react-konva';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';

const KonvaImageShape = ({ shape, onClick, onDragEnd, readOnly }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!shape.src) return;
    const img = new window.Image();
    img.src = shape.src;
    img.onload = () => setImage(img);
  }, [shape.src]);

  if (!image) return null;

  return (
    <KonvaImage
      x={shape.x}
      y={shape.y}
      width={shape.width || 180}
      height={shape.height || 75}
      image={image}
      onClick={onClick}
      tap={onClick}
      draggable={!readOnly}
      onDragEnd={(e) => {
        if (onDragEnd) {
          onDragEnd(shape.id, e.target.x(), e.target.y());
        }
      }}
    />
  );
};

export const AnnotationCanvas = ({
  docId,
  pageNum,
  width = 800,
  height = 1100,
  scale = 1,
  readOnly = false,
  existingAnnotations = null
}) => {
  const {
    annotationTool,
    strokeColor,
    strokeWidth,
    annotationsMap,
    updatePageAnnotations
  } = useCorrespondenceStore();

  const stageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [textInputPos, setTextInputPos] = useState(null);
  const [textValue, setTextValue] = useState('');

  // Get current shapes for this page
  const pageShapes = existingAnnotations || annotationsMap[docId]?.[pageNum] || [];

  // Handle Mouse Down / Touch Start
  const handleMouseDown = (e) => {
    if (readOnly) return;

    // Ignore drawing if clicking directly on an existing shape
    const clickedOnEmpty = e.target === e.target.getStage();
    if (!clickedOnEmpty && annotationTool !== 'pen' && annotationTool !== 'highlighter') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    // Normalizing coordinates by scale
    const x = point.x / scale;
    const y = point.y / scale;

    if (annotationTool === 'pen' || annotationTool === 'highlighter') {
      setIsDrawing(true);
      setCurrentShape({
        id: `shape_${Date.now()}`,
        type: annotationTool,
        points: [x, y],
        stroke: strokeColor,
        strokeWidth: annotationTool === 'highlighter' ? strokeWidth * 3.5 : strokeWidth,
        opacity: annotationTool === 'highlighter' ? 0.35 : 1
      });
    } else if (['rectangle', 'circle', 'arrow'].includes(annotationTool)) {
      setIsDrawing(true);
      setCurrentShape({
        id: `shape_${Date.now()}`,
        type: annotationTool,
        startX: x,
        startY: y,
        x: x,
        y: y,
        width: 0,
        height: 0,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        points: [x, y, x, y],
        opacity: 1
      });
    } else if (annotationTool === 'text') {
      setTextInputPos({ x, y });
      setTextValue('');
    }
  };

  // Handle Mouse Move / Touch Move
  const handleMouseMove = (e) => {
    if (!isDrawing || !currentShape || readOnly) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    const x = point.x / scale;
    const y = point.y / scale;

    if (currentShape.type === 'pen' || currentShape.type === 'highlighter') {
      setCurrentShape((prev) => ({
        ...prev,
        points: [...prev.points, x, y]
      }));
    } else if (currentShape.type === 'rectangle') {
      setCurrentShape((prev) => ({
        ...prev,
        width: x - prev.startX,
        height: y - prev.startY
      }));
    } else if (currentShape.type === 'circle') {
      const radius = Math.sqrt(
        Math.pow(x - prev.startX, 2) + Math.pow(y - prev.startY, 2)
      );
      setCurrentShape((prev) => ({
        ...prev,
        radius
      }));
    } else if (currentShape.type === 'arrow') {
      setCurrentShape((prev) => ({
        ...prev,
        points: [prev.startX, prev.startY, x, y]
      }));
    }
  };

  // Handle Mouse Up / Touch End
  const handleMouseUp = () => {
    if (!isDrawing || !currentShape || readOnly) return;
    setIsDrawing(false);

    // Commit shape to page annotations
    const newShapes = [...pageShapes, currentShape];
    updatePageAnnotations(docId, pageNum, newShapes);
    setCurrentShape(null);
  };

  // Handle shape removal with Eraser
  const handleShapeClick = (shapeId) => {
    if (readOnly || annotationTool !== 'eraser') return;
    const newShapes = pageShapes.filter((s) => s.id !== shapeId);
    updatePageAnnotations(docId, pageNum, newShapes);
  };

  // Handle position update when dragging stamp/signature
  const handleDragEnd = (shapeId, newX, newY) => {
    const newShapes = pageShapes.map((s) => (s.id === shapeId ? { ...s, x: newX, y: newY } : s));
    updatePageAnnotations(docId, pageNum, newShapes);
  };

  // Submit Text Insertion
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textValue.trim() || !textInputPos || readOnly) {
      setTextInputPos(null);
      return;
    }

    const newTextShape = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: textInputPos.x,
      y: textInputPos.y,
      text: textValue,
      fill: strokeColor,
      fontSize: Math.max(16, strokeWidth * 4)
    };

    const newShapes = [...pageShapes, newTextShape];
    updatePageAnnotations(docId, pageNum, newShapes);
    setTextInputPos(null);
    setTextValue('');
  };

  return (
    <div className="relative overflow-hidden" style={{ width: width * scale, height: height * scale }}>
      {/* Konva Stage Layer */}
      <Stage
        ref={stageRef}
        width={width * scale}
        height={height * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className={readOnly ? 'cursor-default' : annotationTool === 'eraser' ? 'cursor-alias' : 'cursor-crosshair'}
      >
        <Layer>
          {/* Saved Annotations */}
          {pageShapes.map((shape) => {
            if (shape.type === 'pen' || shape.type === 'highlighter') {
              return (
                <Line
                  key={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  opacity={shape.opacity || 1}
                  onClick={() => handleShapeClick(shape.id)}
                  tap={() => handleShapeClick(shape.id)}
                />
              );
            } else if (shape.type === 'rectangle') {
              return (
                <Rect
                  key={shape.id}
                  x={shape.startX}
                  y={shape.startY}
                  width={shape.width}
                  height={shape.height}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  onClick={() => handleShapeClick(shape.id)}
                  tap={() => handleShapeClick(shape.id)}
                />
              );
            } else if (shape.type === 'circle') {
              return (
                <Circle
                  key={shape.id}
                  x={shape.startX}
                  y={shape.startY}
                  radius={shape.radius || 10}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  onClick={() => handleShapeClick(shape.id)}
                  tap={() => handleShapeClick(shape.id)}
                />
              );
            } else if (shape.type === 'arrow') {
              return (
                <Arrow
                  key={shape.id}
                  points={shape.points}
                  pointerLength={12}
                  pointerWidth={12}
                  fill={shape.stroke}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  onClick={() => handleShapeClick(shape.id)}
                  tap={() => handleShapeClick(shape.id)}
                />
              );
            } else if (shape.type === 'text') {
              return (
                <Text
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  text={shape.text}
                  fontSize={shape.fontSize || 18}
                  fontFamily="Cairo, sans-serif"
                  fill={shape.fill || '#1B4B8A'}
                  fontStyle="bold"
                  onClick={() => handleShapeClick(shape.id)}
                  tap={() => handleShapeClick(shape.id)}
                />
              );
            } else if (shape.type === 'signature' || shape.type === 'stamp') {
              return (
                <KonvaImageShape
                  key={shape.id}
                  shape={shape}
                  onClick={() => handleShapeClick(shape.id)}
                  onDragEnd={handleDragEnd}
                  readOnly={readOnly}
                />
              );
            }
            return null;
          })}

          {/* Current Live Shape during Mouse Drag */}
          {currentShape && (
            <>
              {(currentShape.type === 'pen' || currentShape.type === 'highlighter') && (
                <Line
                  points={currentShape.points}
                  stroke={currentShape.stroke}
                  strokeWidth={currentShape.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  opacity={currentShape.opacity || 1}
                />
              )}
              {currentShape.type === 'rectangle' && (
                <Rect
                  x={currentShape.startX}
                  y={currentShape.startY}
                  width={currentShape.width}
                  height={currentShape.height}
                  stroke={currentShape.stroke}
                  strokeWidth={currentShape.strokeWidth}
                />
              )}
              {currentShape.type === 'circle' && (
                <Circle
                  x={currentShape.startX}
                  y={currentShape.startY}
                  radius={currentShape.radius || 5}
                  stroke={currentShape.stroke}
                  strokeWidth={currentShape.strokeWidth}
                />
              )}
              {currentShape.type === 'arrow' && (
                <Arrow
                  points={currentShape.points}
                  pointerLength={12}
                  pointerWidth={12}
                  fill={currentShape.stroke}
                  stroke={currentShape.stroke}
                  strokeWidth={currentShape.strokeWidth}
                />
              )}
            </>
          )}
        </Layer>
      </Stage>

      {/* Text Input Popup for Text Annotation */}
      {textInputPos && !readOnly && (
        <form
          onSubmit={handleTextSubmit}
          className="absolute z-50 bg-white p-2.5 rounded-xl shadow-2xl border-2 border-[#1B4B8A] animate-fade-in"
          style={{
            left: `${textInputPos.x * scale}px`,
            top: `${textInputPos.y * scale}px`
          }}
        >
          <label className="block text-[11px] font-bold text-[#1B4B8A] mb-1">
            إضافة نص التهميش:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="اكتب الملاحظة هنا..."
              className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#1B4B8A] min-w-[200px]"
            />
            <button
              type="submit"
              className="bg-[#1B4B8A] text-white text-xs px-3 py-1 rounded-lg font-bold hover:bg-[#123a6b]"
            >
              حفظ
            </button>
            <button
              type="button"
              onClick={() => setTextInputPos(null)}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg hover:bg-gray-200"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
