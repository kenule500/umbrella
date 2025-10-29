import { KindeOrganization , KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import z from "zod";
import { base } from "../middlewares/base";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { workspaceSchema } from "../schemas/workspace";
import {init, Organizations} from "@kinde/management-api-js";
import { standardSecurityMiddleWare } from "../middlewares/arcjet/standard";
import { heavyWriteSecurityMiddleWare } from "../middlewares/arcjet/heavy-write";

export const listWorkspaces = base
.use(requiredAuthMiddleware)
.use(requiredWorkspaceMiddleware)
.route({
    method: "GET",
    path: "/workspaces",
    summary: "List all workspaces",
    tags: ["Workspace"],
    })
    .input(z.void())
    .output(z.object({
        workspaces: z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                avatar: z.string().optional(),
        })),
        user: z.custom<KindeUser<Record<string, unknown>>>(),
        currentWorkspace: z.custom<KindeOrganization<unknown> | null>(),
    }))
    .handler(async ({context, errors }) => {
        const {getUserOrganizations} = getKindeServerSession();
        const organizations = await getUserOrganizations();
        if(!organizations) {
            throw errors.FORBIDDEN;
        }

        const workspaces = organizations?.orgs?.map(org => ({
            id: org.code,
            name: org.name ?? "My Workspace",
            avatar: org.name?.charAt(0) ?? "M"
        })) ?? [];
        return {
            workspaces,
            user: context.user!,
            currentWorkspace: context.workspace,
        };
    });



    
export const createWorkspaces = base
.use(requiredAuthMiddleware)
.use(requiredWorkspaceMiddleware)
.use(standardSecurityMiddleWare)
.use(heavyWriteSecurityMiddleWare)
.route({
    method: "POST",
    path: "/workspaces",
    summary: "create a workspace",
    tags: ["Workspace"],
    })
    .input(workspaceSchema)
    .output(z.object({
        orgCode: z.string(),
        workspaceName: z.string(), 
    },
    ))
    .handler(async ({context, errors, input }) => {
        init();

        let data;
        try {
            data = await Organizations.createOrganization({
            requestBody: {
                name: input.name,
            }
        });
        } catch {
            throw errors.FORBIDDEN();
        }

        if(!data.organization?.code) {
            throw errors.FORBIDDEN({
                message: "Org code is not defined"
            });
        }
        try {
            await Organizations.addOrganizationUsers({
                orgCode: data.organization.code,
                requestBody: {
                    users: [
                        {
                            id: context.user.id,
                            roles: ["admin"]
                        }
                    ]
                }
            })
        } catch {
            throw errors.FORBIDDEN();
        }

        const {refreshTokens} = getKindeServerSession();
        await refreshTokens();

        return {
            orgCode: data.organization.code,
            workspaceName: input.name,
        };
    });