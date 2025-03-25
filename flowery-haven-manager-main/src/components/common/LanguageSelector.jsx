// src/components/common/LanguageSelector.jsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "../../hooks/useTranslation";
import { Globe } from "lucide-react";

const localeInfo = {
  'fr-FR': { name: 'Français', flag: '🇫🇷' },
  'en-US': { name: 'English', flag: '🇺🇸' },
  'es-ES': { name: 'Español', flag: '🇪🇸' },
  'de-DE': { name: 'Deutsch', flag: '🇩🇪' },
};

const LanguageSelector = () => {
  const { locale, changeLocale, supportedLocales } = useTranslation();
  
  const handleLanguageChange = async (newLocale) => {
    await changeLocale(newLocale);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex items-center gap-2 px-3">
          <Globe size={16} />
          <span className="hidden md:inline">{localeInfo[locale]?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLocales.map((localeCode) => (
          <DropdownMenuItem
            key={localeCode}
            onClick={() => handleLanguageChange(localeCode)}
            className={`gap-2 ${locale === localeCode ? 'font-medium bg-muted' : ''}`}
          >
            <span>{localeInfo[localeCode]?.flag}</span>
            <span>{localeInfo[localeCode]?.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;