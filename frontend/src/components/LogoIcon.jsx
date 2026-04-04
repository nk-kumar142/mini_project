import React from 'react';

const LogoIcon = ({ size = 24, className = "" }) => (
    <img
        src="/logo.png"
        alt="ExamHall Logo"
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
    />
);

export default LogoIcon;
