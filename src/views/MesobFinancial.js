import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Form,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem ,
  FormGroup,
  Label,
  Popover,
  PopoverBody,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import formatDate from "utils/formatDate";
import { Helmet } from "react-helmet";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import formatUserId from "utils/formatUID";
import { Editor } from "@tinymce/tinymce-react";
import { FixedSizeList as List } from 'react-window';
import './TransactionTable.css';
import { AddExpenseButton } from "components/AddExpenseButton";
import IncomeStatement from "../components/IncomeStatement";
import BalanceSheet from "components/BalanceSheet";
import { BsTrashFill } from 'react-icons/bs';
function MesobFinancial() {

 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMultiUsers, setModalMultiUsers] = useState(false); // Modal state
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const notificationAlertRef = useRef(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const notify = (place, message, type) => {
    const options = {
      place: place,
      message: (
        <div>
          <div>{message}</div>
        </div>
      ),
      type: type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const filterItemsByTimeRange = (items, range) => {
    if (!range.from || !range.to) return items;
    
    const fromDate = new Date(range.from);
    const toDate = new Date(range.to);
    
    return items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= fromDate && itemDate <= toDate;
    });
  };

  useEffect(() => {
    axios
      .get("https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/MesobFinancial")
      .then((response) => {
        if (response) {
          setItems(response.data.Items);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the items!", error);
      });
  }, []);

  const handleSelectRange = (range) => {
    setSelectedTimeRange(range);
  };

  const filteredItems = filterItemsByTimeRange(items, selectedTimeRange);

  // function calculateTotalCashOnHand(items) {
  //   return items.reduce((sum, transaction) => {
  //     const amount = parseFloat(transaction.totalCost) || 0;
      
  //     // If type is 1 (expense), subtract the amount
  //     if (transaction.type === 1) {
  //       return sum - amount;
  //     }
  //     // Otherwise add the amount
  //     return sum + amount;
  //   }, 0).toFixed(2);
  // }


  // function calculateTotalPayable(items) {
  //   return items.reduce((sum, transaction) => {
  //     const sheepGoatCost = parseFloat(transaction.sheepGoatCost) || 0;
  //     const generalProductsCost = parseFloat(transaction.generalProductsCost) || 0;
  //     return sum + sheepGoatCost + generalProductsCost;
  //   }, 0).toFixed(2);
  // }
  function calculateTotalCashOnHand(items) {
    return items.reduce((sum, transaction) => {
      const amount = parseFloat(transaction.totalCost) || 0;
      if (transaction.type === 1) {
        if (transaction.transactiontype && transaction.transactiontype.toLowerCase() === 'cash') {
          return sum + amount; // Add to cash on hand if expense is cash
        }
        return sum - amount; // Subtract for other expenses
      }
      return sum + amount; // Add for income (type 0)
    }, 0).toFixed(2);
  }
  
  // function calculateTotalPayable(items) {
  //   return items.reduce((sum, transaction) => {
  //     if (transaction.type === 0) {
  //       const sheepGoatCost = parseFloat(transaction.sheepGoatCost) || 0;
  //       const generalProductsCost = parseFloat(transaction.generalProductsCost) || 0;
  //       return sum + sheepGoatCost + generalProductsCost;
  //     }
  //     return sum;
  //   }, 0).toFixed(2);
  // }
  function calculateTotalPayable(items) {
    return items.reduce((sum, transaction) => {
      if (transaction.type === 0) {
        const sheepGoatCost = parseFloat(transaction.sheepGoatCost) || 0;
        const generalProductsCost = parseFloat(transaction.generalProductsCost) || 0;
        return sum + sheepGoatCost + generalProductsCost;
      } else if (transaction.type === 1 && transaction.transactiontype && transaction.transactiontype.toLowerCase() === 'payable') {
        return sum + (parseFloat(transaction.totalCost) || 0);
      }
      return sum;
    }, 0).toFixed(2);
  }

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

  const handleAddExpense = (expense) => {
    console.log('New expense:', expense);
    // Here you would typically update your state or send data to your backend
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setLoading(true);
      axios.delete(`https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/MesobFinancial/expense?id=`+id, )
      .then(() => {
        notify("tr", "Record deleted successfully", "success");
        // Reload the page
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error deleting record:", error);
        notify("tr", "Failed to delete record", "danger");
      })
      .finally(() => {
        setLoading(false);
      });
    }
  };

  const handleDeleteAllRecords = () => {
    setShowDeleteConfirmation(true);
  };
  
  const confirmDelete = () => {
    setLoading(true);
    axios.delete("https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/MesobFinancial")
      .then((response) => {
        setItems([]);
        setLoading(false);
        notify("tr", "All records deleted successfully", "success");
      })
      .catch((error) => {
        console.error("Error deleting records:", error);
        setLoading(false);
        notify("tr", "Failed to delete records", "danger");
      });
    setShowDeleteConfirmation(false);
  };
 
  const RunButtons = ({ onSelectRange }) => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
  
    const handleRun = () => {
      if (fromDate && toDate) {
        onSelectRange({ from: fromDate, to: toDate });
      } else {
        // Handle case when dates are not selected
        alert('Please select both From and To dates');
      }
    };
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormGroup style={{ marginRight: '10px' }}>
          <Label for="fromDate">From</Label>
          <Input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </FormGroup>
        <FormGroup style={{ marginRight: '10px' }}>
          <Label for="toDate">To</Label>
          <Input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </FormGroup>
        <Button color="primary" onClick={handleRun}>
          Run
        </Button>
      </div>
    );
  };


