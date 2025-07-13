import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export interface OrderData {
  id: string;
  name: string;
  supplier: {
    name: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  status: string;
  requestedBy: string;
  deliveryCost: number;
  totalAmount: number;
  notes?: string | null;
  createdAt: Date;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string | null;
  }>;
}

export class WordDocumentGenerator {
  private templatePath: string;

  constructor(templatePath: string) {
    this.templatePath = templatePath;
  }

  async generateOrderDocument(orderData: OrderData): Promise<Buffer> {
    try {
      // Read the Word template file
      const content = fs.readFileSync(this.templatePath, 'binary');
      
      // Create a new zip instance
      const zip = new PizZip(content);
      
      // Create a new docxtemplater instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Prepare data for the template
      const templateData = {
        // Order basic info
        orderName: orderData.name,
        orderId: orderData.id,
        orderDate: orderData.createdAt.toLocaleDateString('en-GB'),
        requestedBy: orderData.requestedBy,
        status: orderData.status,
        
        // Supplier information
        supplierName: orderData.supplier.name,
        supplierContact: orderData.supplier.contactName || '',
        supplierEmail: orderData.supplier.email || '',
        supplierPhone: orderData.supplier.phone || '',
        supplierAddress: orderData.supplier.address || '',
        
        // Financial information
        deliveryCost: orderData.deliveryCost.toFixed(2),
        subtotal: (orderData.totalAmount - orderData.deliveryCost).toFixed(2),
        totalAmount: orderData.totalAmount.toFixed(2),
        
        // Notes
        notes: orderData.notes || '',
        
        // Items array for looping in template
        items: orderData.items.map((item, index) => ({
          itemNumber: index + 1,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          totalPrice: item.totalPrice.toFixed(2),
          notes: item.notes || ''
        }))
      };

      // Set the data in the template
      doc.setData(templateData);

      try {
        // Render the document
        doc.render();
      } catch (error) {
        console.error('Error rendering document:', error);
        throw new Error('Failed to render the Word document template');
      }

      // Generate the document buffer
      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      return buffer;
    } catch (error) {
      console.error('Error generating Word document:', error);
      throw new Error('Failed to generate the Word document');
    }
  }

  static getDefaultTemplateVariables(): string[] {
    return [
      // Order Information
      '{orderName}',
      '{orderId}',
      '{orderDate}',
      '{requestedBy}',
      '{status}',
      
      // Supplier Information
      '{supplierName}',
      '{supplierContact}',
      '{supplierEmail}',
      '{supplierPhone}',
      '{supplierAddress}',
      
      // Financial Information
      '{deliveryCost}',
      '{subtotal}',
      '{totalAmount}',
      
      // Notes
      '{notes}',
      
      // Items (for table loops)
      '{#items}',
      '{itemNumber}',
      '{name}',
      '{quantity}',
      '{unitPrice}',
      '{totalPrice}',
      '{notes}',
      '{/items}'
    ];
  }
}

export default WordDocumentGenerator;
