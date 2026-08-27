import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, RotateCcw } from 'lucide-react';

const PARTNERS_STORAGE_KEY = 'magadh_partners_section_image';

export const OurPartnersSection: React.FC = () => {
  const [customImage, setCustomImage] = useState<string | null>(() => {
    return localStorage.getItem(PARTNERS_STORAGE_KEY) || null;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomImage(dataUrl);
        localStorage.setItem(PARTNERS_STORAGE_KEY, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImage(null);
    localStorage.removeItem(PARTNERS_STORAGE_KEY);
  };

  return (
    <section id="our-partners-section" className="w-full px-0 mx-0 py-0 border-y border-slate-200/90 bg-[#ffffff] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden select-none">
      {/* Image Section Container spanning full width to touch all borders */}
      <div
        id="our-partners-blank-content"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="group relative w-full overflow-hidden bg-[#ffffff] transition-all duration-300"
      >
        {customImage ? (
          /* Custom Uploaded Image View */
          <div className="relative w-full aspect-[16/5] min-h-[160px] sm:min-h-[220px] md:min-h-[280px] flex items-center justify-center bg-[#ffffff]">
            <img
              src={customImage}
              alt="Partners Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover sm:object-contain object-center"
            />
            {/* Top Heading */}
            <div className="absolute top-4 sm:top-6 md:top-8 inset-x-0 flex flex-col items-center justify-center pointer-events-none px-4 z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-widest text-slate-950 uppercase font-['Poppins',sans-serif]">
                OUR TRUSTED PARTNER
              </h2>
            </div>
          </div>
        ) : (
          /* Full Pure White Canvas with Top Heading */
          <div className="relative w-full aspect-[16/5] min-h-[160px] sm:min-h-[220px] md:min-h-[280px] bg-[#ffffff] flex items-center justify-center select-none">
            {/* Top Heading */}
            <div className="absolute top-4 sm:top-6 md:top-8 inset-x-0 flex flex-col items-center justify-center pointer-events-none px-4 z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-widest text-slate-950 uppercase font-['Poppins',sans-serif]">
                OUR TRUSTED PARTNER
              </h2>
            </div>
          </div>
        )}

        {/* Quick Upload / Replace Overlay Control (visible on hover) */}
        <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium backdrop-blur-xs border border-white/20 shadow-md cursor-pointer transition-all hover:scale-105"
            title="Upload image"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Change Image</span>
          </button>

          {customImage && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-red-900/80 text-slate-200 hover:text-white text-xs font-medium backdrop-blur-xs border border-white/20 shadow-md cursor-pointer transition-all"
              title="Reset to default image"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
      </div>
    </section>
  );
};

