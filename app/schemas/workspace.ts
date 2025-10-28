import {z} from "zod";

export const workspaceSchema =  z.object({
    name: z.string().min(2).max(50, 'Name too long')
})

export type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;