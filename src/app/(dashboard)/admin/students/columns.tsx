"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Profile } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, KeyRound } from "lucide-react"

interface ColumnsProps {
    onEdit: (student: Profile) => void
    onDelete: (id: string) => void
    onResetPassword: (student: Profile) => void
}

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface ColumnsProps {
    onEdit: (student: Profile) => void
    onDelete: (id: string) => void
    onResetPassword: (student: Profile) => void
}

export const getColumns = ({ onEdit, onDelete, onResetPassword }: ColumnsProps): ColumnDef<Profile>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string || 'ACTIVE'
            const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                ACTIVE: "default",
                GRADUATED: "secondary",
                MOVED: "outline",
                DROPPED_OUT: "destructive"
            }
            const labels: Record<string, string> = {
                ACTIVE: "Aktif",
                GRADUATED: "Lulus",
                MOVED: "Pindah",
                DROPPED_OUT: "Keluar"
            }
            return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>
        },
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
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => onResetPassword(student)}
                    >
                        <KeyRound className="h-4 w-4" />
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