const TransactionTable = ({ }) => {
  // Sort the transactions array by date, latest first
  const filteredItems = filterItemsByTimeRange(items, selectedTimeRange);
  const sortedTransactions = [...filteredItems].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Sr. Number</th>
            <th>Transaction</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((transaction, index) => (
            <tr key={index} className={transaction.type === 1 ? "expense-row" : ""}>
              <td>{transaction.date}</td>
              <td>{index + 1}</td>
              {transaction.type === 1 ? (
                <td>
                  <div>{transaction.expensename || "Expense"}</div>
                  <div>{transaction.transactiontype || "Cash"}</div>
                </td>
              ) : (
                <td>
                  <div>Cash</div>
                  {transaction?.generalProductsCost && transaction?.generalProductsCost !== '0.00' && <div>Payable to general provider</div>}
                  {transaction?.sheepGoatCost && transaction?.sheepGoatCost !== '0.00' && <div>Payable to sheep provider</div>}
                  <div>Commission Revenue</div>
                </td>
              )}
              {transaction.type === 1 ? (
                <td className="debit">
                  <div>{transaction.totalCost}$</div>
                  <div>-</div>
                </td>
              ) : (
                <td className="debit">
                  <div>{transaction.totalCost}$</div>
                  {transaction?.sheepGoatCost && transaction?.sheepGoatCost !== '0.00' && <div>-</div>}
                  {transaction?.generalProductsCost && transaction?.generalProductsCost !== '0.00' && <div>-</div>}
                  <div>-</div>
                </td>
              )}
              {transaction.type === 1 ? (
                <td >
                  <tr style={{borderWidth:0}}>
                <td className="credit" style={{borderWidth:0}}>
                  <div>-</div>
                  <div>{transaction.credit}$</div>
                </td>
                <td style={{borderWidth:0}}>
              
                {transaction.type === 1 && (
                  <BsTrashFill 
                    className="delete-btn" 
                    onClick={() => handleDelete(transaction.id)}
                    style={{ cursor: 'pointer', color: '#e10d05' }}
                  />
                )}
            
                </td>
                </tr>
                </td>
              ) : (
                <td className="credit">
                  <div>-</div>
                  {transaction?.generalProductsCost && transaction?.generalProductsCost !== '0.00' && <div>{transaction.generalProductsCost}$</div>}
                  {transaction?.sheepGoatCost && transaction?.sheepGoatCost !== '0.00' && <div>{transaction.sheepGoatCost}$</div>}
                  <div>
                    {(() => {
                      const sheepGoatCost = parseFloat(transaction?.sheepGoatCost || 0);
                      const generalProductsCost = parseFloat(transaction?.generalProductsCost || 0);
                      const totalCost = parseFloat(transaction?.totalCost || 0);
                      const result = (sheepGoatCost + generalProductsCost - totalCost).toFixed(2);
                      return `${Math.abs(parseFloat(result)).toFixed(2)}$`;
                    })()}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{width:'100%', padding:20, justifyContent:'center'}}>
        <AddExpenseButton onAddExpense={handleAddExpense} />
      </div>
    </div>
  );
};

  return (
    <>
      <Helmet>
        <title>Mesob Financial - Mesob Store</title>
      </Helmet>

      <PanelHeader
        size="sm"
        content={
          <div className="header text-center">
            <h2 className="title">Mesob Financial Report</h2>
          </div>
        }
      />
      <NotificationAlert ref={notificationAlertRef} />

<div className="content">
        <Row>
          <Col xs={12}>
            <Card>
            <CardHeader>
  <div style={{ display: "flex", flexDirection:'row', paddingInline:25, alignItems: "center", justifyContent: "space-between" }}>
    <CardTitle tag="h4">Journal Entry</CardTitle>
    <div style={{display:'flex', justifyContent:'space-between'}} >
      <RunButtons onSelectRange={handleSelectRange} />
      <Button color="danger" onClick={handleDeleteAllRecords} style={{ marginLeft: '10px',marginTop:19,  height:37 }}>
        Close
      </Button>
    </div>
  </div>
</CardHeader>
              <CardBody>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spinner color="primary" />
                    <p>Loading ...</p>
                  </div>
                ) : (
                  <>
                    <TransactionTable />
                    <div style={{margin:25}}>
                      <p>Total Cash on hand = {calculateTotalCashOnHand(filteredItems)}$</p>
                      <p>Total Payable (Unpaid) = {calculateTotalPayable(filteredItems)}$</p>
                      <p>Commission Revenue = {calculateCommissionRevenue(filteredItems)}$</p>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <IncomeStatement items={filteredItems} />
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BalanceSheet items={filteredItems}/>
              </CardHeader>
            </Card>
          </Col>
        </Row>
        {/* Confirmation Modal */}
<Modal isOpen={showDeleteConfirmation} toggle={() => setShowDeleteConfirmation(false)}>
  <ModalHeader toggle={() => setShowDeleteConfirmation(false)}>Confirm Delete</ModalHeader>
  <ModalBody>
    Are you sure you want to delete all records? This action cannot be undone.
  </ModalBody>
  <div className="modal-footer">
    <Button color="secondary" onClick={() => setShowDeleteConfirmation(false)}>No</Button>
    <Button color="danger" onClick={confirmDelete}>Yes, Delete All</Button>
  </div>
</Modal>
      </div>
    </>
  );
}

export default MesobFinancial;
