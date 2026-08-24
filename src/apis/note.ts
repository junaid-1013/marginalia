interface INotePOST {
  chatId: string;
  block: string;
}
export const NotePOST = async ({ chatId, block }: INotePOST) => {
  try {
    const response = await fetch("/api/note", {
      method: "POST",
      body: JSON.stringify({ chatId, block }),
    });
    if (!response.ok) {
      throw new Error("Failed to Save Note");
    }
    const note = await response.json();
    return note;
  } catch (e) {
    console.error("Error while Saving Note", { e });
    throw new Error("Failed to Save Note");
  }
};

export const NoteGET = async ({ queryKey }: any) => {
  const [_, id] = queryKey;
  try {
    const response = await fetch(`/api/note?chatId=${id}`);
    if (!response.ok) {
      throw new Error("Failed to Get Note");
    }
    const note = await response.json();
    return note;
  } catch (e) {
    console.error("Error while Getting Note", { e });
    throw new Error("Failed to Get Note");
  }
};
