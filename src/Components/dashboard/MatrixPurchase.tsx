
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type MatrixTier = {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
};

const matrixTiers: MatrixTier[] = [
  {
    id: 'basic',
    name: 'Basic Matrix',
    price: 25,
    features: [
      'Single 1x5 matrix',
      'Basic analytics',
      'Email support',
      '30-day guarantee'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Matrix',
    price: 100,
    features: [
      'Enhanced 1x5 matrix',
      'Priority placement',
      'Advanced analytics',
      'Priority support',
      '60-day guarantee'
    ],
    popular: true
  }
];

const MatrixPurchase = () => {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = (tierId: string) => {
    const tier = matrixTiers.find(t => t.id === tierId);
    if (!tier) return;
    
    setSelectedTier(tierId);
    setIsProcessing(true);
    
    // Simulate purchase process
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Purchase successful!",
        description: `You've purchased the ${tier.name} for $${tier.price}.`,
        duration: 5000,
      });
    }, 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 animate-slide-in">
      {matrixTiers.map((tier) => (
        <Card 
          key={tier.id}
          className={`relative overflow-hidden transition-all duration-300 ${
            tier.popular ? 'border-primary shadow-md' : ''
          } ${selectedTier === tier.id ? 'ring-2 ring-primary' : ''}`}
        >
          {tier.popular && (
            <div className="absolute top-0 right-0">
              <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-md flex items-center">
                <Sparkles size={12} className="mr-1" />
                Popular
              </div>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{tier.name}</CardTitle>
            <CardDescription>
              Grow your network with our {tier.price === 25 ? 'starter' : 'advanced'} matrix
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <span className="text-3xl font-bold">${tier.price}</span>
              <span className="text-muted-foreground ml-1">one-time</span>
            </div>
            
            <ul className="space-y-2">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check size={18} className="text-primary shrink-0 mr-2 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full group transition-all duration-300"
              size="lg"
              variant={tier.popular ? "default" : "outline"}
              onClick={() => handlePurchase(tier.id)}
              disabled={isProcessing}
            >
              {isProcessing && selectedTier === tier.id ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <CreditCard size={18} className="mr-2" />
                  Purchase Now
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MatrixPurchase;
