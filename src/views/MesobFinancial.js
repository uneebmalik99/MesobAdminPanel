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

function MesobFinancial() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // For single user
  const [selectedUser, setSelectedUser] = useState(null); // User data for modal
  const [modalCartItem, setModalCartItems] = useState(false); // Modal state
  const [subjectCartItem, setSubjectCartItem] = useState("");
  const [bodyCartItem, setBodyCartItem] = useState("");
  const editorRef = useRef(null);

  // for multiple users
  const [selectedUsers, setSelectedUsers] = useState([]); // Store selected users
  const [modalMultiUsers, setModalMultiUsers] = useState(false); // Modal state
  const [subjectMultiUsers, setSubjectMultiUsers] = useState("");
  const [bodyMultiUsers, setBodyMultiUsers] = useState("");

  const [sendBtnLoading, setSendBtnLoading] = useState(false);
  const [sendMultipleBtnLoading, setSendMultipleBtnLoading] = useState(false);
  const notificationAlertRef = useRef(null);

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

  const handleViewEmails = () => {
    setModalMultiUsers(true);
  };

  function calculateTotalCashOnHand(items) {
    return items.reduce((sum, transaction) => {
      const amount = parseFloat(transaction.totalCost) || 0;
      
      // If type is 1 (expense), subtract the amount
      if (transaction.type === 1) {
        return sum - amount;
      }
      // Otherwise add the amount
      return sum + amount;
    }, 0).toFixed(2);
  }

  function calculateTotalPayable(items) {
    return items.reduce((sum, transaction) => {
      const sheepGoatCost = parseFloat(transaction.sheepGoatCost) || 0;
      const generalProductsCost = parseFloat(transaction.generalProductsCost) || 0;
      return sum + sheepGoatCost + generalProductsCost;
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

 
  const addexpense = () => {
    let url = "https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/MesobFinancial/expense?debit=5&credit=5"
  }

  const handleAddExpense = (expense) => {
    console.log('New expense:', expense);
    // Here you would typically update your state or send data to your backend
  };

//   const TransactionTable = ({  }) => {   
//     return (
//       <div className="table-container">
//         <table className="transaction-table">
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Sr. Number</th>
//               <th>Transaction</th>
//               <th>Debit</th>
//               <th>Credit</th>
//             </tr>
//           </thead>
//           <tbody>
//            {items?.map((transaction, index) => (
//   <tr key={index}>
//     <td>{transaction.date}</td>
//     <td>{transaction.id}</td>
//     <td>
//       <tr>Cash</tr>
//       {transaction?.generalProductsCost && transaction?.generalProductsCost !== '0.00' && <tr>Payable to general provider</tr>}
//       {transaction?.sheepGoatCost && transaction?.sheepGoatCost !== '0.00' && <tr>Payable to sheep provider</tr>}
//       <tr>Commission Revenue</tr>
//     </td>
//     <td className="debit">
//       <tr>{transaction.totalCost}$</tr>
//       {transaction?.sheepGoatCost && transaction?.sheepGoatCost !== '0.00' && <tr>-</tr>}
//       {transaction?.generalProductsCost && transaction?.generalProductsCost !== '0.00' && <tr>-</tr>}
//       {'-'}
//     </td>
//     <td className="credit">
//       <tr>-</tr>
//       {transaction?.generalProductsCost && transaction?.generalProductsCost !== '0.00' && <tr>{transaction.generalProductsCost}$</tr>}
//       {transaction?.sheepGoatCost && transaction?.sheepGoatCost !== '0.00' && <tr>{transaction.sheepGoatCost}$</tr>}
//       <tr>
//         {(() => {
//           const sheepGoatCost = parseFloat(transaction?.sheepGoatCost || 0);
//           const generalProductsCost = parseFloat(transaction?.generalProductsCost || 0);
//           const totalCost = parseFloat(transaction?.totalCost || 0);
//           const result = (sheepGoatCost + generalProductsCost - totalCost).toFixed(2);
//           return `${Math.abs(parseFloat(result)).toFixed(2)}$`;
//         })()}
//       </tr>
//     </td>
//   </tr>
// ))}
//           </tbody>
//           <thead>
           
//           </thead>
//         </table>
//         <div style={{width:'100%', padding:20, justifyContent:'center'}}>
//           <AddExpenseButton  onAddExpense={handleAddExpense} />
//             </div>
//       </div>
//     );
//   };

// const TransactionTable = ({ }) => {
//   // Sort the transactions array
//   const sortedTransactions = [...items].sort((a, b) => {
//     return (a.type || 0) - (b.type || 0);
//   });

//   return (
//     <div className="table-container">
//       <table className="transaction-table">
//         <thead>
//           <tr>
//             <th>Date</th>
//             <th>Sr. Number</th>
//             <th>Transaction</th>
//             <th>Debit</th>
//             <th>Credit</th>
//             <th>Type</th>
//           </tr>
//         </thead>
//         <tbody>
//           {sortedTransactions.map((transaction, index) => (
//             <tr key={index}>
//               <td>{transaction.date}</td>
//               <td>{transaction.id}</td>
//               <td>
//                 <tr>Cash</tr>
//                 {transaction?.generalProductsCost && transaction?.generalProductsCost !== '0.00' && <tr>Payable to general provider</tr>}
//                 {transaction?.sheepGoatCost && transaction?.sheepGoatCost !== '0.00' && <tr>Payable to sheep provider</tr>}
//                 <tr>Commission Revenue</tr>
//               </td>
//               <td className="debit">
//                 <tr>{transaction.totalCost}$</tr>
//                 {transaction?.sheepGoatCost && transaction?.sheepGoatCost !== '0.00' && <tr>-</tr>}
//                 {transaction?.generalProductsCost && transaction?.generalProductsCost !== '0.00' && <tr>-</tr>}
//                 {'-'}
//               </td>
//               <td className="credit">
//                 <tr>-</tr>
//                 {transaction?.generalProductsCost && transaction?.generalProductsCost !== '0.00' && <tr>{transaction.generalProductsCost}$</tr>}
//                 {transaction?.sheepGoatCost && transaction?.sheepGoatCost !== '0.00' && <tr>{transaction.sheepGoatCost}$</tr>}
//                 <tr>
//                   {(() => {
//                     const sheepGoatCost = parseFloat(transaction?.sheepGoatCost || 0);
//                     const generalProductsCost = parseFloat(transaction?.generalProductsCost || 0);
//                     const totalCost = parseFloat(transaction?.totalCost || 0);
//                     const result = (sheepGoatCost + generalProductsCost - totalCost).toFixed(2);
//                     return `${Math.abs(parseFloat(result)).toFixed(2)}$`;
//                   })()}
//                 </tr>
//               </td>
//               <td>{transaction.type || 0}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div style={{width:'100%', padding:20, justifyContent:'center'}}>
//         <AddExpenseButton onAddExpense={handleAddExpense} />
//       </div>
//     </div>
//   );
// };

const TransactionTable = ({ }) => {
  // Sort the transactions array
  const sortedTransactions = [...items].sort((a, b) => {
    return (a.type || 0) - (b.type || 0);
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
              <td>{transaction.id}</td>
              {transaction.type === 1 ? (
                <td>
                  <div>{transaction.expensename || "Expense"}</div>
                  <div>Cash</div>
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
                <td className="credit">
                  <div>-</div>
                  <div>{transaction.credit}$</div>
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <CardTitle tag="h4">Mesob Financial Report</CardTitle>
                  
                  <Button
                    color="secondary"
                    className="btn-round"
                    onClick={handleViewEmails}
                    disabled={selectedUsers.length === 0}
                  >
                    Send Email to Selected Emails
                  </Button>
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
           <TransactionTable transactions={items} />
           <div style={{margin:25}}>
           <p>Total Cash on hand = {calculateTotalCashOnHand(items)}$</p>
          <p>Total Payable (Unpaid) = {calculateTotalPayable(items)}$</p>
          <p>Commission Revenue = {calculateCommissionRevenue(items)}$</p>
           </div>       
                </>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
               
                <IncomeStatement  items={items}  />

              </CardHeader>
          
            </Card>

            <Card>
              <CardHeader>
              <BalanceSheet items={items}/>
              </CardHeader>
            </Card>
          </Col>
        </Row>
      </div>

      
    </>
  );
}

export default MesobFinancial;
