
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import QRCode from 'qrcode';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, QrCode, Link, MessageSquare, Phone, Mail, Instagram, Type, Wifi, Briefcase, Calendar, Star, Bitcoin } from 'lucide-react';
import Image from 'next/image';

const qrTypes = ['text', 'url', 'whatsapp', 'phone', 'email', 'instagram'] as const;
type QrType = (typeof qrTypes)[number];

const schema = z.object({
  qrType: z.enum(qrTypes),
  text: z.string().optional(),
  url: z.string().url().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  message: z.string().optional(),
  instagram: z.string().optional(),
});

type QrFormData = z.infer<typeof schema>;

const typeConfig: Record<QrType, { label: string; icon: React.ReactElement }> = {
  text: { label: 'Text', icon: <Type /> },
  url: { label: 'URL', icon: <Link /> },
  whatsapp: { label: 'WhatsApp', icon: <MessageSquare /> },
  phone: { label: 'Phone', icon: <Phone /> },
  email: { label: 'Email', icon: <Mail /> },
  instagram: { label: 'Instagram', icon: <Instagram /> },
};


export default function QrGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [currentQrType, setCurrentQrType] = useState<QrType>('text');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const methods = useForm<QrFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      qrType: 'text',
    },
  });

  const { register, watch, handleSubmit, setValue } = methods;

  const watchedValues = watch();

  useEffect(() => {
    const generateQrCode = async () => {
      let dataToEncode = '';
      switch (watchedValues.qrType) {
        case 'text':
          dataToEncode = watchedValues.text || '';
          break;
        case 'url':
          dataToEncode = watchedValues.url || '';
          break;
        case 'whatsapp':
            if (watchedValues.whatsapp) {
                const whatsappNumber = watchedValues.whatsapp.replace(/[^0-9]/g, '');
                dataToEncode = `https://wa.me/91${whatsappNumber}${watchedValues.message ? `?text=${encodeURIComponent(watchedValues.message)}` : ''}`;
            }
            break;
        case 'phone':
          dataToEncode = `tel:${watchedValues.phone || ''}`;
          break;
        case 'email':
          dataToEncode = `mailto:${watchedValues.email || ''}`;
          break;
        case 'instagram':
          if (watchedValues.instagram) {
            dataToEncode = `https://instagram.com/${watchedValues.instagram.replace('@', '')}`;
          }
          break;
      }
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (dataToEncode) {
        try {
            await QRCode.toCanvas(canvas, dataToEncode, {
                errorCorrectionLevel: 'H',
                margin: 2,
                width: 256,
                color: {
                    dark: qrColor,
                    light: qrBgColor,
                }
            });

            // Draw logo in the center
            const logo = new window.Image();
            const iconSvg = new Blob([
                `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${(typeConfig[currentQrType].icon as any).props.children.map((child: any) => `<${child.type} ${Object.entries(child.props).map(([key, val]) => `${key}="${val}"`).join(' ')}/>`).join('')}</svg>`
            ], {type: 'image/svg+xml'});
            const logoUrl = URL.createObjectURL(iconSvg);

            logo.src = logoUrl;
            logo.onload = () => {
                const logoSize = canvas.width / 5;
                const logoX = (canvas.width - logoSize) / 2;
                const logoY = (canvas.height - logoSize) / 2;
                
                // Clear a white square behind the logo
                ctx.fillStyle = qrBgColor;
                ctx.fillRect(logoX -5, logoY - 5, logoSize + 10, logoSize + 10);
                
                ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                setQrCodeUrl(canvas.toDataURL('image/png'));
                URL.revokeObjectURL(logoUrl);
            };
            logo.onerror = () => URL.revokeObjectURL(logoUrl);

        } catch (err) {
          console.error(err);
          setQrCodeUrl('');
          ctx.clearRect(0,0,canvas.width, canvas.height);
        }
      } else {
        setQrCodeUrl('');
        ctx.clearRect(0,0,canvas.width, canvas.height);
      }
    };

    generateQrCode();
  }, [watchedValues, qrColor, qrBgColor, currentQrType]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${currentQrType}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderFormFields = () => {
    switch (currentQrType) {
      case 'url':
        return <Input {...register('url')} placeholder="https://example.com" />;
      case 'whatsapp':
        return (
            <div className="space-y-4">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">+91</span>
                    <Input {...register('whatsapp')} placeholder="Enter 10-digit mobile number" className="pl-10" />
                </div>
                <Textarea {...register('message')} placeholder="Optional: Pre-fill message" />
            </div>
        );
      case 'phone':
        return <Input {...register('phone')} type="tel" placeholder="e.g. +11234567890" />;
      case 'email':
        return <Input {...register('email')} type="email" placeholder="user@example.com" />;
      case 'instagram':
        return <Input {...register('instagram')} placeholder="Your Instagram username" />;
      case 'text':
      default:
        return <Textarea {...register('text')} placeholder="Enter any text" />;
    }
  };


  return (
    <FormProvider {...methods}>
      <div className="container mx-auto max-w-4xl p-4">
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden shadow-2xl border-none">
        <div className="p-8 bg-card flex flex-col">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-3xl font-bold font-headline">QR Code Generator</CardTitle>
              <CardDescription>
                Create and customize beautiful QR codes for anything.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-grow space-y-6">
              <form onSubmit={handleSubmit(() => {})}>
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block font-medium">QR Code Type</Label>
                    <Select
                      defaultValue={currentQrType}
                      onValueChange={(value: QrType) => {
                        setCurrentQrType(value);
                        setValue('qrType', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select QR type" />
                      </SelectTrigger>
                      <SelectContent>
                        {qrTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              {typeConfig[type].icon}
                              <span>{typeConfig[type].label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium">Content</Label>
                     {renderFormFields()}
                  </div>
                </div>
              </form>
               
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="qrColor" className="mb-2 block font-medium">QR Color</Label>
                        <Input id="qrColor" type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="p-1"/>
                    </div>
                    <div>
                        <Label htmlFor="qrBgColor" className="mb-2 block font-medium">Background</Label>
                         <Input id="qrBgColor" type="color" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} className="p-1" />
                    </div>
                </div>
            </CardContent>
             <CardFooter className="p-0 mt-8">
                <Button onClick={handleDownload} disabled={!qrCodeUrl} className="w-full">
                  <Download className="mr-2" />
                  Download QR Code
                </Button>
            </CardFooter>
        </div>
        <div className="bg-primary/10 p-8 flex items-center justify-center">
             <div 
                className="w-64 h-64 rounded-lg shadow-inner flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: qrBgColor }}
            >
                <canvas ref={canvasRef} width="256" height="256" className="absolute hidden" />
                {qrCodeUrl ? (
                    <Image src={qrCodeUrl} alt="Generated QR Code" width={256} height={256} className="absolute inset-0"/>
                ) : (
                    <div className="text-center text-muted-foreground bg-white/80 p-4 rounded-md">
                    <QrCode className="mx-auto h-16 w-16" />
                    <p className="mt-2">Your QR code will appear here</p>
                    </div>
                )}
            </div>
        </div>
      </Card>
      </div>
    </FormProvider>
  );
}

