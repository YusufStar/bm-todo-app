import { SVGProps } from "react";
import { z } from 'zod';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface ActionResult<T = {}> {
  success: boolean;
  error?: string;
  validationErrors?: Record<string, string[]>;
} & (
  { success: true } & T | 
  { success: false }
);

export interface PaginationResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export type ServerErrorResponse = {
  error: string;
  field?: string;
};
