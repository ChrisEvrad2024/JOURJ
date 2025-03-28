import React from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Options de paiement
const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Carte bancaire',
    icon: <CreditCard className="w-4 h-4" />
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <CreditCard className="w-4 h-4" />
  }
];

const PaymentMethodForm = ({ selectedPayment, setSelectedPayment }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Mode de paiement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedPayment}
          onValueChange={setSelectedPayment}
          className="space-y-4"
        >
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between rounded-lg border p-4 transition-all ${selectedPayment === method.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
                }`}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                <Label
                  htmlFor={`payment-${method.id}`}
                  className="cursor-pointer"
                >
                  {method.name}
                </Label>
              </div>
              {method.icon}
            </div>
          ))}
        </RadioGroup>

        {selectedPayment === 'card' && (
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="card-number">Numéro de carte</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="card-expiry">Date d'expiration</Label>
                <Input
                  id="card-expiry"
                  placeholder="MM/AA"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="card-cvc">Code de sécurité (CVC)</Label>
                <Input
                  id="card-cvc"
                  placeholder="123"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="card-name">Nom sur la carte</Label>
              <Input
                id="card-name"
                placeholder="Jean Dupont"
                className="mt-1"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Exporter aussi les méthodes de paiement pour les rendre disponibles ailleurs
export { PAYMENT_METHODS };
export default PaymentMethodForm;