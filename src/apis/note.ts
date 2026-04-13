"use server5";
interface INotePOST {
  chatId: string;
  block: string;
}
export const NotePOST = async ({ chatId, block }: INotePOST) => {
  console.log(
    { chatId, block },
    "from note server action aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAA"
  );
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
    console.log(
      note,
      "from note get action AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaaaaaaaaaaaaaaaa"
    );
    return note;
  } catch (e) {
    console.error("Error while Getting Note", { e });
    throw new Error("Failed to Get Note");
  }
};
