import { Stack, Typography } from "@mui/material";
import ListTile from "./ListTile";
import { List } from "../ListContext";

interface ListTileViewProps {
  titleText: string;
  lists: List[];
}

export default function ListTileView({ titleText, lists }: ListTileViewProps) {
  return (
    <Stack>
      <Typography variant="h4">{titleText}</Typography>
      <line />
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {lists.map((list) => (
          <ListTile key={list.listId} list={list} />
        ))}
      </Stack>
    </Stack>
  );
}
