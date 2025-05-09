
import { useState, useEffect } from "react";
import ResizableHeader from "./components/ResizableHeader";
import ResizableRow from "./components/ResizableRow";
import tableComponent from './data/TableComponent.json';
import glAccount from './data/GlAccount.json';
import ColumnCheckBox from "./ColumnCheckBox";

interface Account {
    id: string;
    subAccountId?: string | null; // <-- allow null here
    accountType: string;
    [key: string]: any; // allow all other dynamic fields
}

interface TreeNode extends Account {
    children: TreeNode[];
}

function toTree(data: Account[]): TreeNode[] {
    const accountMap: { [id: string]: TreeNode } = {};
    const roots: TreeNode[] = [];

    data.forEach(acc => {
        accountMap[acc.id] = { ...acc, children: [] };
    });

    data.forEach(acc => {
        if (acc.subAccountId && accountMap[acc.subAccountId]) {
            accountMap[acc.subAccountId].children.push(accountMap[acc.id]);
        } else {
            roots.push(accountMap[acc.id]);
        }
    });

    return roots;
}

const balanceSheetEntry = tableComponent.data.find(item => item.balanceSheet);
const balanceSheet = balanceSheetEntry?.balanceSheet;

const cashData: TreeNode[] = toTree(glAccount.glCodeData.filter(gl => gl.accountType === 'cash'));
const assetData: TreeNode[] = toTree(glAccount.glCodeData.filter(gl => gl.accountType === 'asset'));
const liabilityData: TreeNode[] = toTree(glAccount.glCodeData.filter(gl => gl.accountType === 'liability'));
const capitalData: TreeNode[] = toTree(glAccount.glCodeData.filter(gl => gl.accountType === 'capital'));

