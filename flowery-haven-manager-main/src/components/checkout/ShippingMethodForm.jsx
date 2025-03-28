import React from 'react';
import { Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Options de livraison fictives
const SHIPPING_OPTIONS = [
  {
    id: 'standard',
    name: 'Livraison standard',
    price: 7.90,
    description: 'Livraison en 3-5 jours ouvrés',
    icon: <Truck className="w-4 h-4" />
  },
  {
    id: 'express',
    name: 'Livraison express',
    price: 14.90,
    description: 'Livraison en 1-2 jours ouvrés',
    icon: <Truck className="w-4 h-4" />
  }
];

const ShippingMethodForm = ({ selectedShipping, setSelectedShipping }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Mode de livraison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedShipping}
          onValueChange={setSelectedShipping}
          className="space-y-4"
        >
          {SHIPPING_OPTIONS.map((option) => (
            <div
              key={option.id}
              className={`flex items-center justify-between rounded-lg border p-4 transition-all ${selectedShipping === option.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
                }`}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={option.id} id={`shipping-${option.id}`} />
                <Label
                  htmlFor={`shipping-${option.id}`}
                  className="flex flex-col cursor-pointer"
                >
                  <span className="font-medium">{option.name}</span>
                  <span className="text-muted-foreground text-sm">{option.description}</span>
                </Label>
              </div>
              <div className="font-medium">{option.price.toFixed(2)} XAF</div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

// Exporter aussi les options de livraison pour les rendre disponibles ailleurs
export { SHIPPING_OPTIONS };
export default ShippingMethodForm;