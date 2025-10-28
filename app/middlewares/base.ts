import { os } from "@orpc/server";

export const base = os.$context<{request: Request}>().errors({
    RATE_LIMIT_EXCEEDED: { status: 429, message: "You are being rate limited." },
    BAD_REQUEST: { status: 400, message: "Bad request." },
    NOT_FOUND: { status: 404, message: "Resource not found." },
    FORBIDDEN: { status: 403, message: "You do not have permission to access this resource." },
    UNAUTHORIZED: { status: 401, message: "You are not authorized to access this resource." },
    INTERNAL_SERVER_ERROR: { status: 500, message: "An internal server error occurred." },
})