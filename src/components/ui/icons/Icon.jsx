import React from 'react';

export default function Icon({ name, className }) {
  // For MDI icons, we need to handle the path differently
  const iconPath = name.startsWith('mdi:') 
    ? `/src/icons/${name.replace('mdi:', '')}.svg#icon`
    : `/_astro/icons/${name}.svg#icon`;

  return (
    <span className={`icon-wrapper ${className || ''}`}>
      <svg className={`astro-icon ${className || ''}`}>
        <use href={iconPath} />
      </svg>
    </span>
  );
} 