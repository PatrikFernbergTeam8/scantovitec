import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import PropTypes from "prop-types";

export function StatisticsCard({ color, icon, title, value, footer }) {
  return (
    <Card className="shadow-lg shadow-gray-500/40 border-0 bg-white drop-shadow-lg">
      <CardBody className="p-[1rem] sm:p-[1.25rem] md:p-[1.5rem] text-left flex items-start gap-5">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 text-right">
          <Typography variant="small" className="font-normal text-blue-gray-600">
            {title}
          </Typography>
          <Typography variant="h4" color="blue-gray" className="sm:text-xl md:text-2xl">
            {typeof value === 'number' ? value.toLocaleString('sv-SE').replace(/,/g, ' ') : value}
          </Typography>
        </div>
      </CardBody>
      {footer && (
        <CardFooter className="p-[1rem] sm:p-[1.25rem] md:p-[1.5rem] bg-gray-50/30">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

StatisticsCard.defaultProps = {
  color: "blue",
  footer: null,
};

StatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "white",
    "blue-gray",
    "gray",
    "brown",
    "deep-orange",
    "orange",
    "amber",
    "yellow",
    "lime",
    "light-green",
    "green",
    "teal",
    "cyan",
    "light-blue",
    "blue",
    "indigo",
    "deep-purple",
    "purple",
    "pink",
    "red",
  ]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

StatisticsCard.displayName = "/src/widgets/cards/statistics-card.jsx";

export default StatisticsCard;
