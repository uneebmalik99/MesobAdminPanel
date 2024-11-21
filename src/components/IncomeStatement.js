import React, { useState, useEffect } from 'react';
import '../assets/css/IncomeStatement.css';

const IncomeStatement = ({ items }) => {
  function calculateCommissionRevenue(items) {
    const totalCommission = items.reduce((sum, transaction) => {
      const sheepProviderCost = parseFloat(transaction.sheepGoatCost || '0');
      const generalProviderCost = parseFloat(transaction.generalProductsCost || '0');
      const totalCost = parseFloat(transaction.totalCost || '0');
      
      const commissionRevenue = (sheepProviderCost + generalProviderCost) - totalCost;
      return sum + commissionRevenue;
    }, 0);
  
    return Math.abs(totalCommission).toFixed(2);
  }
  
  const [commissionRevenue, setCommissionRevenue] = useState(0);
  const [feeExpense, setFeeExpense] = useState(0);

  useEffect(() => {
    if (items.length > 0) {
      setCommissionRevenue(parseFloat(calculateCommissionRevenue(items)));
      setFeeExpense(5); // Only set fee expense when there are items
    } else {
      setCommissionRevenue(0);
      setFeeExpense(0);
    }
  }, [items]);

  const calculateNetIncome = () => {
    return (commissionRevenue - feeExpense).toFixed(2);
  };

  if (items.length === 0) {
    return <div className="income-statement">No data available for Income Statement</div>;
  }

  return (
    <div className="income-statement">
      <h1>Income Statement</h1>
      <div className="statement-table">
        <table>
          <tbody>
            <tr>
              <td><strong>Revenue</strong></td>
              <td></td>
            </tr>
            <tr>
              <td>Commission Revenue</td>
              <td>${commissionRevenue}</td>
            </tr>
            <tr>
              <td><strong>Expense</strong></td>
              <td></td>
            </tr>
            <tr>
              <td>Fee Expense</td>
              <td>${feeExpense}</td>
            </tr>
            <tr>
              <td><strong>Net Income</strong></td>
              <td>${calculateNetIncome()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeStatement;