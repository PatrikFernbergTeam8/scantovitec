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
      <CardBody className="p-[2%] sm:p-[2.2%] md:p-[2.5%] text-left flex items-start gap-[1.5%]">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 text-right">
          <Typography variant="small" className="font-normal text-blue-gray-600">
            {title}
          </Typography>
          <Typography variant="h4" color="blue-gray" className="text-[calc(0.9rem+0.3vw)] sm:text-[calc(1rem+0.4vw)] md:text-[calc(1.1rem+0.5vw)]">
            {(() => {
              const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
              return !isNaN(numValue) && isFinite(numValue) ? 
                Math.round(numValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : 
                value;
            })()}
          </Typography>
        </div>
      </CardBody>
      {footer && (
        <CardFooter className="p-[2%] sm:p-[2.2%] md:p-[2.5%] bg-gray-50/30">
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
