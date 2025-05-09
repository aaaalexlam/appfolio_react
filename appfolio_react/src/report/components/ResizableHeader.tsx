import React, { useRef, useEffect, useState } from 'react';

interface Props {
    displayname?:string;
    classname?: string;
    width?: number;
    textAlign?: string;
    onResize?: (key: string, width: number) => void;
}

const ResizableHeader: React.FC<Props> = ({displayname, classname, width = 150, textAlign, onResize }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseDown = () => setIsResizing(true);
    const handleMouseMove = (e: MouseEvent) => {
        if (isResizing && ref.current && classname && onResize) {
            const newWidth = e.clientX - ref.current.getBoundingClientRect().left;
            if (newWidth > 80) onResize(classname, newWidth);
        }
    };
    const stopResize = () => setIsResizing(false);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', stopResize);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopResize);
        };
    }, [isResizing]);

    return (
        <div
            ref={ref}
            className={`flex bg-neutral-200 shrink-0 items-center h-8 ${classname ?? ''}`}
            style={{ width }}
        >
            <div className={`flex-grow truncate overflow-hidden whitespace-nowrap ${textAlign}`}>
                {displayname ?? 'Header'}
            </div>
            <div
                className="w-1 ml-1 mr-1 h-[50%] rounded-sm bg-neutral-400  cursor-ew-resize"
                onMouseDown={handleMouseDown}
            />
        </div>
    );
};

export default ResizableHeader;
