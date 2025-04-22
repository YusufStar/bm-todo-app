'use client';

import { useState, useCallback, useMemo } from 'react';
import { Selection, SortDescriptor } from '@heroui/react';

type TableColumn<T> = {
  name: string;
  uid: keyof T | string;
  sortable?: boolean;
};

interface UseTableOptions<T> {
  initialData?: T[];
  columns: TableColumn<T>[];
  initialVisibleColumns?: string[];
  initialSortDescriptor?: SortDescriptor;
  onSortChange?: (sortDescriptor: SortDescriptor) => void;
  onSelectionChange?: (keys: Selection) => void;
  onSearchChange?: (value: string) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onPageChange?: (page: number) => void;
  initialFilter?: string;
  initialPageSize?: number;
  filterField?: keyof T;
}

export function useTable<T extends Record<string, any>>(options: UseTableOptions<T>) {
  const {
    initialData = [],
    columns,
    initialVisibleColumns,
    initialSortDescriptor = { column: '', direction: 'ascending' },
    onSortChange,
    onSelectionChange,
    onSearchChange,
    onRowsPerPageChange,
    onPageChange,
    initialFilter = '',
    initialPageSize = 10,
    filterField,
  } = options;

  // State
  const [data, setData] = useState<T[]>(initialData);
  const [filterValue, setFilterValue] = useState(initialFilter);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialVisibleColumns || columns.map((column) => column.uid.toString()))
  );
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(initialSortDescriptor);
  const [page, setPage] = useState(1);

  // Visible columns
  const headerColumns = useMemo(() => {
    if (visibleColumns instanceof Set && visibleColumns.has('all')) return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid.toString()));
  }, [visibleColumns, columns]);

  // Filter and search
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    if (!hasSearchFilter || !filterField) return data;
    
    return data.filter((item) => {
      const value = item[filterField];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(filterValue);
      }
      return false;
    });
  }, [data, filterValue, hasSearchFilter, filterField]);

  // Pagination
  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  // Sorting
  const sortedItems = useMemo(() => {
    if (!sortDescriptor.column) return items;
    
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof T];
      const second = b[sortDescriptor.column as keyof T];
      
      if (first === undefined || second === undefined) return 0;
      
      const cmp = (() => {
        if (typeof first === 'string' && typeof second === 'string') {
          // Handle date strings safely
          if (first.match(/^\d{4}-\d{2}-\d{2}/) || first.match(/^\d{4}-\d{2}-\d{2}T/)) {
            const date1 = new Date(first);
            const date2 = new Date(second);
            if (!isNaN(date1.getTime()) && !isNaN(date2.getTime())) {
              return date1.getTime() - date2.getTime();
            }
          }
          return first.localeCompare(second);
        }
        
        // Handle actual Date objects with type checking
        if (
          first instanceof Date && second instanceof Date
        ) {
          return first.getTime() - second.getTime();
        }
        
        if (typeof first === 'number' && typeof second === 'number') {
          return first - second;
        }
        
        return String(first).localeCompare(String(second));
      })();

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  // Handlers
  const handleSortChange = useCallback(
    (descriptor: SortDescriptor) => {
      setSortDescriptor(descriptor);
      onSortChange?.(descriptor);
    },
    [onSortChange]
  );

  const handleSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedKeys(keys);
      onSelectionChange?.(keys);
    },
    [onSelectionChange]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilterValue(value);
      setPage(1);
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  const handleClearSearch = useCallback(() => {
    setFilterValue('');
    onSearchChange?.('');
  }, [onSearchChange]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  const handleRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRowsPerPage = Number(e.target.value);
      setRowsPerPage(newRowsPerPage);
      setPage(1);
      onRowsPerPageChange?.(newRowsPerPage);
    },
    [onRowsPerPageChange]
  );

  return {
    // Data
    originalData: data,
    filteredItems,
    items: sortedItems,
    setData,
    
    // State
    filterValue,
    selectedKeys,
    visibleColumns,
    rowsPerPage,
    sortDescriptor,
    page,
    pages,
    headerColumns,
    hasSearchFilter,
    
    // Handlers
    handleSortChange,
    handleSelectionChange,
    handleSearchChange,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    setVisibleColumns,
  };
} 