import arcjet, { slidingWindow } from "@/lib/arcjet"
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs"
import { base } from "../base"

const buildStandardAj = () => 
    arcjet.withRule(
        slidingWindow({
            mode: "LIVE",
            interval: "1m",
            max: 40
        })
    )
    


export const writeSecurityMiddleWare = base.$context<{
    request?: Request, user?: KindeUser<Record<string, unknown>>
    }>().middleware(async ({context, next, errors}) => {
    const req = context.request;
    if (!req) {
        throw errors.BAD_REQUEST({ message: "Request is required for this middleware" });
    }

    const decision = await buildStandardAj().protect(req, {
        userId: context.user?.id ?? '',
    });

    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            throw errors.RATE_LIMITED({
                message: "Too many requests. Please try again later."
            });
        }
        throw errors.FORBIDDEN({
            message: "Request denied"
        });
    }

    return next();
})

