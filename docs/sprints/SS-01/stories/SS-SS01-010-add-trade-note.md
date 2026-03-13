# SS-SS01-010 — Optionally Add a Note to a Trade at Execution

| Field        | Value                   |
| ------------ | ----------------------- |
| **Story ID** | SS-SS01-010             |
| **Module**   | Virtual Trading Engine  |
| **Sprint**   | SS-01 — Simulation Core |
| **Priority** | Low                     |
| **Points**   | 1                       |
| **Status**   | Done                    |

---

## User Story

> **As a** user,  
> **I want to** optionally write a short note when I place a trade,  
> **so that** I can record my reasoning and review my trading strategy later.

---

## Acceptance Criteria

### Functional

- [ ] Both `/api/simulation/buy` and `/api/simulation/sell` accept an optional `notes` field in the request body.
- [ ] `notes` is persisted on the `Transaction` record in the `notes` column.
- [ ] `notes` is returned in the `SimulationTradeResponse` and in trade history responses.
- [ ] `notes` is optional — omitting it (or passing `null`) creates the trade successfully.
- [ ] A note can be **edited** after the trade via `PATCH /api/simulation/trades/{transactionId}/notes`.
- [ ] The frontend trade form includes an optional `Note / Reason` textarea beneath the quantity input.
- [ ] Notes are displayed in the trade history list next to each trade entry.

### Edge Cases

- [ ] `notes` exceeding **500 characters** returns `400 Bad Request`: `"Note must not exceed 500 characters."`
- [ ] HTML or script content in `notes` is stored as plain text — rendered escaped in the UI (no XSS risk).
- [ ] Updating notes on a trade belonging to another user returns `403 Forbidden`.
- [ ] Updating notes on a soft-deleted trade returns `404 Not Found`.
- [ ] `notes` set to an empty string `""` is treated as `null` (no note).

---

## Technical Notes

### Backend

**Existing `Transaction.notes` column**  
The `notes` column already exists on the `Transaction` model and `transactions` table (from the initial schema). **No migration required.**

**`SimulationBuyRequest` / `SimulationSellRequest`** (from SS-SS01-005 / SS-SS01-006)

- Already include `string? Notes { get; set; }` — add `[MaxLength(500)]` validation annotation if not present.

**`SimulationTradeService.ExecuteBuyAsync` / `ExecuteSellAsync`**

- Pass `notes` when constructing the `Transaction` entity — no additional logic needed.

**New endpoint — `SimulationController.cs`**

```
PATCH /api/simulation/trades/{transactionId}/notes
```

Request body:

```json
{ "notes": "Bought due to Q4 earnings beat expectation." }
```

- Validate ownership: `transaction.Portfolio.UserId == userId`.
- Validate `notes.Length <= 500`.
- Update `transaction.Notes = notes` (or `null` if empty string).
- Update `transaction.UpdatedAt = DateTime.UtcNow`.
- Return `204 No Content`.

**`ITransactionRepository`**

- Add `UpdateNotesAsync(Guid transactionId, string userId, string? notes)` if not already present.
  - Alternatively, reuse existing `UpdateAsync` method with a notes-only update DTO.

**Sanitisation**

- `notes` is stored as plain text. No HTML sanitisation needed on write — UI must render escaped (React escapes by default).

### Frontend

**`SimulationTradeForm.tsx`**

- Add a collapsible `Note / Reason` section below the quantity input.
- `<textarea>` with placeholder: `"Why are you making this trade? (optional)"`.
- Character counter: `"0 / 500"` shown when textarea is focused.
- Turns `text-danger` when over 500 characters and disables submit.

**`OrderConfirmationDialog.tsx`**

- Display note (if present) in a quoted block in the confirmation summary.
- If no note, show nothing (do not render an empty block).

**Trade history list**

- Show a note icon (e.g. a small notepad icon) on trade rows that have a note.
- On hover or click: expand/show the full note text inline.
- Allow inline editing via the `PATCH` endpoint — clicking note opens a small editable textarea.

**`transaction-service.ts`**

- Add `updateTradeNote(transactionId: string, notes: string | null): Promise<void>` calling `PATCH /api/simulation/trades/{transactionId}/notes`.

---

## Dependencies

| Dependency                              | Type         | Notes                                             |
| --------------------------------------- | ------------ | ------------------------------------------------- |
| SS-SS01-005                             | Blocking     | `notes` passed into `ExecuteBuyAsync`             |
| SS-SS01-006                             | Blocking     | `notes` passed into `ExecuteSellAsync`            |
| Existing `Transaction.notes` column     | Code — reuse | Column already exists — no migration needed       |
| Existing `UpdateTransactionRequest` DTO | Code — check | May already support notes update; reuse or extend |

---

## Out of Scope

- Rich text / markdown notes
- Note templates or strategy tagging (future — "Trading Journal" module in Sprint 4+)
- Note search or filtering trade history by note content
- Bulk note editing across multiple trades
