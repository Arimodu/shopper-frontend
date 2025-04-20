import * as React from "react";
import { List } from "./ListContext";
import { useSession } from "./SessionContext";
import { v4 as uuidv4 } from "uuid";

export interface ListsContextValue {
  lists: List[];
  addList: () => string;
  removeList: (listId: string) => void;
  updateList: (listId: string, updater: (list: List) => List) => void;
  loading: boolean;
  error: string | null;
}

export const ListsContext = React.createContext<ListsContextValue>({
  lists: [],
  addList: () => "",
  removeList: () => {},
  updateList: () => {},
  loading: true,
  error: null,
});

export function useLists() {
  return React.useContext(ListsContext);
}

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = React.useState<List[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { session } = useSession();

  React.useEffect(() => {
    const loadLists = async () => {
      if (!session?.user?.id) {
        setLists([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedLists = await fetchAllLists();
        setLists(fetchedLists);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lists");
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, [session?.user?.id]);

  const addList = () => {
    // TODO: API call here will securely create the list. 
    // Note: This will probably need to be asyncified
    const listId = uuidv4();
    const newList: List = {
      listId: listId,
      name: "New List",
      owner: session!.user!.id!,
      archived: false,
      invitedUsers: [],
      items: [],
    };
    setLists((prevLists) => [...prevLists, newList]);

    return listId;
  };

  const removeList = (listId: string) => {
    setLists((prevLists) => prevLists.filter((list) => list.listId !== listId));
  };

  const updateList = (listId: string, updater: (list: List) => List) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.listId === listId ? updater(list) : list
      )
    );
  };

  const value: ListsContextValue = {
    lists,
    addList,
    removeList,
    updateList,
    loading,
    error,
  };

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

const mockData: List[] = [
  // List 1: Owned by user, not archived, multiple items, some completed
  {
    listId: uuidv4(),
    name: "Demo List 1",
    owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    archived: false,
    invitedUsers: [
      "500cb652-c4cc-4c51-8c40-d1525d0c3926",
      "209fa1ea-e5fa-4b89-83e4-0a3f0d4b7553",
    ],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: false },
      { itemId: uuidv4(), order: 2, content: "Demo Item 2", isComplete: true },
      { itemId: uuidv4(), order: 3, content: "Demo Item 3", isComplete: false },
      { itemId: uuidv4(), order: 4, content: "Demo Item 4", isComplete: true },
    ],
  },
  // List 2: Invited user, not archived, few items
  {
    listId: uuidv4(),
    name: "Demo List 2",
    owner: "0b9c903e-b190-453d-bd4f-553fe5ff6389",
    archived: false,
    invitedUsers: ["5629aaef-1a1e-4430-be02-9104cc7e5544"],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: false },
      { itemId: uuidv4(), order: 2, content: "Demo Item 2", isComplete: false },
    ],
  },
  // List 3: Owned by user, archived, empty list
  {
    listId: uuidv4(),
    name: "Demo List 3",
    owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    archived: true,
    invitedUsers: [],
    items: [],
  },
  // List 4: Invited user, archived, many items, all completed
  {
    listId: uuidv4(),
    name: "Demo List 4",
    owner: "209fa1ea-e5fa-4b89-83e4-0a3f0d4b7553",
    archived: true,
    invitedUsers: [
      "5629aaef-1a1e-4430-be02-9104cc7e5544",
      "500cb652-c4cc-4c51-8c40-d1525d0c3926",
    ],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: true },
      { itemId: uuidv4(), order: 2, content: "Demo Item 2", isComplete: true },
      { itemId: uuidv4(), order: 3, content: "Demo Item 3", isComplete: true },
      { itemId: uuidv4(), order: 4, content: "Demo Item 4", isComplete: true },
      { itemId: uuidv4(), order: 5, content: "Demo Item 5", isComplete: true },
    ],
  },
  // List 5: Owned by user, not archived, single item
  {
    listId: uuidv4(),
    name: "Demo List 5",
    owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    archived: false,
    invitedUsers: ["0b9c903e-b190-453d-bd4f-553fe5ff6389"],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: false },
    ],
  },
  // List 6: Invited user, not archived, no items, multiple invited users
  {
    listId: uuidv4(),
    name: "Demo List 6",
    owner: "500cb652-c4cc-4c51-8c40-d1525d0c3926",
    archived: false,
    invitedUsers: [
      "5629aaef-1a1e-4430-be02-9104cc7e5544",
      "209fa1ea-e5fa-4b89-83e4-0a3f0d4b7553",
      "0b9c903e-b190-453d-bd4f-553fe5ff6389",
    ],
    items: [],
  },
  // List 7: Owned by user, archived, many items, mixed completion
  {
    listId: uuidv4(),
    name: "Demo List 7",
    owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    archived: true,
    invitedUsers: ["209fa1ea-e5fa-4b89-83e4-0a3f0d4b7553"],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: false },
      { itemId: uuidv4(), order: 2, content: "Demo Item 2", isComplete: true },
      { itemId: uuidv4(), order: 3, content: "Demo Item 3", isComplete: false },
      { itemId: uuidv4(), order: 4, content: "Demo Item 4", isComplete: true },
      { itemId: uuidv4(), order: 5, content: "Demo Item 5", isComplete: false },
      { itemId: uuidv4(), order: 6, content: "Demo Item 6", isComplete: true },
    ],
  },
  // List 8: Invited user, not archived, single completed item
  {
    listId: uuidv4(),
    name: "Demo List 8",
    owner: "0b9c903e-b190-453d-bd4f-553fe5ff6389",
    archived: false,
    invitedUsers: ["5629aaef-1a1e-4430-be02-9104cc7e5544"],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: true },
    ],
  },
];

export const fetchAllLists = async (): Promise<List[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000 * Math.random()));
  return mockData;
};