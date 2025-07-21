import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { UsageResultSchema } from '@coderscreen/api/schema/usage';

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PortalSession {
  url: string;
}

// Get customer and subscription info
export const useCustomer = () => {
  const query = useQuery({
    queryKey: ['billing', 'customer'],
    queryFn: async () => {
      const response = await apiClient.billing.customer.$get();
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      return response.json();
    },
    meta: {
      ERROR_MESSAGE: 'Failed to fetch customer',
    },
  });

  return {
    customer: query.data,
    ...query,
  };
};

// Get available plans
export const usePlans = () => {
  const query = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const response = await apiClient.billing.plans.$get();
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      return response.json();
    },
    meta: {
      ERROR_MESSAGE: 'Failed to fetch plans',
    },
  });

  return {
    plans: query.data,
    ...query,
  };
};

// Create checkout session
export const useCreateCheckoutSession = () => {
  const mutation = useMutation({
    mutationFn: async (params: { priceId: string; successUrl: string; cancelUrl: string }) => {
      const response = await apiClient.billing.checkout.$post({
        json: params,
      });
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      return response.json() as Promise<CheckoutSession>;
    },
    meta: {
      ERROR_MESSAGE: 'Failed to create checkout session',
    },
  });

  return {
    createCheckoutSession: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// Create billing portal session
export const useCreatePortalSession = () => {
  const mutation = useMutation({
    mutationFn: async (params: { returnUrl: string }) => {
      const response = await apiClient.billing.portal.$post({
        json: params,
      });
      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }
      return response.json() as Promise<PortalSession>;
    },
    meta: {
      ERROR_MESSAGE: 'Failed to create portal session',
    },
  });

  return {
    createPortalSession: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useAllUsage = () => {
  const query = useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: async () => {
      const response = await apiClient.billing.usage.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch current usage');
      }

      return response.json();
    },
  });

  return {
    usage: query.data,
    ...query,
  };
};

export const useUsage = (eventType: UsageResultSchema['eventType']) => {
  const query = useQuery({
    queryKey: ['billing', 'usage', eventType],
    queryFn: async () => {
      const response = await apiClient.billing.usage[':eventType'].$get({
        param: { eventType },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage');
      }

      return response.json();
    },
  });

  return {
    usage: query.data,
    ...query,
  };
};
