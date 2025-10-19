// frontend/InsightsDisplay.js
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";

function InsightsDisplay({ insights }) {
  if (!insights || insights.length === 0) return null;
  return (
    <Box mt={3} bgcolor="#f4f9f6" p={2} borderRadius={2}>
      <Typography variant="subtitle1" color="success.main" gutterBottom>Insights</Typography>
      <Divider sx={{ mb: 1 }} />
      <List>
        {insights.map((insight, idx) => (<ListItem key={idx}>{insight}</ListItem>))}
      </List>
    </Box>
  );
}

export default InsightsDisplay;
