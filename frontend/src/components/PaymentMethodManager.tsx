import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useEffect, useState } from "react";

interface Props {
  userId: string;
  onUpdate?: () => void;
}

interface PaymentMethod {
  id: string;
  type: string;
  last_four: string;
  expiry_date?: string;
  is_default: boolean;
}

export function PaymentMethodManager({ userId, onUpdate }: Props) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [addingCard, setAddingCard] = useState(false);

  const loadPaymentMethods = async () => {
    try {
      const response = await brain.get_payment_methods({ userId });
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Error loading payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [userId]);

  const handleAddCard = async () => {
    try {
      setAddingCard(true);

      // Basic validation
      if (cardNumber.length < 16) {
        throw new Error("Invalid card number");
      }

      const last_four = cardNumber.slice(-4);

      await brain.add_payment_method({
        userId,
        payment_type: "credit_card",
        last_four,
        expiry_date: expiryDate,
      });

      toast({
        title: "Success",
        description: "Payment method added successfully",
      });

      setAddDialogOpen(false);
      setCardNumber("");
      setExpiryDate("");
      loadPaymentMethods();
      onUpdate?.();
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setAddingCard(false);
    }
  };

  const handleRemoveCard = async (paymentMethodId: string) => {
    try {
      await brain.detach_payment_method({ paymentMethodId });
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
      loadPaymentMethods();
      onUpdate?.();
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading payment methods...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Payment Methods</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Payment Method</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Add a new credit card to your account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  type="text"
                  placeholder="**** **** **** ****"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={16}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCard} disabled={addingCard}>
                {addingCard ? "Adding..." : "Add Card"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <CardHeader>
              <CardTitle>Credit Card</CardTitle>
              <CardDescription>
                {method.is_default && "(Default)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>**** **** **** {method.last_four}</p>
              {method.expiry_date && (
                <p className="text-sm text-muted-foreground">
                  Expires: {method.expiry_date}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                onClick={() => handleRemoveCard(method.id)}
              >
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No payment methods added yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
