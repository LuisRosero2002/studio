'use client';

import * as React from "react"
import { MoreHorizontal, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PriceItem, PriceItemStatus, PriceItemType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Skeleton } from "../ui/skeleton"

const statusColors: Record<PriceItemStatus, string> = {
  Activo: "bg-green-100 text-green-800",
  Inactivo: "bg-red-100 text-red-800",
}

const typeColors: Record<PriceItemType, string> = {
    Hardware: "bg-blue-100 text-blue-800",
    Servicio: "bg-purple-100 text-purple-800",
    Instalación: "bg-yellow-100 text-yellow-800",
}

const formatCurrency = (amount: number, currency: string = 'COP') => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(amount);
}

export function PricesTable() {
  const { firestore } = useFirebase();
  
  const priceItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'priceItems'));
  }, [firestore]);

  const { data: items, isLoading } = useCollection<PriceItem>(priceItemsQuery);
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<PriceItemType | "all">("all");
  const [solutionFilter, setSolutionFilter] = React.useState<string>("all");
  
  const uniqueSolutions = React.useMemo(() => {
    if (!items) return [];
    const solutionSet = new Set(items.map(item => item.solution));
    return Array.from(solutionSet).filter(Boolean).sort();
  }, [items]);

  const filteredItems = React.useMemo(() => {
    let filtered = items ?? [];
    if (searchTerm) filtered = filtered.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (typeFilter !== "all") filtered = filtered.filter(item => item.type === typeFilter);
    if (solutionFilter !== "all") filtered = filtered.filter(item => item.solution === solutionFilter);
    return filtered;
  }, [items, searchTerm, typeFilter, solutionFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Precios</CardTitle>
        <CardDescription>Catálogo de componentes y servicios.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          
          <Select value={solutionFilter} onValueChange={setSolutionFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Solución" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las soluciones</SelectItem>
              {uniqueSolutions.map((solution) => (
                <SelectItem key={solution} value={solution}>
                  {solution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="Hardware">Hardware</SelectItem>
              <SelectItem value="Servicio">Servicio</SelectItem>
              <SelectItem value="Instalación">Instalación</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden sm:table-cell">Solución</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
            ))}
            {!isLoading && filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">{item.solution}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={cn(typeColors[item.type])}>{item.type}</Badge></TableCell>
                  <TableCell className="hidden sm:table-cell">{item.solution}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(item.basePrice, item.currency)}</TableCell>
                  <TableCell><Badge className={statusColors[item.status]}>{item.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
            ))}
            {!isLoading && filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No se encontraron ítems con los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}