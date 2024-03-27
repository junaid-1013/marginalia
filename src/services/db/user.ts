import { db } from "@/lib/db";
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch {
    return null;
  }
};

export const geetUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch {
    return null;
  }
};

interface IProps {
  userId: string;
  name: string;
  pdfUrl: string;
}
