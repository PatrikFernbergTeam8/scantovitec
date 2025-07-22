import { chartsConfig } from "@/configs";

const websiteViewsChart = {
  type: "bar",
  height: 200,
  series: [
    {
      name: "Views",
      data: [200, 320, 285, 420, 499, 440, 570, 580, 640, 630, 730, 820],
    },
  ],
  options: {
    ...chartsConfig,
    colors: ["#388e3c"],
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
    },
  },
};

const dailySalesChart = {
  type: "line",
  height: 220,
  series: [
    {
      name: "Sales",
      data: [50, 40, 300, 320, 500, 350, 200, 230, 500],
    },
  ],
  options: {
    ...chartsConfig,
    colors: ["#0288d1"],
    stroke: {
      lineCap: "round",
    },
    markers: {
      size: 5,
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
  },
};

const completedTaskChart = {
  type: "line",
  height: 160,
  series: [
    {
      name: "Sales",
      data: [50, 40, 300, 320, 500, 350, 200, 230, 500],
    },
  ],
  options: {
    ...chartsConfig,
    colors: ["#388e3c"],
    stroke: {
      lineCap: "round",
    },
    markers: {
      size: 5,
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
  },
};
const completedTasksChart = {
  ...completedTaskChart,
  series: [
    {
      name: "Tasks",
      data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
    },
  ],
};

const activeInactivePieChart = {
  type: "donut",
  height: 200,
  series: [75],
  options: {
    chart: {
      type: "donut",
    },
    labels: ["Aktiv"],
    colors: ["#388e3c"],
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Aktiv",
              formatter: function () {
                return "75%";
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        gradientToColors: ["#66bb6a"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        }
      }
    }]
  },
};

const secondProgressChart = {
  type: "donut",
  height: 200,
  series: [60],
  options: {
    chart: {
      type: "donut",
    },
    labels: ["Effektivitet"],
    colors: ["#0288d1"],
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Effektivitet",
              formatter: function () {
                return "60%";
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        gradientToColors: ["#42a5f5"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        }
      }
    }]
  },
};

// Office locations data
export const officeLocationsData = [
  { kontor: "Stockholm HQ", ort: "Stockholm", anställda: 45, status: "Aktiv" },
  { kontor: "Göteborg", ort: "Göteborg", anställda: 28, status: "Aktiv" },
  { kontor: "Malmö", ort: "Malmö", anställda: 22, status: "Aktiv" },
  { kontor: "Uppsala", ort: "Uppsala", anställda: 15, status: "Inaktiv" },
  { kontor: "Linköping", ort: "Linköping", anställda: 18, status: "Aktiv" },
  { kontor: "Örebro", ort: "Örebro", anställda: 12, status: "Aktiv" },
  { kontor: "Västerås", ort: "Västerås", anställda: 20, status: "Aktiv" },
  { kontor: "Norrköping", ort: "Norrköping", anställda: 16, status: "Aktiv" },
  { kontor: "Helsingborg", ort: "Helsingborg", anställda: 14, status: "Inaktiv" },
  { kontor: "Jönköping", ort: "Jönköping", anställda: 11, status: "Aktiv" },
  { kontor: "Lund", ort: "Lund", anställda: 19, status: "Aktiv" },
  { kontor: "Umeå", ort: "Umeå", anställda: 13, status: "Aktiv" },
  { kontor: "Gävle", ort: "Gävle", anställda: 8, status: "Inaktiv" },
  { kontor: "Borås", ort: "Borås", anställda: 10, status: "Aktiv" },
  { kontor: "Eskilstuna", ort: "Eskilstuna", anställda: 9, status: "Aktiv" },
];

export const statisticsChartsData = [
  {
    color: "white",
    title: "Website View",
    description: "Last Campaign Performance",
    chart: websiteViewsChart,
  },
  {
    color: "white",
    title: "Kontor & Orter",
    description: "Översikt av lokationer",
    type: "table",
    data: officeLocationsData,
  },
  {
    color: "white",
    title: "Status",
    description: "Aktiv/Inaktiv fördelning",
    chart: activeInactivePieChart,
  },
  {
    color: "white",
    title: "Prestanda",
    description: "Effektivitetsmätning",
    chart: secondProgressChart,
  },
];

export default statisticsChartsData;
