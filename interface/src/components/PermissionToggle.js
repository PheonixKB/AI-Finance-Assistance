// interface/src/PermissionToggle.js
import { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { get, post } from "../apiService";

const categories = [
  { key: "assets", label: "Assets" },
  { key: "liabilities", label: "Liabilities" },
  { key: "transactions", label: "Transactions" },
  { key: "investments", label: "Investments" },
  { key: "epf", label: "EPF" },
  { key: "creditScore", label: "Credit Score" }
];

function PermissionToggle() {
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await get("/permissions/", localStorage.getItem("token"));
        setPermissions(data);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };
    fetchPermissions();
  }, []);

  const handleToggle = async (key) => {
    const newPermissions = { ...permissions, [key]: !permissions[key] };
    setPermissions(newPermissions);
    try {
      await post("/permissions/", newPermissions, localStorage.getItem("token"));
    } catch (error) {
      console.error("Error updating permissions:", error);
      // Optionally revert the state if the API call fails
      setPermissions(permissions);
    }
  };

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
