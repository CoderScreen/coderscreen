'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@coderscreen/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@coderscreen/ui/toggle-group';
import { RiCheckLine } from '@remixicon/react';
import { useState } from 'react';
import { CompetitorData } from '@/lib/alternativeConfig';

interface AlternativePricingProps {
  competitor: CompetitorData;
}

export const AlternativePricing = ({ competitor }: AlternativePricingProps) => {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const currentPlan = competitor.pricing.plans[selectedPlanIndex];

  return (
    <section className='py-16 bg-gray-50'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>{competitor.pricing.title}</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            {competitor.pricing.description}
          </p>
        </div>

        {/* Plan Switcher - Only show if multiple plans */}
        {competitor.pricing.plans.length > 1 && (
          <div className='flex justify-center mb-4'>
            <ToggleGroup
              type='single'
              value={currentPlan.name}
              onValueChange={(value) =>
                setSelectedPlanIndex(
                  competitor.pricing.plans.findIndex((plan) => plan.name === value)
                )
              }
            >
              {competitor.pricing.plans.map((plan) => (
                <ToggleGroupItem key={plan.name} value={plan.name}>
                  {plan.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Simple Pricing Comparison */}
        <div className='max-w-4xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 mb-12'>
            {/* CoderScreen */}
            <Card className='relative border-2 border-primary rounded-r-none shadow-none'>
              <CardHeader className='text-center pt-8'>
                <CardTitle className='text-2xl font-bold text-primary'>CoderScreen</CardTitle>
                <div className='mt-4'>
                  <span className='text-3xl font-bold'>{currentPlan.coderScreenPrice}</span>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='space-y-3 mb-6'>
                  {currentPlan.coderScreenFeatures.map((feature) => (
                    <div key={feature} className='flex items-center gap-2'>
                      <RiCheckLine className='h-4 w-4 text-green-500' />
                      <span className='text-sm'>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitor */}
            <Card className='border border-gray-200 rounded-l-none shadow-none'>
              <CardHeader className='text-center pt-8'>
                <CardTitle className='text-2xl font-bold text-muted-foreground'>
                  {competitor.displayName}
                </CardTitle>
                <div className='mt-4'>
                  <span className='text-3xl font-bold'>{currentPlan.competitorPrice}</span>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='space-y-3 mb-6'>
                  {currentPlan.competitorFeatures.map((feature) => (
                    <div key={feature} className='flex items-center gap-2'>
                      <RiCheckLine className='h-4 w-4 text-gray-400' />
                      <span className='text-sm text-muted-foreground'>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
