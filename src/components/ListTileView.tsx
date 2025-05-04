import * as React from "react";
import { Stack, Typography, IconButton, Divider, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import ListTile from "./ListTile";
import { List } from "../ApiContext";

interface ListTileViewProps {
  titleText: string;
  lists: List[];
  defaultCollapsed?: boolean;
}

// Styled IconButton with rotation animation
const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.short,
  }),
  "&.expanded": {
    transform: "rotate(180deg)",
  },
  "&.collapsed": {
    transform: "rotate(0deg)",
  },
}));

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
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        onClick={toggleCollapse}
        sx={{ cursor: "pointer" }}
      >
        <Typography variant="h5">
          {titleText} {isCollapsed ? `(${lists.length})` : null}
        </Typography>
        <Stack flexGrow={1} />
        <AnimatedIconButton
          className={isCollapsed ? "collapsed" : "expanded"}
        >
          <ExpandMoreIcon />
        </AnimatedIconButton>
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Collapse in={!isCollapsed}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {lists.map((list) => (
            <ListTile key={list.listId} list={list} />
          ))}
        </Stack>
      </Collapse>
    </Stack>
  );
}