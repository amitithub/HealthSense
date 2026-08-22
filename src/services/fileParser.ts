export interface ParsedFileResult {
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  extractedText: string;
  isImage: boolean;
  isPdf: boolean;
  isTextOrJson: boolean;
}

export class FileParserService {
  /**
   * Reads any uploaded file and converts it to a standard parsed representation
   */
  static async parseUploadedFile(file: File): Promise<ParsedFileResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const dataUrl = (e.target?.result as string) || '';
          const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|bmp|dcm|dicom)$/i.test(file.name);
          const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
          const isTextOrJson =
            file.type.startsWith('text/') ||
            file.type === 'application/json' ||
            /\.(txt|json|csv|tsv|md|log|xml)$/i.test(file.name);

          let extractedText = '';

          if (isTextOrJson) {
            // For text/json/csv files, read the actual string content
            extractedText = await this.readAsText(file);
          } else {
            // Context header for images and PDFs
            extractedText = `File Name: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nFormat: ${file.type || 'Binary'}\nUploaded for clinical report tracking.`;
          }

          resolve({
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            dataUrl,
            extractedText,
            isImage,
            isPdf,
            isTextOrJson,
          });
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);

      // Read as Data URL so it can be previewed in img / iframe / embed
      reader.readAsDataURL(file);
    });
  }

  private static readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const textReader = new FileReader();
      textReader.onload = (e) => resolve((e.target?.result as string) || '');
      textReader.onerror = (e) => reject(e);
      textReader.readAsText(file);
    });
  }

  /**
   * Helper to format bytes into readable KB/MB
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
