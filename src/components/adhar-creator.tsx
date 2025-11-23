
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { refineDetailsAction } from "@/app/actions.ts";
import { adharSchema, type AdharFormData } from "@/schemas/adhar-schema";

import AdharForm from "@/components/adhar-form";
import AdharCardPreview from "@/components/adhar-card-preview";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export default function AdharCreator() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<'name' | 'address' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  const methods = useForm<AdharFormData>({
    resolver: zodResolver(adharSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      adharNumber: '',
      address: '',
      gender: undefined,
      dob: undefined,
      fontSize: 10,
      showQrCode: true,
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            variant: "destructive",
            title: "Image too large",
            description: "Please upload an image smaller than 2MB.",
        });
        e.target.value = ''; // Reset file input
        return;
      }
      const newPhotoUrl = URL.createObjectURL(file);
      setPhotoUrl(newPhotoUrl);
      methods.setValue('photo', e.target.files, { shouldValidate: true });
    }
  };

  useEffect(() => {
    // Cleanup blob URL
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);


  const handleRefine = async (field: 'name' | 'address') => {
    setAiLoading(field);
    const { getValues, setValue } = methods;
    const { name, address } = getValues();
    try {
      const result = await refineDetailsAction({ name, address });
      if (result) {
        setValue('name', result.refinedName, { shouldValidate: true, shouldDirty: true });
        setValue('address', result.refinedAddress, { shouldValidate: true, shouldDirty: true });
        toast({
          title: "Content Refined",
          description: "The details have been successfully refined by AI.",
        });
      } else {
        throw new Error("AI refinement failed.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not refine details. Please try again.",
      });
    } finally {
      setAiLoading(null);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const { getValues } = methods;
    const { name } = getValues();
    
    // Using dynamic imports for code splitting
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    
    const input = document.getElementById('adhar-preview');
    if (!input) {
      toast({ variant: "destructive", title: "Error", description: "Preview element not found." });
      setIsDownloading(false);
      return;
    }

    try {
       // A4 size in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const canvas = await html2canvas(input, { 
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: true,
        width: input.offsetWidth,
        height: input.offsetHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      
      // Aadhar card standard size is 85.6mm x 53.98mm.
      // The generated preview contains two parts, so height is doubled.
      const cardWidth = 85.6;
      const cardHeight = (imgProps.height * cardWidth) / imgProps.width;
      
      // Center the card on the A4 page
      const x = (pdf.internal.pageSize.getWidth() - cardWidth) / 2;
      const y = (pdf.internal.pageSize.getHeight() - cardHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);
      pdf.save(`${name.replace(/\s/g, '_') || 'adhar'}_card.pdf`);

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Download Failed", description: "Could not generate PDF." });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const onSubmit = () => {
    // This is triggered on valid form submission, we use it for download.
    handleDownloadPdf();
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3">
                <AdharForm 
                  onPhotoChange={handlePhotoChange}
                  onRefine={handleRefine}
                  aiLoading={aiLoading}
                />
              </div>

              <div className="lg:col-span-2 lg:sticky top-8">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-headline">Live Preview</CardTitle>
                    <CardDescription>
                      Your card will look like this. Updates happen in real-time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdharCardPreview photoUrl={photoUrl} />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isDownloading}>
                      {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      Download as PDF
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </main>
      </div>
    </FormProvider>
  );
}
