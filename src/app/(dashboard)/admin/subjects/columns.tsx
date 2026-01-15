"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Subject } from "@/types/database"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface ColumnsProps {
    onEdit: (subject: Subject) => void
    onDelete: (id: string) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Subject>[] => [
    {
        accessorKey: "code",
        header: "Kode",
        cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("code")}</div>,
    },
    {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
            <div className="text-slate-500 max-w-xs truncate">
                {row.getValue("description") || '-'}
            </div>
        ),
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                {row.original.is_active ? 'Aktif' : 'Nonaktif'}
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const subject = row.original
            return (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(subject)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(subject.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
