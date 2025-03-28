import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import ImageUploadService from "@/services/ImageUploadService";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images = [],
  onChange,
  maxImages = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const totalFilesToUpload = newFiles.length;
    let uploadedCount = 0;
    const newImages: string[] = [...images];

    // Vérifier si le nombre maximum d'images sera dépassé
    if (newImages.length + newFiles.length > maxImages) {
      toast.error(`Vous ne pouvez pas ajouter plus de ${maxImages} images`, {
        description: `Veuillez supprimer des images existantes avant d'en ajouter de nouvelles.`,
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      for (const file of newFiles) {
        // Vérification du type de fichier
        if (!file.type.startsWith("image/")) {
          toast.error("Format non supporté", {
            description: `Le fichier ${file.name} n'est pas une image valide.`,
          });
          continue;
        }

        // Vérification de la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Fichier trop volumineux", {
            description: `L'image ${file.name} dépasse la taille maximale de 5MB.`,
          });
          continue;
        }

        try {
          const imageUrl = await ImageUploadService.uploadImage(file);
          newImages.push(imageUrl);
          uploadedCount++;
          setProgress((uploadedCount / totalFilesToUpload) * 100);
        } catch (error) {
          console.error("Erreur lors de l'upload de l'image:", error);
          toast.error("Échec de l'upload", {
            description: `Impossible d'uploader l'image ${file.name}.`,
          });
        }
      }

      // Mise à jour des images
      onChange(newImages);

      if (uploadedCount > 0) {
        toast.success("Images ajoutées", {
          description: `${uploadedCount} image(s) ont été ajoutées avec succès.`,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'upload des images:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'upload des images.",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];
    const newImages = images.filter((_, index) => index !== indexToRemove);

    // Mettre à jour l'état immédiatement pour une meilleure UX
    onChange(newImages);

    // Supprimer l'image du service
    try {
      await ImageUploadService.deleteImage(imageToRemove);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      // On ne restaure pas l'image dans l'UI même si la suppression échoue
      // car cela pourrait être déroutant pour l'utilisateur
    }
  };

  const handleDragImage = (dragIndex: number, hoverIndex: number) => {
    // Réorganiser les images
    const draggedImage = images[dragIndex];
    const newImages = [...images];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium">
            Images du produit{" "}
            {images.length > 0 && `(${images.length}/${maxImages})`}
          </label>
          {isUploading && (
            <span className="text-xs text-muted-foreground">
              Upload en cours... {Math.round(progress)}%
            </span>
          )}
        </div>

        {/* Zone d'upload */}
        <div
          className={`border-2 border-dashed rounded-md p-4 text-center ${
            isUploading
              ? "bg-muted border-primary/50"
              : "hover:bg-muted/50 hover:border-primary/50"
          } transition-colors`}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading || images.length >= maxImages}
            className="hidden"
            id="product-images"
          />

          <label
            htmlFor="product-images"
            className="flex flex-col items-center justify-center cursor-pointer py-3"
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {isUploading
                ? "Upload en cours..."
                : "Cliquez ou glissez des images ici"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG ou GIF • Max {maxImages} images • 5MB max par image
            </p>

            {images.length >= maxImages && (
              <p className="text-xs text-amber-500 mt-2">
                Nombre maximum d'images atteint ({maxImages}).
              </p>
            )}
          </label>

          {isUploading && (
            <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Prévisualisation des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="aspect-square relative group border rounded-md overflow-hidden"
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}

          {images.length < maxImages && (
            <label
              htmlFor="product-images"
              className="aspect-square border border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <Plus className="h-6 w-6 mb-1" />
              <span className="text-xs">Ajouter</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
