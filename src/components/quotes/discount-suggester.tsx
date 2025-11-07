'use client';

import { useState } from 'react';
import { Lightbulb, LoaderCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getDiscountSuggestion } from '@/app/actions/suggest-discount';
import { useToast } from '@/hooks/use-toast';
import type { SuggestDiscountAmountForQuoteOutput } from '@/ai/flows/suggest-discount-amount-for-quote.ts';

export function DiscountSuggester({ quoteAmount }: { quoteAmount: number }) {
  const [productMargin, setProductMargin] = useState(0.3);
  const [customerHistory, setCustomerHistory] = useState('New customer, first interaction.');
  const [suggestion, setSuggestion] = useState<SuggestDiscountAmountForQuoteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);

    const result = await getDiscountSuggestion({
      productMargin,
      customerHistory,
      quoteAmount,
    });

    if (result.success && result.suggestion) {
      setSuggestion(result.suggestion);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }

    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary" />
          Discount Suggester
        </CardTitle>
        <CardDescription>Get an AI-powered discount suggestion to help close the deal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-history">Customer History</Label>
          <Textarea
            id="customer-history"
            placeholder="e.g., Long-time customer, high value purchases."
            value={customerHistory}
            onChange={(e) => setCustomerHistory(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-margin">Product Margin (%)</Label>
          <Input
            id="product-margin"
            type="number"
            placeholder="e.g., 30"
            value={productMargin * 100}
            onChange={(e) => setProductMargin(parseFloat(e.target.value) / 100)}
          />
        </div>
        <Button onClick={handleGetSuggestion} disabled={isLoading || quoteAmount <= 0} className="w-full">
          {isLoading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            'Suggest Discount'
          )}
        </Button>
        {suggestion && (
          <Alert>
            <AlertTitle className="flex items-center gap-2">
              Suggestion: <span className="text-primary">{formatCurrency(suggestion.suggestedDiscountAmount)}</span>
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="font-semibold">Reasoning:</p>
              <p>{suggestion.reasoning}</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
