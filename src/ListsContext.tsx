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
  {
    listId: "f34e3fa8-e0d9-4637-ab6d-b86b3a23c515",
    name: "Demo list",
    owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    archived: false,
    invitedUsers: [
      "500cb652-c4cc-4c51-8c40-d1525d0c3926",
      "209fa1ea-e5fa-4b89-83e4-0a3f0d4b7553",
    ],
    items: [
      {
        itemId: "3e7a5f11-78a0-4bbd-b5fe-9cc69a9d366f",
        order: 1,
        content: "Demo Item 1",
        isComplete: false,
      },
      {
        itemId: "54cb273c-ad39-4774-97fc-9693f38c8f22",
        order: 2,
        content: "Demo Item 2",
        isComplete: true,
      },
      {
        itemId: "6f7bc5fb-7081-420d-9666-d5f8cf08d78f",
        order: 3,
        content: "Demo Item 3",
        isComplete: false,
      },
      {
        itemId: "781315b3-890e-4554-ad14-df875222d12a",
        order: 4,
        content: "Demo Item 4",
        isComplete: false,
      },
      {
        itemId: "461c5a5b-1026-4ad5-b7f1-49d13567b543",
        order: 5,
        content: "Demo Item 5",
        isComplete: false,
      },
      {
        itemId: "76f57106-041d-4693-a77e-bdfce66c1781",
        order: 6,
        content: "Demo Item 6",
        isComplete: false,
      },
    ],
  },
  {
    listId: "cd22c016-8b7e-405f-8201-f47718fac216",
    name: "Demo list 2",
    owner: "0b9c903e-b190-453d-bd4f-553fe5ff6389",
    archived: false,
    invitedUsers: ["5629aaef-1a1e-4430-be02-9104cc7e5544"],
    items: [
      {
        itemId: "07587801-0ede-4b5c-bae2-a1f4da19b36b",
        order: 1,
        content: "Demo Item 1",
        isComplete: false,
      },
      {
        itemId: "fae6a17f-da06-4702-bec7-d7629b77a11f",
        order: 2,
        content: "Demo Item 2",
        isComplete: false,
      },
    ],
  },
];

export const fetchAllLists = async (): Promise<List[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000 * Math.random()));
  return mockData;
};