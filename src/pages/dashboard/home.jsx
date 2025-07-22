import React from "react";
import {
  Typography,
  Card,
  CardBody,
} from "@material-tailwind/react";
import {
  PhoneIcon,
  PrinterIcon,
  ComputerDesktopIcon,
  TvIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { StatsOverlayCard } from "@/widgets/cards/stats-overlay-card";
import { StatsOverlayCardReversed } from "@/widgets/cards/stats-overlay-card-reversed";

export function Home() {
  return (
    <>
      {/* Hero Section with Background Image */}
      <div className="relative mb-12 py-20 text-white bg-[url('/img/background-image.png')] bg-cover bg-center w-full">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-left">
            <Typography variant="h1" className="mb-6 font-black text-4xl lg:text-5xl drop-shadow-lg flex items-center gap-4">
              LINK - Leverans 
              <ChevronRightIcon className="h-8 w-8 lg:h-10 lg:w-10 inline" />
              INsikt
              <ChevronRightIcon className="h-8 w-8 lg:h-10 lg:w-10 inline" />
              Kontroll
            </Typography>
            <Typography className="text-xl leading-relaxed max-w-4xl opacity-95 drop-shadow-sm">
              LINK är navet där Team8 samlar allt som rör teknik, status och affärsvärde – från skrivare och telefoni till systemintegrationer och kundflöden. 
              En intelligent plattform som förenar alla våra system och ger dig fullständig kontroll över verksamheten.
            </Typography>
          </div>
        </div>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-blue-900/40 to-purple-900/50"></div>
      </div>

      <div className="px-6 max-w-7xl mx-auto">
        {/* Key Benefits - Alternating Layout */}
        <div className="mb-16">
        <Typography variant="h3" color="blue-gray" className="mb-12 text-center font-bold">
          Med LINK får du en tydlig överblick över:
        </Typography>
        
        <div className="space-y-16">
          {/* Benefit 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="bg-white bg-opacity-20 rounded-full p-4 mr-4">
                    <ChartBarIcon className="h-8 w-8" />
                  </div>
                  <Typography variant="h4" className="font-bold">
                    Pågående leveranser och ärenden
                  </Typography>
                </div>
                <Typography className="text-lg opacity-90">
                  Spåra alla leveranser och ärenden i realtid med detaljerad status och automatiska uppdateringar. 
                  Få notifikationer om kritiska förändringar och undvik förseningar innan de händer.
                </Typography>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-4">
              <div className="bg-blue-50 rounded-xl p-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">📦 Leveransspårning</Typography>
                <Typography className="text-blue-gray-600">Fullständig transparens från order till leverans</Typography>
              </div>
              <div className="bg-blue-50 rounded-xl p-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">🔔 Smart notifiering</Typography>
                <Typography className="text-blue-gray-600">Automatiska varningar vid avvikelser</Typography>
              </div>
            </div>
          </div>

          {/* Benefit 2 - Reversed */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="bg-white bg-opacity-20 rounded-full p-4 mr-4">
                    <BoltIcon className="h-8 w-8" />
                  </div>
                  <Typography variant="h4" className="font-bold">
                    Realtidsdata och AI-genererade insikter
                  </Typography>
                </div>
                <Typography className="text-lg opacity-90">
                  Avancerad dataanalys som identifierar mönster, förutsäger problem och föreslår optimeringar. 
                  AI-drivna insikter hjälper dig att fatta smartare affärsbeslut baserade på faktisk data.
                </Typography>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-4">
              <div className="bg-purple-50 rounded-xl p-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">🤖 AI-analys</Typography>
                <Typography className="text-blue-gray-600">Prediktiva modeller för bättre planering</Typography>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">📊 Intelligent rapportering</Typography>
                <Typography className="text-blue-gray-600">Automatiserade rapporter med handlingsrekommendationer</Typography>
              </div>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="bg-white bg-opacity-20 rounded-full p-4 mr-4">
                    <ShieldCheckIcon className="h-8 w-8" />
                  </div>
                  <Typography variant="h4" className="font-bold">
                    Systemstatus och resursutnyttjande
                  </Typography>
                </div>
                <Typography className="text-lg opacity-90">
                  Övervaka alla system och resurser från en central punkt. Få direkt insyn i prestanda, 
                  upptid och resursförbrukning för att säkerställa optimal drift och undvika störningar.
                </Typography>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-4">
              <div className="bg-green-50 rounded-xl p-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">⚡ Systemövervakning</Typography>
                <Typography className="text-blue-gray-600">24/7 övervakning av alla kritiska system</Typography>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">📈 Resursoptimering</Typography>
                <Typography className="text-blue-gray-600">Intelligent resursfördelning och kapacitetsplanering</Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Stats Section */}
      <div className="mb-48">
        <StatsOverlayCard 
          image="/img/kontorteam8.png"
          title="Varför välja Team8?"
          description="Med över 120 medarbetare fördelade över 18 kontor från norr till söder har vi den lokala närvaro och expertis som krävs för att leverera tekniska lösningar av högsta klass till företag i hela Sverige."
          buttonText="Kontakta oss"
          buttonColor="green"
        />
      </div>

      {/* Second Stats Section */}
      <div className="mb-48">
        <StatsOverlayCardReversed 
          image="/img/kontorteam8.png"
          title="Vårt expertområde"
          description="Som specialister inom teknik och IT-lösningar hjälper vi företag att digitalisera och effektivisera sina processer. Med vår djupa tekniska kunskap och branschexpertis levererar vi skräddarsydda lösningar."
          buttonText="Läs mer om oss"
          buttonColor="blue"
        />
      </div>

      {/* Business Areas - Modern Card Design */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <Typography variant="h3" color="blue-gray" className="mb-4 font-bold">
            Våra Affärsområden
          </Typography>
          <Typography className="text-lg text-blue-gray-600">
            LINK integrerar alla våra teknologiområden för maximal effektivitet
          </Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Telefoni */}
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <PhoneIcon className="h-16 w-16 mb-6 opacity-90" />
                <Typography variant="h5" className="mb-4 font-bold">
                  Telefoni
                </Typography>
                <Typography className="opacity-90 mb-4">
                  Avancerade telefonilösningar och kommunikationssystem för modern affärsverksamhet
                </Typography>
                <ul className="text-sm space-y-2 opacity-80">
                  <li>• VoIP-system</li>
                  <li>• Mobilintegration</li>
                  <li>• Samtalsanalys</li>
                </ul>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            </div>
          </div>

          {/* Print */}
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <PrinterIcon className="h-16 w-16 mb-6 opacity-90" />
                <Typography variant="h5" className="mb-4 font-bold">
                  Print
                </Typography>
                <Typography className="opacity-90 mb-4">
                  Kompletta skrivarlösningar och dokumenthanteringssystem för all affärstryck
                </Typography>
                <ul className="text-sm space-y-2 opacity-80">
                  <li>• Multifunktionsskrivare</li>
                  <li>• Dokumentflöden</li>
                  <li>• Kostnadsuppföljning</li>
                </ul>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            </div>
          </div>

          {/* Microsoft */}
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <CloudIcon className="h-16 w-16 mb-6 opacity-90" />
                <Typography variant="h5" className="mb-4 font-bold">
                  Microsoft
                </Typography>
                <Typography className="opacity-90 mb-4">
                  Microsoft-lösningar och molntjänster för modern och säker IT-infrastruktur
                </Typography>
                <ul className="text-sm space-y-2 opacity-80">
                  <li>• Microsoft 365</li>
                  <li>• Azure Cloud</li>
                  <li>• Säkerhetslösningar</li>
                </ul>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            </div>
          </div>

          {/* AV/Digital Skyltning */}
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <TvIcon className="h-16 w-16 mb-6 opacity-90" />
                <Typography variant="h5" className="mb-4 font-bold">
                  AV/Digital Skyltning
                </Typography>
                <Typography className="opacity-90 mb-4">
                  Audiovisuella lösningar och digital skyltning för effektiv kommunikation
                </Typography>
                <ul className="text-sm space-y-2 opacity-80">
                  <li>• Digital signage</li>
                  <li>• Konferensrum AV</li>
                  <li>• Interaktiva displayer</li>
                </ul>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      </div>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 p-12 text-center text-white w-full">
        <Typography variant="h3" className="mb-6 font-bold">
          Redo att ta kontrollen?
        </Typography>
        <div className="max-w-7xl mx-auto px-6">
          <Typography className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
          LINK förenar alla dina affärsprocesser i ett intelligent ekosystem. 
          Agera snabbare, fatta smartare beslut och ligga steget före konkurrensen.
        </Typography>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 opacity-70" />
            <span>Realtidsdata 24/7</span>
          </div>
          <div className="flex items-center">
            <BoltIcon className="h-5 w-5 mr-2 opacity-70" />
            <span>AI-driven optimering</span>
          </div>
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 opacity-70" />
            <span>Säker och skalbar</span>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default Home;
