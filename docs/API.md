# Referência da API simulada

Todos os endpoints são servidos pelo MSW sob o caminho base `/api` (configurável via
`VITE_API_BASE_URL`). Os erros seguem um formato comum:

```json
{ "message": "mensagem legível", "code": "MACHINE_CODE", "details": null }
```

Códigos de status comuns: `200` OK, `201` Criado, `404` Não encontrado, `422` Violação de regra de negócio.

## Clientes

| Método | Caminho          | Descrição                     |
| ------ | ---------------- | ----------------------------- |
| GET    | `/customers`     | Listar (busca opcional `?q=`) |
| GET    | `/customers/:id` | Obter um                      |
| POST   | `/customers`     | Criar (`document` único)      |
| PUT    | `/customers/:id` | Atualizar                     |

## Tipos de transporte

| Método | Caminho                | Descrição            |
| ------ | ---------------------- | -------------------- |
| GET    | `/transport-types`     | Listar               |
| GET    | `/transport-types/:id` | Obter um             |
| POST   | `/transport-types`     | Criar (`code` único) |
| PUT    | `/transport-types/:id` | Atualizar            |

## Itens

| Método | Caminho      | Descrição                     |
| ------ | ------------ | ----------------------------- |
| GET    | `/items`     | Listar (busca opcional `?q=`) |
| GET    | `/items/:id` | Obter um                      |
| POST   | `/items`     | Criar (`sku` único)           |

## Ordens de venda

| Método | Caminho                              | Descrição                                                                           |
| ------ | ------------------------------------ | ----------------------------------------------------------------------------------- |
| GET    | `/sales-orders`                      | Listar com filtros: `status`, `customerId`, `transportTypeId`, `dateFrom`, `dateTo` |
| GET    | `/sales-orders/:id`                  | Obter uma                                                                           |
| POST   | `/sales-orders`                      | Criar (valida cliente, autorização de transporte, ≥1 item)                          |
| PATCH  | `/sales-orders/:id/status`           | Avançar o status (validado pela máquina de estados)                                 |
| PUT    | `/sales-orders/:id/schedule`         | Definir/atualizar data de entrega + janela (não confirmado)                         |
| POST   | `/sales-orders/:id/schedule/confirm` | Confirmar o agendamento (transição `PLANNED → SCHEDULED`)                           |
| PUT    | `/sales-orders/:id/transport`        | Alterar o transporte (deve ser autorizado; antes do despacho)                       |

### Códigos relevantes de regra de negócio

- `TRANSPORT_NOT_AUTHORIZED` — tipo de transporte não autorizado para o cliente
- `NO_ITEMS` — ordem sem itens
- `INVALID_TRANSITION` — transição de status não permitida pela máquina de estados
- `SCHEDULE_REQUIRED` — não é possível atingir `SCHEDULED` sem um agendamento confirmado
- `TRANSPORT_LOCKED` — o transporte não pode ser alterado após o despacho

## Eventos de auditoria

| Método | Caminho         | Descrição                                          |
| ------ | --------------- | -------------------------------------------------- |
| GET    | `/audit-events` | Listar (opcional `?entityId=`, `?action=`)         |
| POST   | `/audit-events` | Registrar um evento (usado pela saga de auditoria) |
