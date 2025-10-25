import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function UploadPage({ onSubmitted }) {
  const [accounts, setAccounts] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [newAccount, setNewAccount] = useState({
    account_name: "",
    bank_name: "",
    account_number: "",
    bank_number: "",
    account_type: "",
    balance: 0,
  });
  const [newInvestment, setNewInvestment] = useState({
    investment_type: "",
    name: "",
    quantity: 0,
    purchase_price: 0,
    current_price: 0,
    purchase_date: "",
  });
  const [summaryFinance, setSummaryFinance] = useState({
    credit_score: "",
    epf_balance: "",
  });
  const [newTransaction, setNewTransaction] = useState({
    account_id: "",
    date: "",
    descr: "",
    amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAccount, setEditingAccount] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [openDeleteInvestmentDialog, setOpenDeleteInvestmentDialog] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      setError(err.message || "Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/investments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setInvestments(data);
    } catch (err) {
      setError(err.message || "Failed to fetch investments");
    }
  };

  const fetchSummaryFinance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/summary_finance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSummaryFinance(data);
    } catch (err) {
      setError(err.message || "Failed to fetch summary finance data");
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchInvestments();
    fetchSummaryFinance();
  }, []);

  const handleNewAccountChange = (e) => {
    const { name, value } = e.target;
    setNewAccount({ ...newAccount, [name]: value });
  };

  const handleNewAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAccount),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Account created successfully!");
      setNewAccount({ account_name: "", bank_name: "", account_number: "", bank_number: "", account_type: "", balance: 0 });
      fetchAccounts(); // Refresh accounts list
      onSubmitting();
    } catch (err) {
      setError(err.message || "Failed to create account");
    }
  };

  const handleEditAccountClick = (account) => {
    setEditingAccount({ ...account });
  };

  const handleEditAccountChange = (e) => {
    const { name, value } = e.target;
    setEditingAccount({ ...editingAccount, [name]: value });
  };

  const handleUpdateAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingAccount),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Account updated successfully!");
      setEditingAccount(null);
      fetchAccounts();
      onSubmitted();
    } catch (err) {
      setError(err.message || "Failed to update account");
    }
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setOpenDeleteDialog(false);
    if (!accountToDelete) return;

    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/accounts/${accountToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Account deleted successfully!");
      fetchAccounts();
      onSubmitted();
    } catch (err) {
      setError(err.message || "Failed to delete account");
    } finally {
      setAccountToDelete(null);
    }
  };

  const handleNewInvestmentChange = (e) => {
    const { name, value } = e.target;
    setNewInvestment({ ...newInvestment, [name]: value });
  };

  const handleNewInvestmentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newInvestment),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Investment created successfully!");
      setNewInvestment({ investment_type: "", name: "", quantity: 0, purchase_price: 0, current_price: 0, purchase_date: "" });
      fetchInvestments();
      onSubmitted();
    } catch (err) {
      setError(err.message || "Failed to create investment");
    }
  };

  const handleEditInvestmentClick = (investment) => {
    setEditingInvestment({ ...investment, purchase_date: investment.purchase_date ? new Date(investment.purchase_date).toISOString().split('T')[0] : '' });
  };

  const handleEditInvestmentChange = (e) => {
    const { name, value } = e.target;
    setEditingInvestment({ ...editingInvestment, [name]: value });
  };

  const handleUpdateInvestmentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/investments/${editingInvestment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingInvestment),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Investment updated successfully!");
      setEditingInvestment(null);
      fetchInvestments();
      onSubmitted();
    } catch (err) {
      setError(err.message || "Failed to update investment");
    }
  };

  const handleDeleteInvestmentClick = (investment) => {
    setInvestmentToDelete(investment);
    setOpenDeleteInvestmentDialog(true);
  };

  const handleDeleteInvestmentConfirm = async () => {
    setOpenDeleteInvestmentDialog(false);
    if (!investmentToDelete) return;

    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/investments/${investmentToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Investment deleted successfully!");
      fetchInvestments();
      onSubmitted();
    } catch (err) {
      setError(err.message || "Failed to delete investment");
    }
  };

  const handleSummaryFinanceChange = (e) => {
    const { name, value } = e.target;
    setSummaryFinance({ ...summaryFinance, [name]: value });
  };

  const handleSummaryFinanceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/summary_finance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(summaryFinance),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Summary finance data updated successfully!");
      fetchSummaryFinance();
      onSubmitted();
    } catch (err) {
      setError(err.message || "Failed to update summary finance data");
    }
  };

  const handleNewTransactionChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });
  };

  const handleNewTransactionSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTransaction),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Transaction added successfully!");
      setNewTransaction({ account_id: "", date: "", descr: "", amount: 0 });
      onSubmitted();
    } catch (err) {
      setError(err.message || "Failed to add transaction");
    }
  };

  if (loading) {
    return <Typography>Loading accounts and investments...</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, maxHeight: '80vh', overflowY: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Manage Your Financial Data
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Existing Accounts Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Your Accounts
      </Typography>
      <Grid container spacing={2}>
        {accounts.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No accounts found. Add a new one below!</Typography>
          </Grid>
        ) : (
          accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{account.account_name}</Typography>
                  <Typography color="text.secondary">Bank: {account.bank_name}</Typography>
                  <Typography color="text.secondary">Account No: {account.account_number || 'N/A'}</Typography>
                  <Typography color="text.secondary">Bank No: {account.bank_number || 'N/A'}</Typography>
                  <Typography color="text.secondary">Type: {account.account_type}</Typography>
                  <Typography variant="body1">Balance: ${account.balance.toFixed(2)}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <IconButton aria-label="edit" onClick={() => handleEditAccountClick(account)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => handleDeleteClick(account)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add New Account Form */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Add New Account
      </Typography>
      <Box
        component="form"
        onSubmit={handleNewAccountSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}
      >
        <TextField
          label="Account Name"
          name="account_name"
          value={newAccount.account_name}
          onChange={handleNewAccountChange}
          fullWidth
          required
          inputProps={{ maxLength: 255 }}
        />
        <TextField
          label="Bank Name"
          name="bank_name"
          value={newAccount.bank_name}
          onChange={handleNewAccountChange}
          fullWidth
          required
          inputProps={{ maxLength: 255 }}
        />
        <TextField
          label="Account Number"
          name="account_number"
          value={newAccount.account_number}
          onChange={handleNewAccountChange}
          fullWidth
          required
          inputProps={{ maxLength: 255 }}
        />
        <TextField
          label="Bank Number"
          name="bank_number"
          value={newAccount.bank_number}
          onChange={handleNewAccountChange}
          fullWidth
          required
          inputProps={{ maxLength: 255 }}
        />
        <FormControl fullWidth required>
          <InputLabel>Account Type</InputLabel>
          <Select
            name="account_type"
            value={newAccount.account_type}
            label="Account Type"
            onChange={handleNewAccountChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Savings">Savings</MenuItem>
            <MenuItem value="Checking">Checking</MenuItem>
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="Loan">Loan</MenuItem>
            <MenuItem value="Investment">Investment</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Balance"
          name="balance"
          type="number"
          value={newAccount.balance}
          onChange={handleNewAccountChange}
          fullWidth
          required
          inputProps={{ step: "0.01" }}
        />
        <Button type="submit" variant="contained">
          Add Account
        </Button>
      </Box>

      {/* Edit Account Dialog */}
      <Dialog open={!!editingAccount} onClose={() => setEditingAccount(null)}>
        <DialogTitle>Edit Account</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleUpdateAccountSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
          >
            <TextField
              label="Account Name"
              name="account_name"
              value={editingAccount?.account_name || ''}
              onChange={handleEditAccountChange}
              fullWidth
              required
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              label="Bank Name"
              name="bank_name"
              value={editingAccount?.bank_name || ''}
              onChange={handleEditAccountChange}
              fullWidth
              required
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              label="Account Number"
              name="account_number"
              value={editingAccount?.account_number || ''}
              onChange={handleEditAccountChange}
              fullWidth
              required
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              label="Bank Number"
              name="bank_number"
              value={editingAccount?.bank_number || ''}
              onChange={handleEditAccountChange}
              fullWidth
              required
              inputProps={{ maxLength: 255 }}
            />
            <FormControl fullWidth required>
              <InputLabel>Account Type</InputLabel>
              <Select
                name="account_type"
                value={editingAccount?.account_type || ''}
                label="Account Type"
                onChange={handleEditAccountChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Savings">Savings</MenuItem>
                <MenuItem value="Checking">Checking</MenuItem>
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Loan">Loan</MenuItem>
                <MenuItem value="Investment">Investment</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Balance"
              name="balance"
              type="number"
              value={editingAccount?.balance || 0}
              onChange={handleEditAccountChange}
              fullWidth
              required
              inputProps={{ step: "0.01" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingAccount(null)}>Cancel</Button>
          <Button onClick={handleUpdateAccountSubmit} variant="contained">Update Account</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Account Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the account "{accountToDelete?.account_name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Existing Investments Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Your Investments
      </Typography>
      <Grid container spacing={2}>
        {investments.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No investments found. Add a new one below!</Typography>
          </Grid>
        ) : (
          investments.map((investment) => (
            <Grid item xs={12} sm={6} md={4} key={investment.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{investment.name}</Typography>
                  <Typography color="text.secondary">Type: {investment.investment_type}</Typography>
                  <Typography color="text.secondary">Quantity: {investment.quantity}</Typography>
                  <Typography color="text.secondary">Purchase Price: ${investment.purchase_price.toFixed(2)}</Typography>
                  <Typography color="text.secondary">Current Price: ${investment.current_price ? investment.current_price.toFixed(2) : 'N/A'}</Typography>
                  <Typography color="text.secondary">Purchase Date: {investment.purchase_date}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <IconButton aria-label="edit" onClick={() => handleEditInvestmentClick(investment)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => handleDeleteInvestmentClick(investment)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add New Investment Form */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Add New Investment
      </Typography>
      <Box
        component="form"
        onSubmit={handleNewInvestmentSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}
      >
        <FormControl fullWidth required>
          <InputLabel>Investment Type</InputLabel>
          <Select
            name="investment_type"
            value={newInvestment.investment_type}
            label="Investment Type"
            onChange={handleNewInvestmentChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Stock">Stock</MenuItem>
            <MenuItem value="Mutual Fund">Mutual Fund</MenuItem>
            <MenuItem value="Bond">Bond</MenuItem>
            <MenuItem value="Real Estate">Real Estate</MenuItem>
            <MenuItem value="Cryptocurrency">Cryptocurrency</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Name (e.g., Company Name, Fund Name)"
          name="name"
          value={newInvestment.name}
          onChange={handleNewInvestmentChange}
          fullWidth
          required
          inputProps={{ maxLength: 255 }}
        />
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          value={newInvestment.quantity}
          onChange={handleNewInvestmentChange}
          fullWidth
          required
          inputProps={{ step: "0.0001" }}
        />
        <TextField
          label="Purchase Price per Unit"
          name="purchase_price"
          type="number"
          value={newInvestment.purchase_price}
          onChange={handleNewInvestmentChange}
          fullWidth
          required
          inputProps={{ step: "0.01" }}
        />
        <TextField
          label="Current Price per Unit (Optional)"
          name="current_price"
          type="number"
          value={newInvestment.current_price}
          onChange={handleNewInvestmentChange}
          fullWidth
          inputProps={{ step: "0.01" }}
        />
        <TextField
          label="Purchase Date (Optional)"
          name="purchase_date"
          type="date"
          value={newInvestment.purchase_date}
          onChange={handleNewInvestmentChange}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button type="submit" variant="contained">
          Add Investment
        </Button>
      </Box>

      {/* Edit Investment Dialog */}
      <Dialog open={!!editingInvestment} onClose={() => setEditingInvestment(null)}>
        <DialogTitle>Edit Investment</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleUpdateInvestmentSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
          >
            <FormControl fullWidth required>
              <InputLabel>Investment Type</InputLabel>
              <Select
                name="investment_type"
                value={editingInvestment?.investment_type || ''}
                label="Investment Type"
                onChange={handleEditInvestmentChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Stock">Stock</MenuItem>
                <MenuItem value="Mutual Fund">Mutual Fund</MenuItem>
                <MenuItem value="Bond">Bond</MenuItem>
                <MenuItem value="Real Estate">Real Estate</MenuItem>
                <MenuItem value="Cryptocurrency">Cryptocurrency</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Name (e.g., Company Name, Fund Name)"
              name="name"
              value={editingInvestment?.name || ''}
              onChange={handleEditInvestmentChange}
              fullWidth
              required
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={editingInvestment?.quantity || 0}
              onChange={handleEditInvestmentChange}
              fullWidth
              required
              inputProps={{ step: "0.0001" }}
            />
            <TextField
              label="Purchase Price per Unit"
              name="purchase_price"
              type="number"
              value={editingInvestment?.purchase_price || 0}
              onChange={handleEditInvestmentChange}
              fullWidth
              required
              inputProps={{ step: "0.01" }}
            />
            <TextField
              label="Current Price per Unit (Optional)"
              name="current_price"
              type="number"
              value={editingInvestment?.current_price || 0}
              onChange={handleEditInvestmentChange}
              fullWidth
              inputProps={{ step: "0.01" }}
            />
            <TextField
              label="Purchase Date (Optional)"
              name="purchase_date"
              type="date"
              value={editingInvestment?.purchase_date || ''}
              onChange={handleEditInvestmentChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingInvestment(null)}>Cancel</Button>
          <Button onClick={handleUpdateInvestmentSubmit} variant="contained">Update Investment</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Investment Confirmation Dialog */}
      <Dialog
        open={openDeleteInvestmentDialog}
        onClose={() => setOpenDeleteInvestmentDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Investment Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the investment "{investmentToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteInvestmentDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteInvestmentConfirm} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Other Financial Data Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Other Financial Data
      </Typography>
      <Box
        component="form"
        onSubmit={handleSummaryFinanceSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}
      >
        <TextField
          label="Credit Score"
          name="credit_score"
          type="number"
          value={summaryFinance.credit_score}
          onChange={handleSummaryFinanceChange}
          fullWidth
          inputProps={{ min: 300, max: 900 }}
        />
        <TextField
          label="EPF Balance"
          name="epf_balance"
          type="number"
          value={summaryFinance.epf_balance}
          onChange={handleSummaryFinanceChange}
          fullWidth
          inputProps={{ min: 0 }}
        />
        <Button type="submit" variant="contained">
          Update Other Data
        </Button>
      </Box>

      {/* Add New Transaction Form */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Add New Transaction
      </Typography>
      <Box
        component="form"
        onSubmit={handleNewTransactionSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}
      >
        <FormControl fullWidth required>
          <InputLabel>Select Account</InputLabel>
          <Select
            name="account_id"
            value={newTransaction.account_id}
            label="Select Account"
            onChange={handleNewTransactionChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.account_name} ({account.bank_name})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Date"
          name="date"
          type="date"
          value={newTransaction.date}
          onChange={handleNewTransactionChange}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Description"
          name="descr"
          value={newTransaction.descr}
          onChange={handleNewTransactionChange}
          fullWidth
          required
          inputProps={{ maxLength: 255 }}
        />
        <TextField
          label="Amount"
          name="amount"
          type="number"
          value={newTransaction.amount}
          onChange={handleNewTransactionChange}
          fullWidth
          required
          inputProps={{ step: "0.01" }}
        />
        <Button type="submit" variant="contained">
          Add Transaction
        </Button>
      </Box>
    </Box>
  );
}

export default UploadPage;
