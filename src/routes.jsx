import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  QrCodeIcon,
  PrinterIcon,
} from "@heroicons/react/24/solid";
import { Home, Sida3 as Profile, Tables, Sida1 as Notifications, Sida2 as SkannaTillX } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "hem",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <PrinterIcon {...icon} />,
        name: "lagerstatus",
        path: "/tables",
        element: <Tables />,
      },
    ],
  },
  {
    title: "kommer snart",
    layout: "dashboard",
    pages: [
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "sida 1",
        path: "/sida-1",
        element: <Notifications />,
      },
      {
        icon: <QrCodeIcon {...icon} />,
        name: "sida 2",
        path: "/sida-2",
        element: <SkannaTillX />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "sida 3",
        path: "/sida-3",
        element: <Profile />,
      },
    ],
  },
  {
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
