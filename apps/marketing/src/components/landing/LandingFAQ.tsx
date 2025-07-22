'use client';
import { Button } from '@coderscreen/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@coderscreen/ui/accordion';

// FAQ data
const FAQ_ITEMS = [
  {
    question: 'How does the free plan work?',
    answer:
      'The free plan includes unlimited interviews, real-time collaboration, and basic code execution. You can have up to 3 team members and access to community support. Perfect for individual developers and small teams getting started.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your access will continue until the end of your current billing period.',
  },
  {
    question: 'What programming languages do you support?',
    answer:
      'We support all major programming languages including JavaScript, TypeScript, Python, Java, C++, Go, Rust, PHP, Ruby, and more. Our sandbox environment runs code safely and provides real-time execution.',
  },
  {
    question: 'Is my code and data secure?',
    answer:
      'Absolutely. We take security seriously with enterprise-grade encryption, secure sandbox environments, and compliance with industry standards. Your code and data are never shared with third parties.',
  },
  {
    question: 'Can I integrate with my existing tools?',
    answer:
      'Yes, we offer integrations with popular tools like Slack, GitHub, and your existing HR systems. Enterprise customers can also request custom integrations to fit their specific workflow.',
  },
  {
    question: 'Do you offer custom pricing for nonprofits?',
    answer:
      'Yes, we offer special pricing for educational institutions and nonprofit organizations. Please contact our sales team to discuss your specific needs and requirements.',
  },
];

export const LandingFAQ = () => {
  return (
    <section className='w-full'>
      <div className='w-full p-6'>
        <div className='flex flex-col gap-4 text-center mb-12'>
          <h2 className='text-3xl font-semibold'>Frequently asked questions</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Everything you need to know about CoderScreen. Can't find the answer you're looking for?
            Please chat to our friendly team.
          </p>
        </div>

        <div className='max-w-3xl mx-auto'>
          <Accordion type='single' collapsible className='w-full'>
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className='text-left'>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className='text-center mt-12'>
          <p className='text-muted-foreground mb-4'>Still have questions? We're here to help.</p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button variant='primary' className='px-4'>
              Contact support
            </Button>
            <Button variant='secondary' className='px-4'>
              Book a demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
