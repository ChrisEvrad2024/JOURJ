import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/**
 * En-tête standardisé pour les pages d'administration
 */
const AdminHeader = ({ title, description, children }: AdminHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="border-b pb-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin
            </Badge>
          </div>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {children}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;