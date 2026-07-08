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
import { getErrorMessage } from '@/shared/lib/errors';
import type { TransportType } from '@/shared/types';
import { useTransportTypes, useCreateTransportType, useUpdateTransportType } from '../queries';
import type { TransportTypeFormValues } from '../schema';
import { TransportTypeForm } from './TransportTypeForm';

const FORM_ID = 'transport-type-form';

const emptyValues: TransportTypeFormValues = { name: '', code: '', active: true };

export function TransportTypesPage() {
  const transportTypesQuery = useTransportTypes();
  const createTransportType = useCreateTransportType();
  const updateTransportType = useUpdateTransportType();

  const [editing, setEditing] = useState<TransportType | null>(null);
  const [open, setOpen] = useState(false);

  const isSaving = createTransportType.isPending || updateTransportType.isPending;

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(transportType: TransportType) {
    setEditing(transportType);
    setOpen(true);
  }

  function handleSubmit(values: TransportTypeFormValues) {
    const options = { onSuccess: () => setOpen(false) };
    if (editing) {
      updateTransportType.mutate({ id: editing.id, payload: values }, options);
    } else {
      createTransportType.mutate(values, options);
    }
  }

  const columns: Column<TransportType>[] = [
    { header: 'Nome', cell: (t) => <span className="font-medium text-slate-900">{t.name}</span> },
    { header: 'Código', cell: (t) => <Badge>{t.code}</Badge> },
    {
      header: 'Status',
      cell: (t) =>
        t.active ? (
          <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-500">Inativo</Badge>
        ),
    },
    {
      header: '',
      align: 'right',
      cell: (t) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
          <Pencil className="size-4" />
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tipos de Transporte"
        description="Cadastre as modalidades de transporte disponíveis aos clientes."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Novo tipo de transporte
          </Button>
        }
      />

      <Card>
        {transportTypesQuery.isPending ? (
          <LoadingState label="Carregando tipos de transporte..." />
        ) : transportTypesQuery.isError ? (
          <ErrorState message={getErrorMessage(transportTypesQuery.error)} />
        ) : transportTypesQuery.data.length === 0 ? (
          <EmptyState message="Nenhum tipo de transporte cadastrado ainda." />
        ) : (
          <DataTable columns={columns} rows={transportTypesQuery.data} rowKey={(t) => t.id} />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar tipo de transporte' : 'Novo tipo de transporte'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form={FORM_ID} loading={isSaving}>
              {editing ? 'Salvar alterações' : 'Criar tipo de transporte'}
            </Button>
          </>
        }
      >
        <TransportTypeForm
          key={editing?.id ?? 'new'}
          formId={FORM_ID}
          defaultValues={
            editing
              ? { name: editing.name, code: editing.code, active: editing.active }
              : emptyValues
          }
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
