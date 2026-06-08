"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import type { CustomFieldDefinition, CustomFieldScope, CustomFieldType, CustomFieldValue } from "@/lib/types";

const fieldTypes: CustomFieldType[] = ["Text", "Number", "Date", "Select"];

function fieldInputType(type: CustomFieldType) {
  if (type === "Number") return "number";
  if (type === "Date") return "date";
  return "text";
}

export function upsertCustomFieldValue(values: CustomFieldValue[], fieldId: string, entityId: string, value: string) {
  const existing = values.find((item) => item.field_id === fieldId && item.entity_id === entityId);
  if (existing) {
    return values.map((item) => (item.id === existing.id ? { ...item, value, updated_at: new Date().toISOString() } : item));
  }
  return [
    ...values,
    {
      id: `cfv-${crypto.randomUUID()}`,
      field_id: fieldId,
      entity_id: entityId,
      value,
      updated_at: new Date().toISOString()
    }
  ];
}

export function getCustomFieldValue(values: CustomFieldValue[], fieldId: string, entityId: string) {
  return values.find((item) => item.field_id === fieldId && item.entity_id === entityId)?.value ?? "";
}

export function CustomFieldEditor({
  scope,
  title,
  fields,
  onFieldsChange
}: {
  scope: CustomFieldScope;
  title: string;
  fields: CustomFieldDefinition[];
  onFieldsChange: (fields: CustomFieldDefinition[]) => void;
}) {
  const scopedFields = fields.filter((field) => field.scope === scope);

  function addField(formData: FormData) {
    const label = String(formData.get("label") ?? "").trim();
    if (!label) return;
    const type = String(formData.get("type") ?? "Text") as CustomFieldType;
    const options = String(formData.get("options") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    onFieldsChange([
      ...fields,
      {
        id: `cf-${crypto.randomUUID()}`,
        scope,
        label,
        type,
        options: type === "Select" ? options : undefined,
        created_at: new Date().toISOString()
      }
    ]);
  }

  function updateField(fieldId: string, patch: Partial<CustomFieldDefinition>) {
    onFieldsChange(fields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)));
  }

  function removeField(fieldId: string) {
    onFieldsChange(fields.filter((field) => field.id !== fieldId));
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={addField} className="mb-4 grid gap-2 md:grid-cols-[1fr_160px_1fr_auto]">
          <Input name="label" placeholder="Field name" />
          <Select name="type" defaultValue="Text">
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Input name="options" placeholder="Select options, comma separated" />
          <Button type="submit">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </form>
        <div className="rounded-md border">
          <Table>
            <THead>
              <TR>
                <TH>Field</TH>
                <TH>Type</TH>
                <TH>Options</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {scopedFields.map((field) => (
                <TR key={field.id}>
                  <TD>
                    <Input value={field.label} onChange={(event) => updateField(field.id, { label: event.target.value })} />
                  </TD>
                  <TD>
                    <Select
                      value={field.type}
                      onChange={(event) => updateField(field.id, { type: event.target.value as CustomFieldType })}
                    >
                      {fieldTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                  </TD>
                  <TD>
                    <Input
                      disabled={field.type !== "Select"}
                      value={(field.options ?? []).join(", ")}
                      onChange={(event) =>
                        updateField(field.id, {
                          options: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                        })
                      }
                    />
                  </TD>
                  <TD className="text-right">
                    <Button aria-label={`Remove ${field.label}`} size="icon" variant="ghost" onClick={() => removeField(field.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TD>
                </TR>
              ))}
              {scopedFields.length === 0 ? (
                <TR>
                  <TD colSpan={4} className="text-muted-foreground">
                    No custom fields yet.
                  </TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomFieldValueInput({
  field,
  value,
  onChange
}: {
  field: CustomFieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "Select") {
    return (
      <Select className="min-w-36" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">None</option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    );
  }

  return (
    <Input
      className="min-w-36"
      type={fieldInputType(field.type)}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function SaveHint() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Save className="h-3.5 w-3.5" />
      Changes save in this browser session.
    </div>
  );
}
