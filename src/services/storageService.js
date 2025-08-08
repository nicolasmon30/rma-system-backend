const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

class StorageService {
  constructor() {
    this.bucketName = 'rma-files'; // Tu bucket name
  }

  async uploadQuotation(file) {
    return this._uploadFile(file, 'quotations');
  }

  async uploadInvoice(file) {
    return this._uploadFile(file, 'invoices');
  }

  async _uploadFile(file, folder) {
    try {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `quotations/${Date.now()}.${fileExt}`;

       const fileBuffer = fs.readFileSync(file.path);

      // Subir el archivo
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
          duplex: 'half'
        });

      if (error) throw error;

      // Generar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      // Eliminar archivo temporal
      fs.unlinkSync(file.path);

      return publicUrl;
    } catch (error) {
      console.error(`Error subiendo archivo a ${folder}:`, error);
      throw new Error(`Error al subir el archivo a ${folder}`);
    }
  }

  async deleteFile(url) {
    try {
      // Extraer la ruta del archivo desde la URL
      const filePath = new URL(url).pathname.split(`${this.bucketName}/`)[1];
      
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw new Error('Error al eliminar el archivo');
    }
  }
}

module.exports = new StorageService();