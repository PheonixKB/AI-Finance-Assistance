// frontend/src/PermissionToggle.js
import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const categories = [
  { key: "assets", label: "Assets" },
  { key: "liabilities", label: "Liabilities" },
  { key: "transactions", label: "Transactions" },
  { key: "investments", label: "Investments" },
  { key: "epf", label: "EPF" },
  { key: "creditScore", label: "Credit Score" }
];

function PermissionToggle({ permissions, onChange }) {
  const handleToggle = (key) => onChange({ ...permissions, [key]: !permissions[key] });
  return (
    <Box mt={2} mb={2}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Data Permissions</Typography>
      <FormGroup row>
        {categories.map(cat => (
          <FormControlLabel
            key={cat.key}
            control={<Switch checked={!!permissions[cat.key]} onChange={() => handleToggle(cat.key)} color="primary" />}
            label={cat.label}
            sx={{ mr: 2 }}
          />
        ))}
      </FormGroup>
    </Box>
  );
}

export default PermissionToggle;
