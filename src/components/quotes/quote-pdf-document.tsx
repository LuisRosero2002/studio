'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Quote, Lead, User, QuoteItem } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


// Estilos para el documento PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#fff',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#F97316',
    paddingBottom: 10,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  wigaLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F97316',
  },
  quoteInfo: {
    textAlign: 'right',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#555',
  },
  clientInfo: {
    marginTop: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientBox: {
    border: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '48%',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F97316',
    paddingBottom: 3,
    marginTop: 15,
  },
  table: {
    width: '100%',
    // marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  th: {
    padding: 6,
    fontWeight: 'bold',
    fontSize: 9,
  },
  td: {
    padding: 6,
    fontSize: 9,
  },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  totals: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalsBox: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {},
  totalValue: {
    fontWeight: 'bold',
  },
  finalTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F97316',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#888',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  emptySection: {
    fontSize: 9,
    color: '#888',
    padding: 10,
    textAlign: 'center',
  }
});

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

interface QuotePDFDocumentProps {
  quote: Quote;
  lead: Lead;
  user?: User;
}

const ItemsTable = ({ title, items }: { title: string; items: QuoteItem[] }) => {
    if (!items || items.length === 0) return null;
    return (
        <View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.th, styles.colDesc]}>Descripción</Text>
                    <Text style={[styles.th, styles.colQty]}>Cantidad</Text>
                    <Text style={[styles.th, styles.colPrice]}>Precio Unit.</Text>
                    <Text style={[styles.th, styles.colTotal]}>Total</Text>
                </View>
                {items.map((item, i) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={[styles.td, styles.colDesc]}>{item.description}</Text>
                        <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
                        <Text style={[styles.td, styles.colPrice]}>{formatCurrency(item.unitPrice)}</Text>
                        <Text style={[styles.td, styles.colTotal]}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};


export function QuotePDFDocument({ quote, lead, user }: QuotePDFDocumentProps) {
  const { subtotal, tax, total, hardwareItems, installationItems, serviceItems } = quote;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.wigaLogo}>WigaSales</Text>
            <Text>Calle Ficticia 123, Ciudad, País</Text>
            <Text>contacto@wigasales.com</Text>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={styles.title}>COTIZACIÓN</Text>
            <Text style={styles.subtitle}>#{quote.quoteNumber}</Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <View style={styles.clientBox}>
            <Text style={{fontWeight: 'bold', marginBottom: 5}}>CLIENTE:</Text>
            <Text>{lead.contactName}</Text>
            <Text>{lead.companyName}</Text>
            <Text>{lead.contactEmail}</Text>
            <Text>{lead.contactPhone}</Text>
          </View>
          <View style={styles.clientBox}>
            <Text style={{fontWeight: 'bold', marginBottom: 5}}>DETALLES:</Text>
            <Text>Fecha de Emisión: {format(new Date(quote.issueDate), 'd MMM, yyyy', { locale: es })}</Text>
            <Text>Válida Hasta: {format(new Date(quote.validUntil), 'd MMM, yyyy', { locale: es })}</Text>
            <Text>Solución: {quote.solution}</Text>
            {user && <Text>Preparado por: {user.name}</Text>}
          </View>
        </View>
        
        <ItemsTable title="Equipos (Hardware)" items={hardwareItems} />
        <ItemsTable title="Costos de Implementación" items={installationItems} />
        <ItemsTable title="Servicios Adicionales" items={serviceItems} />

        {/* Totals */}
        <View style={styles.totals}>
            <View style={styles.totalsBox}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>IVA (16%):</Text>
                    <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
                </View>
                 <View style={[styles.totalRow, {marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#F97316'}]}>
                    <Text style={[styles.totalLabel, styles.finalTotal]}>TOTAL:</Text>
                    <Text style={[styles.totalValue, styles.finalTotal]}>{formatCurrency(total)}</Text>
                </View>
            </View>
        </View>


        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Gracias por su interés en nuestros productos y servicios.</Text>
          <Text>WigaSales - Transformando el futuro del agro.</Text>
        </View>
      </Page>
    </Document>
  );
}
