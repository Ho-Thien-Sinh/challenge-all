import { Request, Response } from 'express';
import { supabase } from '../services/supabase.js';

// Lấy danh sách tất cả danh mục
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo mới danh mục
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, is_active = true } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([
        { 
          name, 
          slug, 
          description,
          is_active,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Category with this slug already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy thông tin chi tiết danh mục
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, is_active } = req.body;
    
    const updates: any = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (slug) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(data);
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Category with this slug already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Xóa danh mục
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
