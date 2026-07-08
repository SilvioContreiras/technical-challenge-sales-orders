import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  type Column,
} from '@/shared/components/ui';
import { formatDocument } from '@/shared/utils/format';
import { getErrorMessage } from '@/shared/lib/errors';
import type { Customer } from '@/shared/types';
import { useTransportTypes } from '@/features/transport-types/queries';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '../queries';
import type { CustomerFormValues } from '../schema';
import { CustomerForm } from './CustomerForm';

const FORM_ID = 'customer-form';

const emptyValues: CustomerFormValues = {
  name: '',
  document: '',
  email: '',
  active: true,
  authorizedTransportTypeIds: [],
};

export function CustomersPage() {
  const customersQuery = useCustomers();
  const transportTypesQuery = useTransportTypes();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [editing, setEditing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);

  const activeTransportTypes = (transportTypesQuery.data ?? []).filter((t) => t.active);
  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditing(customer);
    setOpen(true);
  }

  function handleSubmit(values: CustomerFormValues) {
    const options = { onSuccess: () => setOpen(false) };
    if (editing) {
      updateCustomer.mutate({ id: editing.id, payload: values }, options);
    } else {
      createCustomer.mutate(values, options);
    }
  }

  const columns: Column<Customer>[] = [
    { header: 'Nome', cell: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
    { header: 'Documento', cell: (c) => formatDocument(c.document) },
    { header: 'E-mail', cell: (c) => c.email },
    {
      header: 'Transportes autorizados',
      cell: (c) => <Badge>{c.authorizedTransportTypeIds.length} tipos</Badge>,
    },
    {
      header: 'Status',
      cell: (c) =>
        c.active ? (
          <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-500">Inativo</Badge>
        ),
    },
    {
      header: '',
      align: 'right',
      cell: (c) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
          <Pencil className="size-4" />
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes e seus tipos de transporte autorizados."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Novo cliente
          </Button>
        }
      />

      <Card>
        {customersQuery.isPending ? (
          <LoadingState label="Carregando clientes..." />
        ) : customersQuery.isError ? (
          <ErrorState message={getErrorMessage(customersQuery.error)} />
        ) : customersQuery.data.length === 0 ? (
          <EmptyState
            message="Nenhum cliente cadastrado ainda."
            action={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Novo cliente
              </Button>
            }
          />
        ) : (
          <DataTable columns={columns} rows={customersQuery.data} rowKey={(c) => c.id} />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar cliente' : 'Novo cliente'}
        description={
          transportTypesQuery.isError
            ? getErrorMessage(transportTypesQuery.error)
            : 'Preencha os dados do cliente.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form={FORM_ID} loading={isSaving}>
              {editing ? 'Salvar alterações' : 'Criar cliente'}
            </Button>
          </>
        }
      >
        <CustomerForm
          key={editing?.id ?? 'new'}
          formId={FORM_ID}
          defaultValues={
            editing
              ? {
                  name: editing.name,
                  document: editing.document,
                  email: editing.email,
                  active: editing.active,
                  authorizedTransportTypeIds: editing.authorizedTransportTypeIds,
                }
              : emptyValues
          }
          transportTypes={activeTransportTypes}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
