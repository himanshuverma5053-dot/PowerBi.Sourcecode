import React, { useState, useEffect } from 'react';
import { getOfficialLogoSettings, LogoDisplaySettings, DEFAULT_LOGO_SETTINGS } from '../utils/logoStorage';

interface MagadhSparshLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const MagadhSparshLogo: React.FC<MagadhSparshLogoProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const [settings, setSettings] = useState<LogoDisplaySettings>(() => getOfficialLogoSettings());

  useEffect(() => {
    const updateLogo = (e?: Event) => {
      if (e && (e as CustomEvent).detail) {
        setSettings((e as CustomEvent).detail);
      } else {
        setSettings(getOfficialLogoSettings());
      }
    };

    window.addEventListener('officialLogoUpdated', updateLogo as EventListener);
    window.addEventListener('storage', updateLogo as EventListener);
    return () => {
      window.removeEventListener('officialLogoUpdated', updateLogo as EventListener);
      window.removeEventListener('storage', updateLogo as EventListener);
    };
  }, []);

  // Compute base height multiplier based on size prop
  const sizeMultiplier = {
    sm: 0.75,
    md: 1.0,
    lg: 1.33,
    xl: 1.66,
  }[size];

  const calculatedMaxHeight = Math.round((settings.maxHeight || 36) * sizeMultiplier);

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: settings.alignment === 'left' ? 'flex-start' : settings.alignment === 'right' ? 'flex-end' : 'center',
  };

  const imgStyle: React.CSSProperties = {
    maxHeight: `${calculatedMaxHeight}px`,
    width: 'auto',
    objectFit: settings.objectFit || 'contain',
    transform: `scale(${settings.scale || 1.0}) translate(${settings.offsetX || 0}px, ${settings.offsetY || 0}px)`,
    transformOrigin: 'center center',
    transition: 'transform 0.15s ease-out, max-height 0.15s ease-out',
  };

  return (
    <div
      onClick={onClick}
      style={containerStyle}
      className={`cursor-pointer select-none group/logo relative overflow-visible ${className}`}
    >
      <img
        src={settings.url && settings.url.trim() !== '' ? settings.url : DEFAULT_LOGO_SETTINGS.url}
        alt="Website Logo"
        style={imgStyle}
        className="transition-opacity duration-200 group-hover/logo:opacity-95"
      />
    </div>
  );
};
