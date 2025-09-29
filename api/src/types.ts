import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
  name: Str({ example: "lorem" }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: DateTime(),
});

// Firewall Logs API Types
export interface LogsRequest {
  apiToken: string;
  zoneId: string;
  queryParams?: {
    datetime_geq?: string; // Greater than or equal to (matches Cloudflare docs)
    datetime_leq?: string; // Less than or equal to (matches Cloudflare docs)
    limit?: number;
  };
}

export interface FirewallEventsAdaptiveFilter {
  datetime_geq?: string;
  datetime_leq?: string;
}

export interface FirewallEvent {
  action: string;
  clientAsn: string;
  clientCountryName: string;
  clientIP: string;
  clientRequestPath: string;
  clientRequestQuery: string;
  datetime: string;
  source: string;
  userAgent: string;
}

export interface LogsResponse {
  logs: FirewallEvent[];
}

export interface LogsErrorResponse {
  error: string;
  details?: unknown;
}

export interface GraphQLResponse {
  data?: {
    viewer: {
      zones: Array<{
        firewallEventsAdaptive: FirewallEvent[];
      }>;
    };
  };
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
  }>;
}
