"use client"

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Plus } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from "@/components/ui/form";
import { workspaceSchema, WorkspaceSchemaType } from '@/app/schemas/workspace';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { isDefinedError } from '@orpc/client';


type FormValues = z.infer<typeof workspaceSchema>;

function CreateWorkspace() {
    const [open, setOpen] = useState(false);
    const queryClinet = useQueryClient();

    const form = useForm<FormValues>({
      resolver: zodResolver(workspaceSchema),
      defaultValues: {
        name: ''
      }
    });

    const createWorkspaceMutation = useMutation(
      orpc.workspace.create.mutationOptions({
        onSuccess: (newWorkspace) => {
          toast.success(`Workspace ${newWorkspace.workspaceName} created successfully`);

          queryClinet.invalidateQueries({
            queryKey: orpc.workspace.list.queryKey(),
          });
          form.reset();
          setOpen(false);
        },
        onError: (error) => {
          if (isDefinedError(error)) {
            if (error.code === 'RATE_LIMITED') {
              toast.error(error.message);
              return;
            }
            toast.error(error.message);
            return;
          }
         toast.error("Failed to create workspace. Please try again.");
        },
      }
    ))

    function onSubmit(data: WorkspaceSchemaType) {
      createWorkspaceMutation.mutate(data)
    }

  return (
    <Dialog open={open} onOpenChange={setOpen }>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" 
              className='size-12 rounded-xl border-2 border-dashed border-muted-foreground/50 text-muted-foreground 
              hover:border-muted-foreground hover:text-foreground hover:rounded-lg transition-all duration-200'>
              <Plus className='size-5'/>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side='right' className="relative bg-white text-black text-sm font-medium rounded-md px-3 py-1.5 shadow-md ml-2">
            <p>Create Workspace</p>
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-white border-l border-t border-gray-200" />
        </TooltipContent>
      </Tooltip>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogTitle>Create Workspace</DialogTitle>
        <DialogDescription>
          Create a new workspace to collaborate with your team.
        </DialogDescription>
        <div className="mt-4">
          <Form {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Workspace Name" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button  disabled={createWorkspaceMutation.isPending}
                type="submit" 
                className="w-full"
                onClick={form.handleSubmit(onSubmit)}
              >
                {createWorkspaceMutation.isPending ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateWorkspace