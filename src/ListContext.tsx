import * as React from "react";
import { useSession } from "./SessionContext";
import { v4 as uuidv4 } from "uuid";

export interface ListItem {
  itemId: string;
  order: number;
  content: string;
  isComplete: boolean;
}

export interface List {
  listId: string;
  name: string;
  owner: string;
  invitedUsers: string[];
  items: ListItem[];
}

export interface ListContextValue {
  list: List | null;
  setItemCompleted: (itemId: string) => void;
  setItemIncomplete: (itemId: string) => void;
  addItem: (content: string) => void;
  removeItem: (itemId: string) => void;
  editList: (name?: string, owner?: string) => void;
  addUser: (userId: string) => void;
  removeUser: (userId: string) => void;
  removeSelf: () => void;
  removeList: () => void
  loading: boolean;
  error: string | null;
}

export const ListContext = React.createContext<ListContextValue>({
  list: null,
  setItemCompleted: () => {},
  setItemIncomplete: () => {},
  addItem: () => {},
  removeItem: () => {},
  editList: () => {},
  addUser: () => {},
  removeUser: () => {},
  removeSelf: () => {},
  removeList: () => {},
  loading: true,
  error: null,
});

export function useList() {
  return React.useContext(ListContext);
}

const fetchListById = async (listId: string): Promise<List> => {
  console.log("Fetching list for listId:", listId);
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

  console.log("Mock promise done:", listId);
  const mockData: { [key: string]: List } = {
    "f34e3fa8-e0d9-4637-ab6d-b86b3a23c515": {
      listId: "f34e3fa8-e0d9-4637-ab6d-b86b3a23c515",
      name: "Demo list",
      owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
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
    "cd22c016-8b7e-405f-8201-f47718fac216": {
      listId: "cd22c016-8b7e-405f-8201-f47718fac216",
      name: "Demo list 2",
      owner: "0b9c903e-b190-453d-bd4f-553fe5ff6389",
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
  };

  if (mockData[listId]) {
    console.log("Returning data:", listId);
    return mockData[listId];
  } else {
    throw new Error(`List with ID ${listId} not found`);
  }
};

export function ListProvider({
  listId,
  children,
}: {
  listId: string;
  children: React.ReactNode;
}) {
  const [list, setList] = React.useState<List | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { session } = useSession();

  React.useEffect(() => {
    console.log("ListProvider useEffect triggered with listId:", listId);
    const loadList = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedList = await fetchListById(listId);
        setList(fetchedList);
        console.log("ListProvider useEffect completed for listId:", listId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load list");
      } finally {
        setLoading(false);
      }
    };

    loadList();
  }, [listId]);

  const setItemCompleted = (itemId: string) => {
    if (!list) return;
    setList({
      ...list,
      items: list.items.map((item) =>
        item.itemId === itemId ? { ...item, isComplete: true } : item
      ),
    });
  };

  const setItemIncomplete = (itemId: string) => {
    if (!list) return;
    setList({
      ...list,
      items: list.items.map((item) =>
        item.itemId === itemId ? { ...item, isComplete: false } : item
      ),
    });
  };

  const addItem = (content: string) => {
    if (!list) return;
    const newItem: ListItem = {
      itemId: uuidv4(),
      order: list.items.length + 1,
      content,
      isComplete: false,
    };
    setList({
      ...list,
      items: [...list.items, newItem],
    });
  };

  const removeItem = (itemId: string) => {
    if (!list) return;
    setList({
      ...list,
      items: list.items.filter((item) => item.itemId !== itemId),
    });
  };

  const editList = (name?: string, owner?: string) => {
    if (!list || list.owner !== session?.user?.id) return;
    setList({
      ...list,
      name: name !== undefined ? name : list.name,
      owner: owner !== undefined ? owner : list.owner, // Trnasfers ownership to another uid
    });
  };

  const addUser = (userId: string) => {
    if (!list || list.owner !== session?.user?.id) return;
    if (list.invitedUsers.includes(userId)) return;
    setList({
      ...list,
      invitedUsers: [...list.invitedUsers, userId],
    });
  };

  const removeUser = (userId: string) => {
    if (!list || list.owner !== session?.user?.id) return;
    setList({
      ...list,
      invitedUsers: list.invitedUsers.filter((id) => id !== userId),
    });
  };

  const removeSelf = () => {
    if (!list || !session?.user?.id) return;
    if (list.owner === session.user.id) return;
    setList({
      ...list,
      invitedUsers: list.invitedUsers.filter((id) => id !== session?.user?.id),
    });
  };

  // Stub
  // Call API here
  const removeList = () => {};

  const value: ListContextValue = {
    list,
    setItemCompleted,
    setItemIncomplete,
    addItem,
    removeItem,
    editList,
    addUser,
    removeUser,
    removeSelf,
    removeList,
    loading,
    error,
  };

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}
