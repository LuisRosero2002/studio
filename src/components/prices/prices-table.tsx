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
  Activo: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300",
  Inactivo: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300",
}

const typeColors: Record<PriceItemType, string> = {
    Hardware: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300",
    Servicio: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-300",
    Instalación: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300",
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

export function PricesTable() {
  const { firestore, user } = useFirebase();
  
  const priceItemsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'priceItems'));
  }, [user, firestore]);

  const { data: items, isLoading } = useCollection<PriceItem>(priceItemsQuery);
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<PriceItemType | "all">("all");
  const [solutionFilter, setSolutionFilter] = React.useState<string | "all">("all");
  
  const uniqueSolutions = React.useMemo(() => {
    if (!items) return [];
    const solutionSet = new Set(items.map(item => item.solution));
    return Array.from(solutionSet);
  }, [items]);

  const filteredItems = React.useMemo(() => {
    let filtered = items ?? [];
    
    if (searchTerm) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    if (solutionFilter !== "all") {
      filtered = filtered.filter(item => item.solution === solutionFilter);
    }

    return filtered;
  }, [items, searchTerm, typeFilter, solutionFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Precios</CardTitle>
        <CardDescription>Todos los ítems de precios registrados en el sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as PriceItemType | "all")}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Tipos</SelectItem>
              <SelectItem value="Hardware">Hardware</SelectItem>
              <SelectItem value="Servicio">Servicio</SelectItem>
              <SelectItem value="Instalación">Instalación</SelectItem>
            </SelectContent>
          </Select>
          <Select value={solutionFilter} onValueChange={(value) => setSolutionFilter(value as string | "all")}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Filtrar por solución" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Soluciones</SelectItem>
              {uniqueSolutions.map(solution => (
                <SelectItem key={solution} value={solution}>{solution}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Ítem</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Precio Base</TableHead>
              <TableHead className="hidden md:table-cell">Unidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Última Actualización</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
            ))}
            {!isLoading && filteredItems.map((item) => {
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border", typeColors[item.type])}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatCurrency(item.basePrice)}</TableCell>
                   <TableCell className="hidden md:table-cell">{item.unit}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border", statusColors[item.status])}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(item.lastUpdatedAt), 'd MMM, yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {!isLoading && filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No se encontraron ítems que coincidan con tus filtros.
            </div>
        )}
      </CardContent>
    </Card>
  )
}
