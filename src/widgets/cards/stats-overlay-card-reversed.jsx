import React from "react";
import {
  Typography,
  Button,
} from "@material-tailwind/react";

export function StatsOverlayCardReversed({ 
  image = "/img/placeholder-office.jpg",
  title = "Om Team8",
  description = "Vi är ett ledande teknikföretag som specialiserar oss på att leverera innovativa lösningar för moderna företag. Vårt fokus ligger på att skapa värde genom teknologi.",
  buttonText = "Läs mer",
  buttonColor = "blue"
}) {
  return (
    <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
      {/* Höger sektion - Bild med överliggande statistik */}
      <div className="relative lg:w-2/3 w-full">
        {/* Huvudbild */}
        <div className="relative rounded-2xl overflow-hidden">
          <img 
            src={image}
            alt="Team8 kontor"
            className="w-full h-80 lg:h-96 object-cover"
          />
        </div>
        
        {/* Överliggande statistik-element */}
        <div className="absolute -bottom-32 -left-96 bg-green-800 rounded-2xl py-8 px-16 shadow-xl">
          <div className="flex gap-20">
            {/* Första statistik-sektion */}
            <div className="text-white text-center">
              <Typography variant="h6" className="mb-2 opacity-90 font-medium">
                Antal anställda
              </Typography>
              <Typography variant="h1" className="mb-2 font-bold text-6xl lg:text-7xl">
                120
              </Typography>
              <Typography variant="h6" className="opacity-90">
                Över hela Sverige
              </Typography>
            </div>
            
            {/* Andra statistik-sektion */}
            <div className="text-white text-center border-l border-white/30 pl-20">
              <Typography variant="h6" className="mb-2 opacity-90 font-medium">
                Antal kontor
              </Typography>
              <Typography variant="h1" className="mb-2 font-bold text-6xl lg:text-7xl">
                18
              </Typography>
              <Typography variant="h6" className="opacity-90">
                Från norr till söder
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Vänster sektion - Textblock */}
      <div className="lg:w-1/3 w-full">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <Typography variant="h4" color="blue-gray" className="mb-4 font-bold">
            {title}
          </Typography>
          <Typography className="text-blue-gray-600 mb-6 leading-relaxed">
            {description}
          </Typography>
          <Button 
            color={buttonColor}
            size="lg"
            className="w-full lg:w-auto"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StatsOverlayCardReversed;