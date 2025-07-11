
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const creditPackages = [
  { id: 'pkg-1', credits: 100, price: 20, popular: false },
  { id: 'pkg-2', credits: 500, price: 80, popular: true },
  { id: 'pkg-3', credits: 1000, price: 150, popular: false },
];

const paymentMethods = [
  { id: 'credit-card', name: 'Credit Card', icon: <CreditCard className="w-6 h-6 text-muted-foreground" /> },
  { id: 'debit-card', name: 'Debit Card', icon: <CreditCard className="w-6 h-6 text-muted-foreground" /> },
  { id: 'paypal', name: 'PayPal', icon: <p className="font-bold w-6 text-center text-foreground">P</p> },
];

function PurchaseCreditsContent() {
  const [selectedPackage, setSelectedPackage] = useState(creditPackages[1].id);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handlePurchase = () => {
      if (!selectedPackage || !selectedPayment) {
          toast({
              variant: "destructive",
              title: "Selection missing",
              description: "Please select a credit package and a payment method.",
          });
          return;
      }
      
      const params = new URLSearchParams();
      params.set('packageId', selectedPackage);

      const redirectUrl = searchParams.get('redirect');
      const chatWith = searchParams.get('chatWith');

      if (redirectUrl) {
        params.set('redirect', redirectUrl);
      }
      if (chatWith) {
        params.set('chatWith', chatWith);
      }
      
      const queryString = `?${params.toString()}`;

      switch (selectedPayment) {
          case 'credit-card':
          case 'debit-card':
          case 'paypal':
              router.push(`/purchase-credits/paypal${queryString}`);
              break;
          default:
               toast({
                variant: "destructive",
                title: "Invalid Payment Method",
                description: "Please select a valid payment method.",
              });
      }
  };
  
  return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl text-primary">Purchase Credits</h1>
          <p className="text-muted-foreground mt-2">
            Choose a package that suits your needs and continue connecting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Side: Packages */}
          <Card>
              <CardHeader>
                  <CardTitle>Select a Package</CardTitle>
              </CardHeader>
              <CardContent>
                  <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage} className="space-y-4">
                      {creditPackages.map((pkg) => (
                      <Label
                          key={pkg.id}
                          htmlFor={pkg.id}
                          className={cn(
                              "flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                              selectedPackage === pkg.id && "bg-muted border-primary ring-2 ring-primary"
                          )}
                      >
                          <RadioGroupItem value={pkg.id} id={pkg.id} className="mr-4"/>
                          <div className="flex-grow">
                          <p className="font-semibold">{pkg.credits} Credits</p>
                          <p className="text-muted-foreground">£{pkg.price}.00</p>
                          </div>
                          {pkg.popular && (
                          <div className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">Popular</div>
                          )}
                      </Label>
                      ))}
                  </RadioGroup>
              </CardContent>
          </Card>

          {/* Right Side: Payment */}
            <Card>
              <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                  <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="space-y-4">
                      {paymentMethods.map(method => (
                            <Label
                              key={method.id}
                              htmlFor={method.id}
                              className={cn(
                                  "flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                                  selectedPayment === method.id && "bg-muted border-primary ring-2 ring-primary"
                              )}
                          >
                              <div className="flex items-center gap-3">
                                  {method.icon}
                                  <span className="font-medium">{method.name}</span>
                              </div>
                              <RadioGroupItem value={method.id} id={method.id} />
                          </Label>
                      ))}
                  </RadioGroup>
              </CardContent>
              <CardFooter>
                    <Button size="lg" className="w-full" onClick={handlePurchase}>
                      Complete Purchase
                  </Button>
              </CardFooter>
          </Card>
        </div>
      </div>
  );
}

const PurchaseCreditsLoader = () => (
    <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

export default function PurchaseCreditsPage() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Suspense fallback={<PurchaseCreditsLoader />}>
            <PurchaseCreditsContent />
        </Suspense>
      </main>
    </>
  );
}
