// src/pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Define form schema
const formSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  
  const from = location.state?.from || "/";

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const user = await login(data.email, data.password);
      
      // Si l'utilisateur est admin, rediriger vers le tableau de bord admin
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin');
      } else {
        // Sinon rediriger vers la page précédente ou la page d'accueil
        navigate(from === "/admin" ? "/" : from);
      }
    } catch (error) {
      // Géré par le contexte d'authentification
      console.error('Login failed:', error);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <AuthLayout
      title="Connexion"
      description="Connectez-vous à votre compte pour accéder à vos commandes et favoris."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="votre@email.fr" 
                    type="email" 
                    autoComplete="email"
                    disabled={loading}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Mot de passe</FormLabel>
                  <Link 
                    to="/auth/forgot-password" 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Votre mot de passe" 
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={loading}
                      {...field} 
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas de compte ?{" "}
          <Link to="/auth/register" className="text-primary hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
      
      {/* <div className="mt-8 p-4 bg-muted rounded-md">
        <p className="text-sm text-center font-medium">Accès administrateur</p>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Utilisez admin@admin.com avec n'importe quel mot de passe pour accéder à l'interface d'administration.
        </p>
      </div> */}
    </AuthLayout>
  );
};

export default Login;