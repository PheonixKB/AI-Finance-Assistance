// interface/src/FinanceUploadForm.js
import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const FIELDS = [
  { key: "cash", label: "Cash", min: 0, max: 99999999, type: "number" },
  { key: "bank", label: "Bank", min: 0, max: 999999999, type: "number" },
  { key: "loans", label: "Loans", min: 0, max: 99999999, type: "number" },
  { key: "credit_card", label: "Credit Card", min: 0, max: 9999999, type: "number" },
  { key: "mutual_funds", label: "Mutual Funds", min: 0, max: 99999999, type: "number" },
  { key: "stocks", label: "Stocks", min: 0, max: 99999999, type: "number" },
  { key: "epf_balance", label: "EPF Balance", min: 0, max: 999999999, type: "number" },
  { key: "credit_score", label: "Credit Score", min: 300, max: 900, type: "number" },
];

function FinanceUploadForm({ onSubmitted }) {
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key, val) => {
    setValues({ ...values, [key]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/upload_finance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      onSubmitted();
      alert("Finance data uploaded!");
    } catch (err) {
      setError(err.message || "Upload failed");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" gap={2}>
        {FIELDS.map(f => (
          <TextField
            key={f.key}
            label={`${f.label} (${f.type}, ${f.min}–${f.max})`}
            type={f.type}
            inputProps={{ min: f.min, max: f.max, maxLength: String(f.max).length }}
            fullWidth
            required
            value={values[f.key] || ""}
            onChange={e => handleChange(f.key, e.target.value)}
          />
        ))}
        {error && <Box color="error.main" fontSize="small">{error}</Box>}
        <Button type="submit" disabled={submitting} variant="contained" fullWidth>
          {submitting ? "Uploading..." : "Submit"}
        </Button>
      </Box>
    </form>
  );
}

export default FinanceUploadForm;
