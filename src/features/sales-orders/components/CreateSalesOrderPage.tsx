import { useMemo } from 'react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  LoadingState,
  ErrorState,
} from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils/format';
import { useCustomers } from '@/features/customers/queries';
import { useTransportTypes } from '@/features/transport-types/queries';
import { useItems } from '@/features/items/queries';
import { useCreateSalesOrder } from '../queries';
import { salesOrderSchema, type SalesOrderFormValues } from '../schema';

export function CreateSalesOrderPage() {
  const navigate = useNavigate();
  const customersQuery = useCustomers();
  const transportTypesQuery = useTransportTypes();
  const itemsQuery = useItems();
  const createOrder = useCreateSalesOrder();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      customerId: '',
      transportTypeId: '',
      items: [{ itemId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const selectedCustomerId = useWatch({ control, name: 'customerId' });
  const watchedItems = useWatch({ control, name: 'items' });

  const activeCustomers = (customersQuery.data ?? []).filter((c) => c.active);
  const items = itemsQuery.data ?? [];

  const availableTransports = useMemo(() => {
    const customer = customersQuery.data?.find((c) => c.id === selectedCustomerId);
    if (!customer) return [];
    return (transportTypesQuery.data ?? []).filter(
      (t) => t.active && customer.authorizedTransportTypeIds.includes(t.id),
    );
  }, [customersQuery.data, transportTypesQuery.data, selectedCustomerId]);

  const itemPrice = useMemo(() => {
    const map = new Map((itemsQuery.data ?? []).map((i) => [i.id, i.unitPrice]));
    return (id: string) => map.get(id) ?? 0;
  }, [itemsQuery.data]);

  const total = (watchedItems ?? []).reduce(
    (sum, line) => sum + itemPrice(line.itemId) * (Number(line.quantity) || 0),
    0,
  );

  function onSubmit(values: SalesOrderFormValues) {
    createOrder.mutate(values, {
      onSuccess: (order) =>
        navigate({ to: '/sales-orders/$orderId', params: { orderId: order.id } }),
    });
  }

  if (customersQuery.isPending || transportTypesQuery.isPending || itemsQuery.isPending) {
    return <LoadingState label="Loading form data..." />;
  }
  if (customersQuery.isError || transportTypesQuery.isError || itemsQuery.isError) {
    return <ErrorState message="Failed to load required data. Please try again." />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={() => navigate({ to: '/sales-orders' })}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="size-4" />
        Back to sales orders
      </button>

      <PageHeader title="New sales order" description="Select a customer, transport and items." />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Card className="flex flex-col gap-4 p-5">
          <Field label="Customer" htmlFor="customerId" required error={errors.customerId?.message}>
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <Select
                  id="customerId"
                  invalid={Boolean(errors.customerId)}
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    setValue('transportTypeId', '');
                  }}
                >
                  <option value="">Select a customer</option>
                  {activeCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          </Field>

          <Field
            label="Transport type"
            htmlFor="transportTypeId"
            required
            hint={
              selectedCustomerId
                ? 'Only transport types authorized for this customer are listed.'
                : 'Select a customer first.'
            }
            error={errors.transportTypeId?.message}
          >
            <Select
              id="transportTypeId"
              invalid={Boolean(errors.transportTypeId)}
              disabled={!selectedCustomerId}
              {...register('transportTypeId')}
            >
              <option value="">Select a transport type</option>
              {availableTransports.map((transport) => (
                <option key={transport.id} value={transport.id}>
                  {transport.name} ({transport.code})
                </option>
              ))}
            </Select>
          </Field>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Items</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ itemId: '', quantity: 1 })}
            >
              <Plus className="size-4" />
              Add item
            </Button>
          </div>

          {typeof errors.items?.message === 'string' ? (
            <p className="text-xs text-red-600">{errors.items.message}</p>
          ) : null}

          <div className="flex flex-col gap-3">
            {fields.map((fieldItem, index) => (
              <div key={fieldItem.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <Select
                    invalid={Boolean(errors.items?.[index]?.itemId)}
                    {...register(`items.${index}.itemId`)}
                  >
                    <option value="">Select an item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.sku} — {item.name} ({formatCurrency(item.unitPrice)})
                      </option>
                    ))}
                  </Select>
                  {errors.items?.[index]?.itemId ? (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.items[index]?.itemId?.message}
                    </p>
                  ) : null}
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    invalid={Boolean(errors.items?.[index]?.quantity)}
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  {errors.items?.[index]?.quantity ? (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  aria-label="Remove item"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm text-slate-500">Estimated total</span>
            <span className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</span>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate({ to: '/sales-orders' })}
          >
            Cancel
          </Button>
          <Button type="submit" loading={createOrder.isPending}>
            Create order
          </Button>
        </div>
      </form>
    </div>
  );
}
