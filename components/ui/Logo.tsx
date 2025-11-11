import React from 'react';

export const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="16" fill="currentColor" className="text-primary-100" style={{color: 'var(--color-primary-100)'}} />
        <path 
            d="M24 8C15.1634 8 8 15.1634 8 24C8 32.8366 15.1634 40 24 40C27.3508 40 30.4574 39.1121 33.0583 37.5843" 
            stroke="currentColor" 
            className="text-primary-500"
            style={{color: 'var(--color-primary-500)'}}
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <path 
            d="M36.9997 27C35.9997 24 33 18 24 18C17 18 13.9997 22 11.9997 25" 
            stroke="currentColor" 
            className="text-primary-900" 
            style={{color: 'var(--color-primary-900)'}}
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
    </svg>
);
