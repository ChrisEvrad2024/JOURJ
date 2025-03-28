import React from 'react';
import { Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const BillingAddressForm = ({ 
  billingAddress, 
  handleBillingChange, 
  sameAsBilling, 
  setSameAsBilling 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Adresse de facturation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="same-address"
            checked={sameAsBilling}
            onCheckedChange={setSameAsBilling}
          />
          <label
            htmlFor="same-address"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Identique à l'adresse de livraison
          </label>
        </div>

        {!sameAsBilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="billing-firstName">Prénom</Label>
              <Input
                id="billing-firstName"
                name="firstName"
                value={billingAddress.firstName}
                onChange={handleBillingChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="billing-lastName">Nom</Label>
              <Input
                id="billing-lastName"
                name="lastName"
                value={billingAddress.lastName}
                onChange={handleBillingChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="billing-email">Email</Label>
              <Input
                id="billing-email"
                name="email"
                type="email"
                value={billingAddress.email}
                onChange={handleBillingChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="billing-phone">Téléphone</Label>
              <Input
                id="billing-phone"
                name="phone"
                value={billingAddress.phone}
                onChange={handleBillingChange}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="billing-address1">Adresse</Label>
              <Input
                id="billing-address1"
                name="address1"
                value={billingAddress.address1}
                onChange={handleBillingChange}
                className="mt-1"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="billing-address2">Complément d'adresse (optionnel)</Label>
              <Input
                id="billing-address2"
                name="address2"
                value={billingAddress.address2}
                onChange={handleBillingChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="billing-city">Ville</Label>
              <Input
                id="billing-city"
                name="city"
                value={billingAddress.city}
                onChange={handleBillingChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="billing-postalCode">Code postal</Label>
              <Input
                id="billing-postalCode"
                name="postalCode"
                value={billingAddress.postalCode}
                onChange={handleBillingChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="billing-country">Pays</Label>
              <Select
                value={billingAddress.country}
                onValueChange={(value) => handleBillingChange({ target: { name: 'country', value } })}
              >
                <SelectTrigger id="billing-country" className="mt-1">
                  <SelectValue placeholder="Sélectionner un pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Belgique">Belgique</SelectItem>
                  <SelectItem value="Suisse">Suisse</SelectItem>
                  <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingAddressForm;