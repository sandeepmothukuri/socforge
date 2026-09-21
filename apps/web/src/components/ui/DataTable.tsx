"use client";

import React, { useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | ((row: T) => string);
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  emptyMessage = "No records found.",
  onRowClick,
}: DataTableProps<T>) {
  const getKey = (row: T, index: number): string => {
    if (typeof keyField === "function") return keyField(row);
    return (row[keyField] as string) || String(index);
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#A7B0C0] border border-[#263248] bg-[#151C2E] rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#263248] rounded-lg bg-[#151C2E]">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#263248] bg-[#111827]/70 text-[#A7B0C0]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 px-4 font-semibold uppercase tracking-wider ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E293B]">
          {data.map((row, idx) => (
            <tr
              key={getKey(row, idx)}
              onClick={() => onRowClick && onRowClick(row)}
              className={`hover:bg-[#172033] transition-colors ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`py-2.5 px-4 text-[#F8FAFC] ${col.className || ""}`}>
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
