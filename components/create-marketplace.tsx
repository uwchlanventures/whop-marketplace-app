"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const createMarketplaceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  takeRate: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Take rate must be at least 0').max(100, 'Take rate cannot exceed 100')
  ),
});

type FormData = z.infer<typeof createMarketplaceSchema>;

interface CreateMarketplaceProps {
  experienceId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateMarketplace({ 
  experienceId, 
  onSuccess, 
  onCancel 
}: CreateMarketplaceProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ 
    title: '', 
    takeRate: 0 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'takeRate' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      const validation = createMarketplaceSchema.safeParse(formData);
      
      if (!validation.success) {
        const newErrors: Record<string, string> = {};
        validation.error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      // Submit form
      const response = await fetch(`/api/experiences/${experienceId}/marketplaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create marketplace');
      }

      // Handle success
      if (onSuccess) {
        onSuccess();
      } else {
        // Default success behavior
        router.refresh();
        router.push(`/experiences/${experienceId}`);
      }
    } catch (error) {
      console.error('Error creating marketplace:', error);
      setErrors({
        form: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Marketplace</h2>
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errors.form}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Marketplace Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.title ? 'border-red-500' : 'border'
            }`}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="takeRate" className="block text-sm font-medium text-gray-700 mb-1">
            Take Rate (%)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              id="takeRate"
              name="takeRate"
              min="0"
              max="100"
              step="0.01"
              value={formData.takeRate}
              onChange={handleChange}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.takeRate ? 'border-red-500' : 'border'
              }`}
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">%</span>
            </div>
          </div>
          {errors.takeRate && (
            <p className="mt-1 text-sm text-red-600">{errors.takeRate}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            The percentage fee you'll take from each transaction (0-100)
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Marketplace'}
          </button>
        </div>
      </form>
    </div>
  );
}