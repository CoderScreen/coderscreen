export const getBillingPlans = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      name: 'Free',
      price: 0,
      features: [
        'Unlimited coding interviews',
        'Real-time code collaboration',
        'Live code execution',
      ],
    },
  ];
};
