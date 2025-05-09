import {useState } from "react";

interface ColumnCheckBoxProps {
    columns: any;
    setColumnVisibility: any;
}

const ColumnCheckBox = ({ columns, setColumnVisibility }: ColumnCheckBoxProps) => {
    const [checkedState, setCheckedState] = useState(() =>
        columns.reduce((acc: any, col: any) => {
            acc[col.key] = col.key;
            return acc;
        }, {})
    );

    const handleChange = (key: string) => {
        setCheckedState((prev: any) => ({
            ...prev,
            [key]: !prev[key]
        }));
        
        setColumnVisibility((prev: any) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <>
            {columns.map((col: any) => (
                <label key={col.key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        disabled={col.checkBoxDisable}
                        checked={checkedState[col.key]}
                        onChange={() => handleChange(col.key)}
                    />
                    <p>{col.name}</p>
                </label>
            ))}
        </>
    );
};



export default ColumnCheckBox;