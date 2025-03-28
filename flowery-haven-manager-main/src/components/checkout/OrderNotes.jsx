import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrderNotes = ({ notes, setNotes }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes de commande (optionnel)</CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          rows={3}
          className="w-full p-2 border rounded-md"
          placeholder="Instructions spéciales pour la livraison, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </CardContent>
    </Card>
  );
};

export default OrderNotes;