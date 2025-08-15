import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

export type TabbedContent = {
  tabs: Array<{
    id: string;
    title: string;
    columns: Array<{
      sections: Array<{
        heading: string;
        rows: Array<{ label: string; value: string }>;
      }>;
    }>;
  }>;
};

interface TabbedContentEditorProps {
  value: TabbedContent | null;
  onChange: (v: TabbedContent | null) => void;
}

const TabbedContentEditor: React.FC<TabbedContentEditorProps> = ({ value, onChange }) => {
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const content = value || { tabs: [] };

  const addTab = () => {
    const id = Math.random().toString(36).slice(2);
    onChange({ tabs: [...content.tabs, { id, title: "New Tab", columns: [{ sections: [] }] }] });
  };
  const removeTab = (idx: number) => {
    const next = [...content.tabs];
    next.splice(idx, 1);
    onChange({ tabs: next });
  };
  const updateTabTitle = (idx: number, title: string) => {
    const next = [...content.tabs];
    next[idx] = { ...next[idx], title };
    onChange({ tabs: next });
  };
  const addColumn = (tabIdx: number) => {
    const next = [...content.tabs];
    next[tabIdx] = { ...next[tabIdx], columns: [...next[tabIdx].columns, { sections: [] }] };
    onChange({ tabs: next });
  };
  const addSection = (tabIdx: number, colIdx: number) => {
    const next = [...content.tabs];
    const columns = [...next[tabIdx].columns];
    const column = { ...columns[colIdx] };
    column.sections = [...column.sections, { heading: "Section", rows: [] }];
    columns[colIdx] = column;
    next[tabIdx] = { ...next[tabIdx], columns };
    onChange({ tabs: next });
  };
  const updateSectionHeading = (tabIdx: number, colIdx: number, secIdx: number, heading: string) => {
    const next = [...content.tabs];
    const columns = [...next[tabIdx].columns];
    const column = { ...columns[colIdx] };
    const sections = [...column.sections];
    sections[secIdx] = { ...sections[secIdx], heading };
    column.sections = sections;
    columns[colIdx] = column;
    next[tabIdx] = { ...next[tabIdx], columns };
    onChange({ tabs: next });
  };
  const addRow = (tabIdx: number, colIdx: number, secIdx: number) => {
    const next = [...content.tabs];
    const columns = [...next[tabIdx].columns];
    const column = { ...columns[colIdx] };
    const sections = [...column.sections];
    const rows = [...sections[secIdx].rows, { label: "Label", value: "" }];
    sections[secIdx] = { ...sections[secIdx], rows };
    column.sections = sections;
    columns[colIdx] = column;
    next[tabIdx] = { ...next[tabIdx], columns };
    onChange({ tabs: next });
  };
  const updateRow = (tabIdx: number, colIdx: number, secIdx: number, rowIdx: number, key: "label"|"value", val: string) => {
    const next = [...content.tabs];
    const columns = [...next[tabIdx].columns];
    const column = { ...columns[colIdx] };
    const sections = [...column.sections];
    const rows = [...sections[secIdx].rows];
    rows[rowIdx] = { ...rows[rowIdx], [key]: val } as any;
    sections[secIdx] = { ...sections[secIdx], rows };
    column.sections = sections;
    columns[colIdx] = column;
    next[tabIdx] = { ...next[tabIdx], columns };
    onChange({ tabs: next });
  };
  const removeRow = (tabIdx: number, colIdx: number, secIdx: number, rowIdx: number) => {
    const next = [...content.tabs];
    const columns = [...next[tabIdx].columns];
    const column = { ...columns[colIdx] };
    const sections = [...column.sections];
    const rows = [...sections[secIdx].rows];
    rows.splice(rowIdx, 1);
    sections[secIdx] = { ...sections[secIdx], rows };
    column.sections = sections;
    columns[colIdx] = column;
    next[tabIdx] = { ...next[tabIdx], columns };
    onChange({ tabs: next });
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="font-medium">Tabbed Content</div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowSchemaEditor((v) => !v)}>
              {showSchemaEditor ? 'Simple Editor' : 'JSON Schema Editor'}
            </Button>
            <Button type="button" size="sm" onClick={addTab}>Add Tab</Button>
          </div>
        </div>
        {showSchemaEditor ? (
          <div className="border rounded p-3">
            <Form
              validator={validator}
              schema={{
                type: 'object',
                properties: {
                  tabs: {
                    type: 'array',
                    title: 'Tabs',
                    items: {
                      type: 'object',
                      required: ['id','title','columns'],
                      properties: {
                        id: { type: 'string', title: 'ID' },
                        title: { type: 'string', title: 'Title' },
                        columns: {
                          type: 'array',
                          title: 'Columns',
                          items: {
                            type: 'object',
                            properties: {
                              sections: {
                                type: 'array',
                                title: 'Sections',
                                items: {
                                  type: 'object',
                                  properties: {
                                    heading: { type: 'string', title: 'Heading' },
                                    rows: {
                                      type: 'array',
                                      title: 'Rows',
                                      items: {
                                        type: 'object',
                                        required: ['label'],
                                        properties: {
                                          label: { type: 'string', title: 'Label' },
                                          value: { type: 'string', title: 'Value' }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }}
              formData={content}
              onChange={(e) => onChange((e.formData as any) || { tabs: [] })}
              onSubmit={() => {}}
              onError={() => {}}
            >
              <></>
            </Form>
          </div>
        ) : null}
        <div className="space-y-6">
          {content.tabs.map((tab, tabIdx) => (
            <div key={tab.id || tabIdx} className="border rounded p-3 space-y-3">
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Tab Title</div>
                <Input value={tab.title} onChange={(e)=>updateTabTitle(tabIdx, e.target.value)} className="max-w-sm" />
                <Button type="button" variant="destructive" size="sm" onClick={()=>removeTab(tabIdx)}>Remove Tab</Button>
                <Button type="button" variant="outline" size="sm" onClick={()=>addColumn(tabIdx)}>Add Column</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tab.columns.map((col, colIdx) => (
                  <div key={colIdx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Column {colIdx+1}</div>
                      <Button type="button" variant="outline" size="sm" onClick={()=>addSection(tabIdx, colIdx)}>Add Section</Button>
                    </div>
                    {col.sections.map((sec, secIdx) => (
                      <div key={secIdx} className="border rounded p-3 space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Section Heading</div>
                          <Input value={sec.heading} onChange={(e)=>updateSectionHeading(tabIdx, colIdx, secIdx, e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs">Rows</div>
                          {sec.rows.map((row, rowIdx) => (
                            <div key={rowIdx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                              <Input value={row.label} onChange={(e)=>updateRow(tabIdx, colIdx, secIdx, rowIdx, 'label', e.target.value)} placeholder="Label" />
                              <Input value={row.value} onChange={(e)=>updateRow(tabIdx, colIdx, secIdx, rowIdx, 'value', e.target.value)} placeholder="Value" className="md:col-span-2" />
                              <Button type="button" variant="destructive" size="sm" onClick={()=>removeRow(tabIdx, colIdx, secIdx, rowIdx)}>Remove</Button>
                            </div>
                          ))}
                          <Button type="button" size="sm" onClick={()=>addRow(tabIdx, colIdx, secIdx)}>Add Row</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TabbedContentEditor;

