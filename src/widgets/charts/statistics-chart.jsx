import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";

export function StatisticsChart({ color, chart, title, description, footer }) {
  return (
    <Card className="shadow-lg shadow-gray-500/40 border-0 bg-white h-full flex flex-col drop-shadow-lg">
      <CardBody className="px-[2%] py-[1%] sm:px-[2.2%] sm:py-[1.1%] md:px-[2.5%] md:py-[1.2%] pb-0">
        <Typography variant="h6" color="blue-gray" className="text-[calc(0.8rem+0.3vw)]">
          {title}
        </Typography>
        <Typography variant="small" className="font-normal text-blue-gray-600 text-[calc(0.7rem+0.2vw)]">
          {description}
        </Typography>
      </CardBody>
      <CardHeader variant="filled" color="transparent" floated={false} shadow={false} className="bg-transparent flex-1 pt-2 min-h-0" style={{ height: '100%' }}>
        <div className="w-full h-full" style={{ height: 'calc(100% - 0.5rem)' }}>
          <Chart {...chart} height="100%" />
        </div>
      </CardHeader>
      {footer && (
        <CardFooter className="px-[2.2%] py-[1.2%] sm:px-[2.5%] sm:py-[1.5%] md:px-[3%] md:py-[2%] bg-gray-50/30">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

StatisticsChart.defaultProps = {
  color: "blue",
  footer: null,
};

StatisticsChart.propTypes = {
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
  chart: PropTypes.object.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

StatisticsChart.displayName = "/src/widgets/charts/statistics-chart.jsx";

export default StatisticsChart;
