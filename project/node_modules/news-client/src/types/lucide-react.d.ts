declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export interface LucideIconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
  }

  export const Pencil: FC<LucideIconProps>;
  export const Trash2: FC<LucideIconProps>;
  export const Save: FC<LucideIconProps>;
  export const X: FC<LucideIconProps>;
  export const User: FC<LucideIconProps>;
}