const initialWidths: { [key: string]: number } = {};
balanceSheet?.columns.forEach((col) => {
    if (col.key && col.width) {
        const widthNum = col.width;
        if (!isNaN(widthNum)) {
            initialWidths[col.key] = widthNum;
        }
    }
});
const BalanceTable = () => {
    const [widths, setWidths] = useState<{ [key: string]: number }>(initialWidths);
    const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>({});

    const updateWidth = (key: string, newWidth: number) => {
        setWidths(prev => ({ ...prev, [key]: newWidth }));
    };

    const accountNameWidth = widths['accountName'] ? widths['accountName'] : 180;
    const balanceWidth = widths['balance'] ? widths['balance'] : 180;

    useEffect(() => {
        if (balanceSheet?.columns) {
            const initialVisibility: { [key: string]: boolean } = {};
            balanceSheet.columns.forEach(col => {
                initialVisibility[col.key] = col.display;
            });
            setColumnVisibility(initialVisibility);
        }
    }, [balanceSheet]);

    function createAccountRow(account: any, level: number) {
        return balanceSheet?.columns.map((column) => {
            if (!columnVisibility[column.key]) return null;

            const key = column.key;
            const width = key && widths[key] ? widths[key] : 180;
            
            let displayValue = `${account[column.key]}`;
            let inLineCss = "border-b-1 border-neutral-200";

            if(column.key === "accountName"){
                displayValue = `${"\u00A0\u00A0\u00A0\u00A0".repeat(level)}${account[column.key]}`;
                if(account.children.length > 0){
                    inLineCss += " font-bold";
                }
            }

            if(column.key === "balance"){
                inLineCss = "border-b-1 border-neutral-200 text-blue-700";

            }

            return (
                <ResizableRow
                    key={column.key}
                    displayname={displayValue}
                    classname={column.key}
                    width={width}
                    inLineCss={inLineCss}
                    textAlign={column.textAlign}
                />

            );
        });
    }

    function buildAccountsDiv(accounts: any, level = 1) {
        return accounts.map((account: any) => {
            return (
                <div key={`${account.id}${level}`}>
                    <div className="flex hover:bg-blue-100" key={account.id}>
                        {createAccountRow(account, level)}
                        <div className="grow border-b-1 border-neutral-200"></div>
                    </div>
                    {account.children && account.children.length > 0 && (
                        <div >
                            {buildAccountsDiv(account.children, level + 1)}
                            <div className="flex font-bold">
                                {
                                    balanceSheet?.columns.map((column) => {
                                        if (!columnVisibility[column.key]) return null;

                                        const key = column.key;
                                        const width = key && widths[key] ? widths[key] : 180;
                                        let displayValue = '';
                                        let inLineCss = '';
                                        if (key === 'accountName') {
                                            displayValue = `${"\u00A0\u00A0\u00A0\u00A0".repeat(level)} Total ${account[column.key]}`
                                            inLineCss = "border-b-1 border-neutral-200";
                                        }
                                        if (key === 'balance') {
                                            displayValue = '0.00';
                                            inLineCss = "text-blue-700 border-t border-b border-t-black border-b-neutral-200"
                                        }

                                        return (
                                            <ResizableRow
                                                key={column.key}
                                                displayname={displayValue}
                                                classname={column.key}
                                                width={width}
                                                textAlign={column.textAlign}
                                                inLineCss={inLineCss}
                                            />
                                        );

                                    })
                                }
                                <div className="grow border-b-1 border-neutral-200"></div>
                            </div>
                        </div>
                    )}
                </div>
            )
        });
    }

    return (
        <>
            <div className="flex">
                <div className="grow overflow-auto max-h-[80vh]">
                    <div className="flex sticky top-0">
                        {
                            balanceSheet?.columns.map((column) => {
                                if (!columnVisibility[column.key]) return null;
                                const key = column.key;
                                const width = key && widths[key] ? widths[key] : 180;
                                return (
                                    <ResizableHeader
                                        key={key}
                                        displayname={column.name}
                                        classname={key}
                                        width={width}
                                        textAlign={column.textAlign}
                                        onResize={updateWidth}
                                    />
                                );
                            })
                        }
                        <div className="grow bg-neutral-200"></div>

                    </div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">ASSETS</div>
                    <div className=" font-bold grow border-b-1 border-neutral-200">Cash</div>
                    {
                        buildAccountsDiv(cashData)
                    }
                    <div className="flex font-bold grow border-b-1 border-neutral-200">
                        <div style={{ width: `${accountNameWidth}px` }}>Total Cash</div>
                        <div className="text-end border-t-2 border-b-black" style={{ width: `${balanceWidth}px` }} >0.00</div>
                    </div>
                    {
                        buildAccountsDiv(assetData)
                    }
                    <div className="flex font-bold grow border-b-1 border-neutral-200">
                        <div style={{ width: `${accountNameWidth}px` }}>Total ASSETS</div>
                        <div className="text-end border-t-2 border-b-black" style={{ width: `${balanceWidth}px` }} >0.00</div>
                    </div>

                    <div className=" font-bold grow border-b-1 border-neutral-200">LIABILITIES & CAPITAL</div>
                    <div className=" font-bold grow border-b-1 border-neutral-200">Liabilities</div>
                    {
                        buildAccountsDiv(liabilityData)
                    }
                    <div className="flex font-bold grow border-b-1 border-neutral-200">
                        <div style={{ width: `${accountNameWidth}px` }}>Total Liabilities</div>
                        <div className="text-end border-t-2 border-b-black" style={{ width: `${balanceWidth}px` }} >0.00</div>
                    </div>
                    <div className=" font-bold grow border-b-1 border-neutral-200">Capital</div>
                    {
                        buildAccountsDiv(capitalData)
                    }
                    <div className="flex font-bold grow border-b-1 border-neutral-200">
                        <div style={{ width: `${accountNameWidth}px` }}>Total Capital</div>
                        <div className="text-end border-t-2 border-b-black" style={{ width: `${balanceWidth}px` }} >0.00</div>
                    </div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">
                        <div style={{ width: `${accountNameWidth}px` }}>LIABILITIES & CAPITAL</div>
                        <div className="text-end border-t-2 border-b-black" style={{ width: `${balanceWidth}px` }} >0.00</div>
                    </div>
                    <div className="font-bold sticky bottom-0 bg-white">Total (52 Results)</div>
                </div>
                <div className="p-2 overflow-auto max-h-[80vh] rounded w-64 min-w-64 shadow-2xl ml-1">
                    <ColumnCheckBox
                        columns={balanceSheet?.columns}
                        setColumnVisibility={setColumnVisibility}
                    />
                </div>
            </div>
        </>
    );

}

export default BalanceTable;