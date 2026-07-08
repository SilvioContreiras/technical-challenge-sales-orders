import { useState } from 'react';
import { Button, Field, Modal, Select } from '@/shared/components/ui';
import type { Customer, SalesOrder, TransportType } from '@/shared/types';
import { useUpdateTransport } from '../queries';

interface ChangeTransportModalProps {
  open: boolean;
  onClose: () => void;
  order: SalesOrder;
  customer: Customer | undefined;
  transportTypes: TransportType[];
}

export function ChangeTransportModal({
  open,
  onClose,
  order,
  customer,
  transportTypes,
}: ChangeTransportModalProps) {
  const [transportTypeId, setTransportTypeId] = useState(order.transportTypeId);
  const updateTransport = useUpdateTransport();

  const labelOf = (id: string) => transportTypes.find((t) => t.id === id)?.name ?? id;
  const available = transportTypes.filter(
    (t) => t.active && customer?.authorizedTransportTypeIds.includes(t.id),
  );

  function handleConfirm() {
    updateTransport.mutate(
      {
        id: order.id,
        transportTypeId,
        previousTransportLabel: labelOf(order.transportTypeId),
        nextTransportLabel: labelOf(transportTypeId),
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change transport type"
      description="Only transport types authorized for the customer are listed."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={updateTransport.isPending}
            disabled={transportTypeId === order.transportTypeId}
          >
            Change transport
          </Button>
        </>
      }
    >
      <Field label="Transport type" htmlFor="transport">
        <Select
          id="transport"
          value={transportTypeId}
          onChange={(event) => setTransportTypeId(event.target.value)}
        >
          {available.map((transport) => (
            <option key={transport.id} value={transport.id}>
              {transport.name} ({transport.code})
            </option>
          ))}
        </Select>
      </Field>
    </Modal>
  );
}
