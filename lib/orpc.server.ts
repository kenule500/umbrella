import 'server-only'

import { headers } from 'next/headers'
import { createRouterClient } from '@orpc/server'
import { router } from '@/app/router'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

globalThis.$client = createRouterClient(router, {
  /**
   * Provide initial context if needed.
   *
   * Because this client instance is shared across all requests,
   * only include context that's safe to reuse globally.
   * For per-request context, use middleware context or pass a function as the initial context.
   */
  context: async ({ headers: clientHeaders }) => {
    const headersList = await headers();
    
    // Create a Request object using the client's URL if available
    const url = clientHeaders?.get('referer') || 'http://localhost';
    const request = new Request(url, {
      headers: headersList
    });

    return {
      request
    };
  },
})

// Export server-side query utils for use in Server Components
export const orpcServer = createTanstackQueryUtils(globalThis.$client!)