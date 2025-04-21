import { SVGProps } from "react";
import { z } from 'zod';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type ActionResultSuccess<T = {}> = {
  success: true;
  error?: never;
  validationErrors?: never;
} & T;

export type ActionResultError = {
  success: false;
  error?: string;
  validationErrors?: Record<string, string[]>;
};

export type ActionResult<T = {}> = ActionResultSuccess<T> | ActionResultError;

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
