import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const ShippingAddressForm = ({ shippingAddress, handleShippingChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Adresse de livraison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="shipping-firstName">Prénom</Label>
            <Input
              id="shipping-firstName"
              name="firstName"
              value={shippingAddress.firstName}
              onChange={handleShippingChange}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="shipping-lastName">Nom</Label>
            <Input
              id="shipping-lastName"
              name="lastName"
              value={shippingAddress.lastName}
              onChange={handleShippingChange}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="shipping-email">Email</Label>
            <Input
              id="shipping-email"
              name="email"
              type="email"
              value={shippingAddress.email}
              onChange={handleShippingChange}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="shipping-phone">Téléphone</Label>
            <Input
              id="shipping-phone"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleShippingChange}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="shipping-address1">Adresse</Label>
            <Input
              id="shipping-address1"
              name="address1"
              value={shippingAddress.address1}
              onChange={handleShippingChange}
              className="mt-1"
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="shipping-address2">Complément d'adresse (optionnel)</Label>
            <Input
              id="shipping-address2"
              name="address2"
              value={shippingAddress.address2}
              onChange={handleShippingChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="shipping-city">Ville</Label>
            <Input
              id="shipping-city"
              name="city"
              value={shippingAddress.city}
              onChange={handleShippingChange}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="shipping-postalCode">Code postal</Label>
            <Input
              id="shipping-postalCode"
              name="postalCode"
              value={shippingAddress.postalCode}
              onChange={handleShippingChange}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="shipping-country">Pays</Label>
            <Select
              value={shippingAddress.country}
              onValueChange={(value) => handleShippingChange({ target: { name: 'country', value } })}
            >
              <SelectTrigger id="shipping-country" className="mt-1">
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
      </CardContent>
    </Card>
  );
};

export default ShippingAddressForm;