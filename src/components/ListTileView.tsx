import * as React from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ListTile from "./ListTile";
import { List } from "../ListContext";

interface ListTileViewProps {
  titleText: string;
  lists: List[];
  defaultCollapsed?: boolean;
}

export default function ListTileView({
  titleText,
  lists,
  defaultCollapsed = false,
}: ListTileViewProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h5">
          {titleText} {isCollapsed ? `(${lists.length})` : null}
        </Typography>
        <IconButton onClick={toggleCollapse}>
          {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Stack>
      <hr />
      {!isCollapsed && (
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {lists.map((list) => (
            <ListTile key={list.listId} list={list} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}