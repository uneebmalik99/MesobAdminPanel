import React from 'react';
import '../assets/css/./BalanceSheet.css';

const BalanceSheet = ({ items }) => {
  const calculateCash = (items) => {
    return items.reduce((sum, transaction) => 
      sum + (parseFloat(transaction.totalCost) || 0), 0).toFixed(2);
  };

  const calculatePayableToSeller = (items) => {
    return items.reduce((sum, transaction) => {
      const sheepGoatCost = parseFloat(transaction.sheepGoatCost) || 0;
      const generalProductsCost = parseFloat(transaction.generalProductsCost) || 0;
      return sum + sheepGoatCost + generalProductsCost;
    }, 0).toFixed(2);
  };

  const calculateRetainedEarnings = (cash, payable) => {
    return (parseFloat(cash) - parseFloat(payable)).toFixed(2);
  };

  const cash = calculateCash(items || []);
  const payable = calculatePayableToSeller(items || []);
  const retainedEarnings = calculateRetainedEarnings(cash, payable);

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
            <td className="amount negative">{payable}</td>
          </tr>
          <tr className="section-header">
            <td>Equity</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Retained earnings / Net income</td>
            <td></td>
            <td className="amount">{retainedEarnings}</td>
          </tr>
          <tr className="total-row">
            <td>Total</td>
            <td>{cash}</td>
            <td>{cash}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BalanceSheet;