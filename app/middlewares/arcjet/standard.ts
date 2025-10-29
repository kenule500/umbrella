import arcjet, { detectBot, shield } from "@/lib/arcjet"
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs"
import { base } from "../base"

const buildStandardAj = () => 
    arcjet.withRule(
        shield({
            mode: "LIVE"
        })
    ).withRule(
        detectBot({
            mode: "LIVE",
            allow: [
                "CATEGORY:SEARCH_ENGINE",
                "CATEGORY:PREVIEW",
                "CATEGORY:MONITOR",
            ],
        })
    )


export const standardSecurityMiddleWare = base.$context<{
    request?: Request, user?: KindeUser<Record<string, unknown>>
    }>().middleware(async ({context, next, errors}) => {
    const req = context.request;
    if (!req) {
        throw errors.BAD_REQUEST({ message: "Request is required for this middleware" });
    }

    const decision = await buildStandardAj().protect(req, {
        userId: context.user?.id ?? '',
    });

    const isDenied = typeof decision.isDenied === 'function' ? decision.isDenied() : !!decision.isDenied;

    if (isDenied) {
        if (decision.reason && typeof decision.reason.isBot === 'function' && decision.reason.isBot()) {
            throw errors.FORBIDDEN({ message: "Automated traffic is not allowed" });
        }

        if (decision.reason && typeof decision.reason.isShield === 'function' && decision.reason.isShield()) {
            throw errors.FORBIDDEN({ message: "Access denied due to suspicious activity (WAF)" });
        }

        throw errors.FORBIDDEN({ message: "Request denied" });
    }

    return next();
})

