"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Profile } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface ColumnsProps {
    onEdit: (student: Profile) => void
    onDelete: (id: string) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Profile>[] => [
    {
        accessorKey: "nisn",
        header: "NISN",
        cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("nisn") || '-'}</div>,
    },
    {
        accessorKey: "full_name",
        header: "Nama Lengkap",
        cell: ({ row }) => <div className="font-medium">{row.getValue("full_name")}</div>,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
        accessorKey: "phone",
        header: "No. HP",
        cell: ({ row }) => <div>{row.getValue("phone") || '-'}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const student = row.original
            return (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(student)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(student.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
