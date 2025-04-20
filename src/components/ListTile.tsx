import { Paper, Stack, Typography, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router";
import { List as ListCtx } from "../ListContext";
import { useSession } from "../SessionContext";

interface ListTileProps {
  list: ListCtx;
}

export default function ListTile({ list }: ListTileProps) {
  const navigate = useNavigate();
  const { session } = useSession();

  const handleClick = () => {
    navigate(`/list/${list.listId}`);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width: 250,
        height: 250,
        borderRadius: 2,
        padding: 2,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onClick={handleClick}
    >
      <List dense sx={{ flexGrow: 1, overflow: "hidden" }}>
        {list.items.slice(0, 3).map((item) => (
          <ListItem key={item.itemId}>
            <ListItemText primary={item.content} />
          </ListItem>
        ))}
        {list.items.length > 3 && (
          <ListItem>
            <ListItemText primary={`... and ${list.items.length - 3} more`} />
          </ListItem>
        )}
      </List>
      <Paper 
      elevation={4}
      sx={{
        borderRadius: 2,
        padding: 1,
      }}>
        <Stack justifyContent="space-between" alignItems="Left">
            <Typography variant="subtitle2">{list.name}</Typography>
            <Typography variant="caption" color="textSecondary" noWrap>
            Owner: {list.owner == session?.user?.id ? "you" : list.owner}
            </Typography>
        </Stack>
      </Paper>
    </Paper>
  );
}