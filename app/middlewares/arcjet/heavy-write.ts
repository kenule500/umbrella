import arcjet, { slidingWindow } from "@/lib/arcjet"
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs"
import { base } from "../base"

const buildStandardAj = () => 
    arcjet.withRule(
        slidingWindow({
            mode: "LIVE",
            interval: "1m",
            max: 2
        })
    )
    


export const heavyWriteSecurityMiddleWare = base.$context<{
    request?: Request, user?: KindeUser<Record<string, unknown>>
    }>().middleware(async ({context, next, errors}) => {
    const req = context.request;
    if (!req) {
        throw errors.BAD_REQUEST({ message: "Request is required for this middleware" });
    }

    const decision = await buildStandardAj().protect(req, {
        userId: context.user?.id ?? '',
    });

    // Normalize isDenied (Arcjet API exposes it as a function)
    const isDenied = typeof decision.isDenied === 'function' ? decision.isDenied() : !!decision.isDenied;

    if (isDenied) {
        // If Arcjet signals a rate limit specifically, throw the rate-limit error
        if (decision.reason && typeof decision.reason.isRateLimit === 'function' && decision.reason.isRateLimit()) {
            throw errors.RATE_LIMITED({
                message: "Too many requests. Please try again later."
            });
        }

        // Fallback: generic forbidden
        throw errors.FORBIDDEN({
            message: "Request denied"
        });
    }

    return next();
})

