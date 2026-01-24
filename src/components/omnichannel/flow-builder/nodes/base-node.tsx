/**
 * BaseNode - Componente base para todos os nós customizados
 */

import { memo, type ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { MoreVertical, Copy, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useFlowBuilderStore } from '../store';

export interface BaseNodeData {
  label: string;
  description?: string;
  [key: string]: unknown;
}

export interface BaseNodeProps {
  id: string;
  data: BaseNodeData;
  selected?: boolean;
  type?: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor?: string;
  children?: ReactNode;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  sourceHandles?: { id: string; label?: string; position?: 'bottom' | 'right' }[];
  targetHandles?: { id: string; label?: string; position?: 'top' | 'left' }[];
}

function BaseNodeComponent({
  id,
  data,
  selected,
  icon,
  iconBgColor,
  iconColor = 'text-white',
  children,
  showSourceHandle = true,
  showTargetHandle = true,
  sourceHandles,
  targetHandles,
  type,
}: BaseNodeProps) {
  const { deleteNode, duplicateNode, selectNode } = useFlowBuilderStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(id);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-lg border-2 min-w-[220px] max-w-[280px] transition-all duration-200',
        selected
          ? 'border-green-500 ring-4 ring-green-500/20 shadow-green-500/20'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xl'
      )}
      onClick={() => selectNode(id)}
    >
      {/* Target Handle(s) */}
      {showTargetHandle && !targetHandles && type !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-4 !h-4 !bg-slate-400 !border-2 !border-white !-top-2"
        />
      )}
      {targetHandles?.map((handle, idx) => (
        <Handle
          key={handle.id}
          type="target"
          position={handle.position === 'left' ? Position.Left : Position.Top}
          id={handle.id}
          className={cn(
            '!w-3 !h-3 !bg-slate-400 !border-2 !border-white',
            handle.position === 'left' ? '!-left-1.5' : '!-top-1.5'
          )}
          style={
            handle.position === 'left'
              ? { top: `${((idx + 1) / (targetHandles.length + 1)) * 100}%` }
              : { left: `${((idx + 1) / (targetHandles.length + 1)) * 100}%` }
          }
        />
      ))}

      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-slate-100">
        <div
          className={cn(
            'p-2 rounded-lg shadow-sm',
            iconBgColor,
            iconColor
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 truncate">
            {data.label}
          </p>
          {data.description && (
            <p className="text-xs text-slate-500 truncate">
              {data.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      {children && (
        <div className="p-3 space-y-2">
          {children}
        </div>
      )}

      {/* Source Handle(s) */}
      {showSourceHandle && !sourceHandles && type !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-4 !h-4 !bg-green-500 !border-2 !border-white !-bottom-2"
        />
      )}
      {sourceHandles?.map((handle, idx) => (
        <div
          key={handle.id}
          className={cn(
            'absolute flex items-center gap-1',
            handle.position === 'right'
              ? 'right-0 translate-x-full pr-1'
              : 'bottom-0 translate-y-full left-0 right-0'
          )}
          style={
            handle.position === 'right'
              ? { top: `${((idx + 1) / (sourceHandles.length + 1)) * 100}%`, transform: 'translateY(-50%)' }
              : { left: `${((idx + 1) / (sourceHandles.length + 1)) * 100}%` }
          }
        >
          {handle.label && handle.position === 'right' && (
            <span className="text-[10px] text-slate-400 mr-1">{handle.label}</span>
          )}
          <Handle
            type="source"
            position={handle.position === 'right' ? Position.Right : Position.Bottom}
            id={handle.id}
            className={cn(
              '!w-3 !h-3 !bg-green-500 !border-2 !border-white !relative !transform-none !top-auto !left-auto',
              handle.position === 'right' ? '' : '!-bottom-1.5'
            )}
          />
          {handle.label && handle.position !== 'right' && (
            <span className="text-[10px] text-slate-400 ml-1">{handle.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export const BaseNode = memo(BaseNodeComponent);
