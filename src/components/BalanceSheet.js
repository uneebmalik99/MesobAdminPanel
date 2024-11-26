import React from 'react';
import '../assets/css/./BalanceSheet.css';

const BalanceSheet = ({ items }) => {
  // const calculateCash = (items) => {
  //   return items.reduce((sum, transaction) => 
  //     sum + (parseFloat(transaction.totalCost) || 0), 0).toFixed(2);
  // };

  const calculateCash = (items) => {
    return items.reduce((total, transaction) => {
      const amount = parseFloat(transaction.totalCost) || 0;
      
      if (transaction.type === 0) {
        // Income: add to total
        return total + amount;
      } else if (transaction.type === 1) {
        // Expense
        if (transaction.transactiontype.toLowerCase() === 'cash') {
          // Cash expense: subtract credit value
          const credit = parseFloat(transaction.credit) || 0;
          return total - credit;
        } else if (transaction.transactiontype.toLowerCase() === 'payable') {
          // Payable: do nothing
          return total;
        }
      }
      
      // Default case: return current total
      return total;
    }, 0).toFixed(2);
  };


  const calculatePayableToSeller = (items) => {
    return items.reduce((sum, transaction) => {
      if (transaction.type === 0) {
        const sheepGoatCost = parseFloat(transaction.sheepGoatCost || '0');
        const generalProductsCost = parseFloat(transaction.generalProductsCost || '0');
        return sum + sheepGoatCost + generalProductsCost;
      } else if (transaction.type === 1) {
        if (transaction.transactiontype?.toLowerCase() === 'payable') {
          return sum + (parseFloat(transaction.totalCost) || 0);
        } else if (transaction.transactiontype?.toLowerCase() === 'cash') {
          return sum - (parseFloat(transaction.totalCost) || 0);
        }
      }
      return sum;
    }, 0).toFixed(2);
  };

  const calculateRetainedEarnings = (items) => {
    // Calculate Commission Revenue
    let commissionRevenue = items.reduce((sum, transaction) => {
      if (transaction.type === 0) {
        const sheepProviderCost = parseFloat(transaction.sheepGoatCost || '0');
        const generalProviderCost = parseFloat(transaction.generalProductsCost || '0');
        const totalCost = parseFloat(transaction.totalCost || '0');
        const commissionRevenue = (sheepProviderCost + generalProviderCost) - totalCost;
        return sum + commissionRevenue;
      }
      return sum;
    }, 0);

    // Calculate Fee Expense
    const feeExpense = items.reduce((sum, transaction) => {
      if (transaction.type === 1 && 
          transaction.transactiontype?.toLowerCase() === 'payable') {
        return sum + (parseFloat(transaction.credit) || 0);
      }
      return sum;
    }, 0);


    commissionRevenue= Math.abs(commissionRevenue)

    console.log('commissionRevenue=>>', commissionRevenue);


    // Calculate Net Income
    return Math.abs(commissionRevenue - feeExpense).toFixed(2);
  };

  const cash = calculateCash(items || []);
  const payable = calculatePayableToSeller(items || []);
  const retainedEarnings = calculateRetainedEarnings(items);

  if (!items || items.length === 0) {
    return (
      <div className="balance-sheet-container">
        <h1>Balance Sheet</h1>
        <p>No data available for Balance Sheet</p>
      </div>
    );
  }

  return (
    <div className="balance-sheet-container">
      <h1>Balance Sheet</h1>
      <table className="balance-sheet-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cash</td>
            <td className="amount positive">{cash}$</td>
            <td></td>
          </tr>
          <tr className="section-header">
            <td>Liability</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Payable to seller</td>
            <td></td>
            <td className="amount negative">{payable}$</td>
          </tr>
          <tr className="section-header">
            <td>Equity</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Retained earnings / Net income</td>
            <td></td>
            <td style={{backgroundColor:'#ffa6ff'}} className="amount">{retainedEarnings}$</td>
          </tr>
          <tr className="total-row">
            <td>Total</td>
            <td>{cash}$</td>
            <td>{cash}$</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BalanceSheet;