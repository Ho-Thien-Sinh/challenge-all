import { supabase } from './supabase';

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    // 1. Create unique filename with UUID
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    console.log('Đang tải lên file:', fileName);
    
    // 2. Upload file to storage
    const { data, error } = await supabase.storage
      .from('article-images') // Tên bucket trong Supabase Storage
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Lỗi khi tải lên file:', error);
      throw new Error(`Không thể tải file lên: ${error.message}`);
    }
    
    console.log('Tải lên thành công:', data);
    
    // 3. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);
    
    if (!publicUrl) {
      throw new Error('Không thể lấy URL công khai của file');
    }
    
    console.log('Public URL:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('Lỗi trong quá trình tải lên file:', error);
    throw error;
  }
};

export const deleteFile = async (url: string): Promise<boolean> => {
  try {
    // Get file name from URL
    const fileName = url.split('/').pop();
    if (!fileName) return false;
    
    const { error } = await supabase.storage
      .from('article-images')
      .remove([fileName]);
    
    if (error) {
      console.error('Lỗi khi xóa file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa file:', error);
    return false;
  }
};
