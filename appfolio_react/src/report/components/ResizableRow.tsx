interface RowProps {
  displayname?: string;
  classname?: string;
  width?: number;
  textAlign?: string;
  inLineCss?:string;
  isTotal?: boolean;
}

const ResizableRow: React.FC<RowProps> = ({ displayname, classname, width = 150, textAlign, inLineCss, isTotal }) => {
  return (
    <div
      className={`p-0.5 shrink-0 flex items-center text-sm ${inLineCss} ${classname ?? ''}`}
      style={{ width }}
    >
      <div className={`truncate overflow-hidden whitespace-nowrap w-full ${textAlign}`}>
        {displayname ?? 'Default'}
      </div>
    </div>
  );
};

export default ResizableRow;
