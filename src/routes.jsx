import {
  QrCodeIcon,
} from "@heroicons/react/24/solid";
import { Scantovitec } from "@/pages/dashboard";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <QrCodeIcon {...icon} />,
        name: "scantovitec",
        path: "/scantovitec",
        element: <Scantovitec />,
        showInNav: false,
      },
    ],
  },
];

export default routes;
