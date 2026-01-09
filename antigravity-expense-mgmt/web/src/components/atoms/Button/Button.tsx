import React from 'react';

interface ButtonProps {
    label: string;
    onClick?: () => void;
    primary?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, primary }) => {
    const mode = primary ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black';
    return (
        <button
            type="button"
            className={`px-4 py-2 rounded ${mode} hover:opacity-80 transition-opacity`}
            onClick={onClick}
        >
            {label}
        </button>
    );
};
