import { TooltipProvider } from "@/components/ui/tooltip";
import {
  BookIcon,
  LucidePenBox,
  FileTextIcon,
  ListTodoIcon,
  ListIcon,
  FileStackIcon,
  SquareGanttIcon,
} from "lucide-react";
import SideNavItem from "./side-item";

interface IProps {
  params: { id: string };
}
const SideNav: React.FC<IProps> = ({ params }) => {
  const sidebar_nav = [
    {
      title: "View Document",
      icon: <SquareGanttIcon size={24} />,
      link: `/documents/${params.id}/view`,
    },
    {
      title: "Take Notes",
      link: `/documents/${params.id}/note`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
      ),
    },
    {
      title: "Summary",
      link: `/documents/${params.id}/summary`,
      icon: <ListIcon size={24} />,
    },
    {
      title: "Flashcards",
      link: `/documents/${params.id}/flashcards`,
      icon: <FileStackIcon size={24} />,
    },
    {
      title: "Quiz",
      link: `/documents/${params.id}/quiz`,
      icon: <ListTodoIcon size={24} />,
    },
  ];
  return (
    <div className="border-r-muted border-r flex flex-col">
      <TooltipProvider>
        {sidebar_nav.map((nav, index) => (
          <SideNavItem key={index} nav={nav} />
        ))}
      </TooltipProvider>
    </div>
  );
};

export default SideNav;
