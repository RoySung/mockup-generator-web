import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toPng } from 'html-to-image';
import { Download, Upload, Monitor, Layout, Image as ImageIcon, Maximize, Moon, Sun, Smartphone, Tablet, Link, Move, RotateCcw } from 'lucide-react';
import { MockupFrame, FrameType, Theme } from '@/components/MockupFrame';
import { cn } from '@/lib/utils';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [frameType, setFrameType] = useState<FrameType>('mac');
  const [theme, setTheme] = useState<Theme>('light');
  const [padding, setPadding] = useState(64);
  const [background, setBackground] = useState('#e5e7eb');
  const [borderRadius, setBorderRadius] = useState(12);
  const [isDownloading, setIsDownloading] = useState(false);
  const [sizePreset, setSizePreset] = useState('auto');
  const [customSize, setCustomSize] = useState({ width: 1200, height: 630 });
  
  // Image Adjustment State
  const [imageScale, setImageScale] = useState(1);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  const [url, setUrl] = useState('example.com');

  const canvasRef = useRef<HTMLDivElement>(null);

  const sizePresets = [
    { id: 'auto', label: 'Auto Fit', width: 0, height: 0 },
    { id: 'twitter', label: 'Twitter / OG', width: 1200, height: 630 },
    { id: 'instagram', label: 'Instagram', width: 1080, height: 1080 },
    { id: 'instagram-portrait', label: 'Insta Portrait', width: 1080, height: 1350 },
    { id: 'story', label: 'Story', width: 1080, height: 1920 },
    { id: 'fhd', label: 'Full HD', width: 1920, height: 1080 },
    { id: 'custom', label: 'Custom', width: 0, height: 0 },
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      // Reset adjustments on new image
      setImageScale(1);
      setImagePos({ x: 0, y: 0 });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDrop as any,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);
    try {
      // We need to capture the element without the preview transform
      const dataUrl = await toPng(canvasRef.current, { 
        cacheBust: false, 
        pixelRatio: 2, // Higher quality
        style: { transform: 'none' } // Reset any preview scaling
      });
      const link = document.createElement('a');
      link.download = 'mockup.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert('Failed to generate mockup. If you are using an external image URL, try uploading the image file instead due to browser security restrictions.');
    } finally {
      setIsDownloading(false);
    }
  };

  const backgroundPresets = [
    '#e5e7eb', // Gray
    '#f3f4f6', // Light Gray
    '#ffffff', // White
    '#000000', // Black
    'linear-gradient(to right, #ff7e5f, #feb47b)', // Sunset
    'linear-gradient(to right, #6a11cb, #2575fc)', // Purple Blue
    'linear-gradient(to right, #43e97b, #38f9d7)', // Green
    'linear-gradient(to right, #fa709a, #fee140)', // Pink Yellow
  ];

  const getCanvasDimensions = () => {
    if (sizePreset === 'auto') return null;
    if (sizePreset === 'custom') return customSize;
    return sizePresets.find(p => p.id === sizePreset);
  };

  const canvasDims = getCanvasDimensions();
  
  // Calculate max height for image to fit within canvas
  // Frame headers: Mac ~40px, Chrome ~80px (safe estimate), None 0px
  const headerHeight = frameType === 'mac' ? 40 : (frameType === 'chrome' ? 80 : 0);
  const maxImgHeight = canvasDims ? Math.max(0, canvasDims.height - (padding * 2) - headerHeight) : undefined;

  // Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { 
      x: e.clientX, 
      y: e.clientY, 
      initialX: imagePos.x, 
      initialY: imagePos.y 
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    // Account for preview scale
    const previewScale = sizePreset !== 'auto' ? 0.8 : 1;
    
    const deltaX = (e.clientX - dragStart.current.x) / previewScale;
    const deltaY = (e.clientY - dragStart.current.y) / previewScale;
    
    setImagePos({
      x: dragStart.current.initialX + deltaX,
      y: dragStart.current.initialY + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Global mouse up to catch drags that leave the container
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900"
      onMouseMove={handleMouseMove}
    >
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 p-6 flex flex-col gap-8 overflow-y-auto h-screen sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">M</div>
          <h1 className="text-xl font-bold tracking-tight">Mockup Gen</h1>
        </div>

        {/* Upload Section */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Source Image</label>
          
          {!image ? (
            <>
              <div className="flex p-1 bg-gray-100 rounded-lg mb-2">
                <button 
                  onClick={() => setInputType('upload')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5",
                    inputType === 'upload' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
                <button 
                  onClick={() => setInputType('url')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5",
                    inputType === 'url' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Link className="w-3.5 h-3.5" />
                  URL
                </button>
              </div>

              {inputType === 'upload' ? (
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-32",
                    isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    {isDragActive ? "Drop image here" : "Click or drag"}
                  </p>
                </div>
              ) : (
                <div className="h-32 flex flex-col justify-center">
                   <input 
                     type="text" 
                     placeholder="Paste image URL and press Enter..." 
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                     onBlur={(e) => {
                       if (e.target.value) setImage(e.target.value);
                     }}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && e.currentTarget.value) setImage(e.currentTarget.value);
                     }}
                   />
                   <p className="text-[10px] text-gray-400 mt-2 text-center">
                     Supports direct image links (png, jpg, webp)
                   </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                <img src={image} alt="Source" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <button 
                onClick={() => setImage(null)}
                className="w-full py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 text-xs font-medium transition-colors"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Image Adjustment Section (Only when image exists) */}
        {image && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Image Adjustment</label>
              <button 
                onClick={() => { setImageScale(1); setImagePos({ x: 0, y: 0 }); }}
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1"><Maximize className="w-3 h-3" /> Scale</span>
                <span className="font-mono text-gray-400">{Math.round(imageScale * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="10" 
                step="0.05"
                value={imageScale} 
                onChange={(e) => setImageScale(Number(e.target.value))}
                className="w-full accent-black h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
              <Move className="w-4 h-4 shrink-0" />
              <span>Drag the image in the preview to position it.</span>
            </div>
          </div>
        )}

        {/* Canvas Size */}
        <div className="space-y-2 border-t border-gray-100 pt-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Canvas Size</label>
          <select 
            value={sizePreset}
            onChange={(e) => setSizePreset(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
          >
            {sizePresets.map(preset => (
              <option key={preset.id} value={preset.id}>{preset.label} {preset.width ? `(${preset.width}x${preset.height})` : ''}</option>
            ))}
          </select>
          
          {sizePreset === 'custom' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1 block">Width</label>
                <input 
                  type="number" 
                  value={customSize.width}
                  onChange={(e) => setCustomSize({ ...customSize, width: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1 block">Height</label>
                <input 
                  type="number" 
                  value={customSize.height}
                  onChange={(e) => setCustomSize({ ...customSize, height: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
            </div>
          )}
        </div>

        {/* Frame Type */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Frame Style</label>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
              title="Toggle Frame Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setFrameType('mac')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                frameType === 'mac' ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <Monitor className="w-5 h-5" />
              <span className="text-xs font-medium">macOS</span>
            </button>
            <button 
              onClick={() => setFrameType('chrome')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                frameType === 'chrome' ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <Layout className="w-5 h-5" />
              <span className="text-xs font-medium">Chrome</span>
            </button>
            <button 
              onClick={() => setFrameType('iphone')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                frameType === 'iphone' ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-xs font-medium">iPhone</span>
            </button>
            <button 
              onClick={() => setFrameType('ipad')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                frameType === 'ipad' ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <Tablet className="w-5 h-5" />
              <span className="text-xs font-medium">iPad</span>
            </button>
            <button 
              onClick={() => setFrameType('none')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                frameType === 'none' ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <Maximize className="w-5 h-5" />
              <span className="text-xs font-medium">None</span>
            </button>
          </div>
          
          {frameType !== 'none' && (
            <div className="pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Window Title / URL</label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="example.com"
              />
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Appearance</label>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Padding</span>
              <span className="font-mono text-gray-400">{padding}px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={padding} 
              onChange={(e) => setPadding(Number(e.target.value))}
              className="w-full accent-black h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
             <div className="flex justify-between text-sm">
              <span className="text-gray-600">Border Radius</span>
              <span className="font-mono text-gray-400">{borderRadius}px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="40" 
              value={borderRadius} 
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full accent-black h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">Background</div>
            <div className="grid grid-cols-4 gap-4">
              {backgroundPresets.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBackground(bg)}
                  className={cn(
                    "w-full aspect-square rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110",
                    background === bg && "ring-2 ring-offset-2 ring-black"
                  )}
                  style={{ background: bg }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mx-2 my-4">
               <div className="w-6 h-6 rounded-full border border-gray-200" style={{ background }} />
               <input 
                 type="text" 
                 value={background} 
                 onChange={(e) => setBackground(e.target.value)}
                 className="flex-1 text-xs font-mono border-none bg-transparent focus:ring-0"
               />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <button
            onClick={handleDownload}
            disabled={!image || isDownloading}
            className={cn(
              "w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all",
              !image ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl active:scale-95"
            )}
          >
            {isDownloading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <Download className="w-5 h-5" />
            )}
            <span>{isDownloading ? 'Generating...' : 'Download Mockup'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-gray-100/50 p-8 md:p-12 overflow-auto flex items-center justify-center min-h-[500px]">
        {!image ? (
          <div className="flex flex-col items-center justify-center text-gray-400 space-y-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <ImageIcon className="w-10 h-10 opacity-50" />
            </div>
            <p className="text-lg font-medium">Upload an image to start</p>
          </div>
        ) : (
          <div className="relative group">
             {/* Canvas Container */}
             <div 
               ref={canvasRef}
               className="transition-all duration-300 ease-in-out shadow-sm origin-center"
               style={{ 
                 padding: `${padding}px`, 
                 background: background,
                 borderRadius: '0px',
                 width: sizePreset === 'auto' ? 'auto' : (sizePreset === 'custom' ? customSize.width : sizePresets.find(p => p.id === sizePreset)?.width),
                 height: sizePreset === 'auto' ? 'auto' : (sizePreset === 'custom' ? customSize.height : sizePresets.find(p => p.id === sizePreset)?.height),
                 display: sizePreset === 'auto' ? 'block' : 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 // Scale down for preview if needed (this is a simple hack, for better UX we'd need a real zoom control)
                 transform: sizePreset !== 'auto' ? 'scale(0.8)' : 'none', 
               }}
             >
                <div className={cn(
                  "relative",
                  sizePreset !== 'auto' && "w-full h-full flex items-center justify-center"
                )}>
                  <MockupFrame 
                    type={frameType} 
                    theme={theme}
                    url={url}
                    className={cn(
                      "mx-auto transition-all",
                      sizePreset === 'auto' ? "max-w-[800px]" : "max-w-full max-h-full"
                    )}
                  >
                     <img 
                       src={image} 
                       alt="Preview" 
                       className={cn(
                         "block cursor-move origin-center",
                         isDragging ? "cursor-grabbing" : "cursor-grab"
                       )}
                       onMouseDown={handleMouseDown}
                       style={{ 
                         borderRadius: frameType === 'none' ? `${borderRadius}px` : '0',
                         maxHeight: maxImgHeight ? `${maxImgHeight}px` : undefined,
                         width: '100%',
                         transform: `scale(${imageScale}) translate(${imagePos.x / imageScale}px, ${imagePos.y / imageScale}px)`,
                       }}
                     />
                  </MockupFrame>
                </div>
             </div>
             
             {/* Hover Controls (Zoom, etc - optional for now) */}
          </div>
        )}
      </div>
    </div>
  );
}
