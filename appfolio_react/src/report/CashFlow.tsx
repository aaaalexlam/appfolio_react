import tableComponent from '../report/data/TableComponent.json';
import CashFlowTable from './CashFlowTable';
const cashFlowEntry = tableComponent.data.find(item => item.cashFlow);
const cashFlow = cashFlowEntry?.cashFlow;
const customization = cashFlow?.customization;

const CashFlow = () => {
    return (
        <>
            <h1 className="text-4xl font-bold">Cash Flow</h1>
            <div>
                {
                    customization?.map((component: any) => {
                        return (
                            <div className="font-bold" key={component.key}>{component.displayName}:</div>
                        )
                    })
                }
            </div>
            <CashFlowTable/>
            
        </>
    )
}

export default CashFlow;