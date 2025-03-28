import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const OrderSummary = ({ 
  cartItems, 
  subtotal, 
  shippingCost, 
  taxAmount, 
  orderTotal,
  termsAccepted,
  setTermsAccepted,
  handleSubmitOrder,
  isSubmitting,
  navigateToCart
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif de la commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Articles du panier */}
          <div className="space-y-4 mb-4">
            {Array.isArray(cartItems) && cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.product.images && item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">{(item.product.price * item.quantity).toFixed(2)} XAF</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Votre panier est vide</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Calculs des montants */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{subtotal.toFixed(2)} XAF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span>{shippingCost.toFixed(2)} XAF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA (20%)</span>
              <span>{taxAmount.toFixed(2)} XAF</span>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{orderTotal.toFixed(2)} XAF</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={setTermsAccepted}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              J'accepte les{" "}
              <Link to="/terms" className="text-primary hover:underline" target="_blank">
                conditions générales de vente
              </Link>
            </label>
          </div>

          <Button
            className="w-full mt-2"
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Traitement en cours...
              </>
            ) : (
              <>
                <LockKeyhole className="mr-2 h-4 w-4" />
                Payer {orderTotal.toFixed(2)} XAF
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground flex items-center justify-center w-full mt-2">
            <LockKeyhole className="h-3 w-3 mr-1" />
            Paiement 100% sécurisé
          </div>
        </CardFooter>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={navigateToCart}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour au panier
      </Button>
    </div>
  );
};

export default OrderSummary;