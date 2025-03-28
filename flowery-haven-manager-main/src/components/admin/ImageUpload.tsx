import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

/**
 * Composant de gestion d'upload d'images pour les produits
 * Supporte à la fois l'upload de fichiers et l'ajout d'URLs externes
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  images = [],
  onImagesChange,
  maxImages = 5,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ajouter une image par URL
  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;

    // Vérifier si on a déjà atteint le nombre max d'images
    if (images.length >= maxImages) {
      toast.error(`Vous ne pouvez pas ajouter plus de ${maxImages} images`);
      return;
    }

    // Vérifier si l'URL est valide
    try {
      new URL(imageUrl);
    } catch (e) {
      toast.error("URL invalide");
      return;
    }

    // Ajouter l'image seulement si elle n'est pas déjà présente
    if (!images.includes(imageUrl)) {
      const newImages = [...images, imageUrl];
      onImagesChange(newImages);
      setImageUrl("");
    } else {
      toast.error("Cette image est déjà dans la galerie");
    }
  };

  // Supprimer une image
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  // Déclencher le sélecteur de fichier
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Gérer l'upload de fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Vérifier si on a déjà atteint le nombre max d'images
    if (images.length + files.length > maxImages) {
      toast.error(`Vous ne pouvez pas ajouter plus de ${maxImages} images`);
      return;
    }

    setIsUploading(true);

    try {
      // Convertir les fichiers en base64
      // Dans une application réelle, vous utiliseriez un service de stockage cloud
      const newImagePromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => {
            reject(new Error("Failed to read file"));
          };
          reader.readAsDataURL(file);
        });
      });

      const newImages = await Promise.all(newImagePromises);
      onImagesChange([...images, ...newImages]);

      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(
        `${newImages.length} image${newImages.length > 1 ? "s" : ""} ajoutée${
          newImages.length > 1 ? "s" : ""
        }`
      );
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Erreur lors de l'upload des images");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">
        Images du produit ({images.length}/{maxImages})
      </label>

      {/* Galerie d'images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative group aspect-square border rounded-md overflow-hidden"
            >
              <img
                src={src}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Méthodes d'ajout d'images */}
      <div className="space-y-4">
        {/* Upload de fichier */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading || images.length >= maxImages}
          />
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleFileButtonClick}
            disabled={isUploading || images.length >= maxImages}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload d'images
              </>
            )}
          </Button>
        </div>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Ou</span>
          </div>
        </div>

        {/* Ajout par URL */}
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://exemple.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={images.length >= maxImages}
          />
          <Button
            variant="outline"
            type="button"
            onClick={handleAddImageUrl}
            disabled={!imageUrl.trim() || images.length >= maxImages}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Message si max atteint */}
      {images.length >= maxImages && (
        <p className="text-sm text-amber-600">
          Vous avez atteint le nombre maximum d'images ({maxImages})
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
