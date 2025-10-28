"use client"

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip'
import { orpc } from '@/lib/orpc.client';
import { cn } from '@/lib/utils';
import { LoginLink } from '@kinde-oss/kinde-auth-nextjs/components';
import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react'

const colorCombinations = [
  'bg-blue-500 hover:bg-blue-600 text-white',
  'bg-emerald-500 hover:bg-emerald-600 text-white',
  'bg-purple-500 hover:bg-purple-600 text-white', 
  'bg-amber-500 hover:bg-amber-600 text-white',   
  'bg-rose-500 hover:bg-rose-600 text-white',
  'bg-indigo-500 hover:bg-indigo-600 text-white',
  'bg-cyan-500 hover:bg-cyan-600 text-white',
  'bg-pink-500 hover:bg-pink-600 text-white',
];

const getWorkspaceColor = (id: string) => {
    const charSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorIndex = charSum % colorCombinations.length;
     return colorCombinations[colorIndex];
}

function WorkspaceList() {
    const {data:{workspaces, currentWorkspace}} = useSuspenseQuery(orpc.workspace.list.queryOptions());
    
  return (
    <TooltipProvider>
        <div className='flex flex-col gap-2'>
            {workspaces.map((ws) => {
                const isActive = currentWorkspace?.orgCode === ws.id;
                return(
                    <Tooltip key={ws.id}>
                        <TooltipTrigger asChild>
                           <LoginLink orgCode={ws.id}>
                              <Button size="icon" 
                                className={cn('size-12 transition-all duration-200', getWorkspaceColor(ws.id),
                                    isActive ? "roiunded-lg" : "rounded-xl hover:rounded-lg"
                                )}
                                >
                                    <span className='text-sm font-semibold'>{ws.avatar}</span>
                            </Button>
                           </LoginLink>
                        </TooltipTrigger>
                        <TooltipContent side='right' className="relative bg-white text-black text-sm font-medium rounded-md px-3 py-1.5 shadow-md ml-2">
                            <p>{ws.name} {isActive && "(Current)"}</p>
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-white border-l border-t border-gray-200" />
                        </TooltipContent>
                    </Tooltip>
                )
            })}
        </div>
    </TooltipProvider>
  );
}

export default WorkspaceList