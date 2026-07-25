export type ToolCategory = 'media' | 'admin' | 'bisnis' | 'sosial';

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  badge?: string;
  iconName: string; // Dynamic Lucide icon lookup
  isNew?: boolean;
  reverseOf?: string; // Links to the reverse/complementary tool ID if applicable
  requiresCamera?: boolean;
  requiresLocation?: boolean;
}

export interface ToolGroup {
  id: ToolCategory;
  name: string;
  description: string;
  iconName: string;
}
