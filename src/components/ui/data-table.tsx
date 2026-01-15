"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    PaginationState,
    OnChangeFn,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"
import { useDebounce } from "@/hooks/use-debounce"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageCount: number
    currentPage: number
    totalItems: number
    searchable?: boolean
    searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    currentPage,
    totalItems,
    searchable = true,
    searchPlaceholder = "Cari...",
}: DataTableProps<TData, TValue>) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Handle Search
    const [searchValue, setSearchValue] = useState(searchParams.get("query") || "")
    const debouncedSearch = useDebounce(searchValue, 300)

    useEffect(() => {
        // Only update if the value is different from URL to avoid loop
        const currentQuery = searchParams.get("query") || ""
        if (debouncedSearch === currentQuery) return

        const params = new URLSearchParams(searchParams)
        if (debouncedSearch) {
            params.set("query", debouncedSearch)
        } else {
            params.delete("query")
        }
        // Reset to page 1 on search
        params.set("page", "1")

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
        })
    }, [debouncedSearch, pathname, router, searchParams])

    // Handle Pagination
    const createQueryString = useCallback(
        (params: Record<string, string | number | null>) => {
            const newParams = new URLSearchParams(searchParams)

            for (const [key, value] of Object.entries(params)) {
                if (value === null) {
                    newParams.delete(key)
                } else {
                    newParams.set(key, String(value))
                }
            }

            return newParams.toString()
        },
        [searchParams]
    )

    const handlePageChange = (newPage: number) => {
        startTransition(() => {
            router.push(`${pathname}?${createQueryString({ page: newPage })}`)
        })
    }

    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount,
        state: {
            pagination: {
                pageIndex: currentPage - 1,
                pageSize: 10, // Default page size
            },
        },
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="space-y-4">
            {searchable && (
                <div className="flex items-center justify-between">
                    <div className="relative w-64 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Total {totalItems} data
                    </div>
                </div>
            )}

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(1)}
                    disabled={!table.getCanPreviousPage() || isPending}
                >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!table.getCanPreviousPage() || isPending}
                >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {pageCount}
                </div>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!table.getCanNextPage() || isPending}
                >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(pageCount)}
                    disabled={!table.getCanNextPage() || isPending}
                >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
