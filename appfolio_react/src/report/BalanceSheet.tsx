import BalanceTable from "./BalanceTable";
import tableComponent from '../report/data/TableComponent.json';

const balanceSheetEntry = tableComponent.data.find(item => item.balanceSheet);
const balanceSheet = balanceSheetEntry?.balanceSheet;
const customization = balanceSheet?.customization;

const BalanceSheet = () => {
    return (
        <>
            <h1 className="text-4xl font-bold">Balance Sheet</h1>
            <div>
                {
                    customization?.map((component: any) => {
                        return (
                            <div className="font-bold" key={component.inputType}>{component.displayName}:</div>
                        )
                    })
                }
            </div>
            <BalanceTable />
        </>
    )
}

export default BalanceSheet;