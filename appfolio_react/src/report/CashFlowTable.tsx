import { useState, useEffect } from "react";
import tableComponent from './data/TableComponent.json';
import ResizableHeader from "./components/ResizableHeader";
import ColumnCheckBox from "./ColumnCheckBox";
import glAccount from './data/GlAccount.json';
import ResizableRow from "./components/ResizableRow";

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

const cashFlowEntry = tableComponent.data.find(item => item.cashFlow);
const cashFlow = cashFlowEntry?.cashFlow;
const initialWidths: { [key: string]: number } = {};
const incomeData: TreeNode[] = toTree(glAccount.glCodeData.filter(gl => gl.accountType === 'income'));
const expenseData: TreeNode[] = toTree(glAccount.glCodeData.filter(gl => gl.accountType === 'expense'));
const otherIncome: TreeNode[] = toTree(glAccount.glCodeData.filter(gl => gl.accountType === 'other_income'));
const otherExpense: TreeNode[] = toTree(glAccount.glCodeData.filter(gl => gl.accountType === 'other_expense'));

cashFlow?.columns.forEach((col) => {
    if (col.key && col.width) {
        const widthNum = col.width;
        if (!isNaN(widthNum)) {
            initialWidths[col.key] = widthNum;
        }
    }
});

const CashFlowTable = () => {
    const [widths, setWidths] = useState<{ [key: string]: number }>(initialWidths);
    const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>({});
    const updateWidth = (key: string, newWidth: number) => {
        setWidths(prev => ({ ...prev, [key]: newWidth }));
    };

    useEffect(() => {
        if (cashFlow?.columns) {
            const initialVisibility: { [key: string]: boolean } = {};
            cashFlow.columns.forEach(col => {
                initialVisibility[col.key] = col.display;
            });
            setColumnVisibility(initialVisibility);
        }
    }, [cashFlow]);

    function createAccountRow(account: any, level: number) {

        return cashFlow?.columns.map((column) => {
            if (!columnVisibility[column.key]) return null;

            const key = column.key;
            const width = key && widths[key] ? widths[key] : 180;

            let displayValue = `${account[column.key]}`;
            let inLineCss = "border-b-1 border-neutral-200";

            if (column.key === "accountName") {
                displayValue = `${"\u00A0\u00A0\u00A0\u00A0".repeat(level)}${account[column.key]}`;
                if (account.children.length > 0) {
                    inLineCss += " font-bold";
                }
            }

            if (column.key === "selectedPeriod") {
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

    function buildAccountsDiv(accounts: any, level = 2) {
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
                                    cashFlow?.columns.map((column) => {
                                        if (!columnVisibility[column.key]) return null;

                                        const key = column.key;
                                        const width = key && widths[key] ? widths[key] : 180;
                                        let displayValue = `${account[column.key]}`
                                        let inLineCss = "border-b-1 border-neutral-200";

                                        if (key === 'accountName') {
                                            displayValue = `${"\u00A0\u00A0\u00A0\u00A0".repeat(level)}Total ${account[column.key]}`
                                            console.log('displayValue::: ', displayValue);
                                            inLineCss = "border-b-1 border-neutral-200";
                                        }
                                        if (key === 'selectedPeriod' || key === 'fiscalYearToDate') {
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
                            cashFlow?.columns.map((column) => {
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
                    <div className="flex font-bold grow border-b-1 border-neutral-200">Operating Income & Expense</div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0`}Income</div>
                    {
                        buildAccountsDiv(incomeData)
                    }
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0`}Total Operating Income</div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0`}Expense</div>
                    {
                        buildAccountsDiv(expenseData)
                    }
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0`}Total Operating Expense</div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0`}NOI - Net Operating Income</div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0`}Other Income & Expense</div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}Other Income </div>
                    {
                        buildAccountsDiv(otherIncome, 3)
                    }
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}Total Other Income </div>

                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}Other Expense </div>
                    {
                        buildAccountsDiv(otherExpense, 3)
                    }
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}Total Other Expense </div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}Net Other Income </div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}Total Income </div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}Total Expense </div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">{`\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}Net Income </div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">Cash Flow </div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">Beginning Cash </div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">Beginning Cash + Cash Flow</div>
                    <div className="flex font-bold grow border-b-1 border-neutral-200">Actual Ending Cash </div>

                    <div className="font-bold sticky bottom-0 bg-white">Total (52 Results)</div>
                    
                </div>  
                <div className="p-2 overflow-auto max-h-[80vh] rounded w-64 min-w-64 shadow-2xl ml-1">
                    <ColumnCheckBox
                        columns={cashFlow?.columns}
                        setColumnVisibility={setColumnVisibility}
                    />
                </div>
            </div>
        </>
    );
}

export default CashFlowTable;

