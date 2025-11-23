
'use client';

import { useState, useEffect } from 'react';
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
import { Download, QrCode, Link, MessageSquare, Phone, Mail, Instagram } from 'lucide-react';
import Image from 'next/image';

const qrTypes = ['text', 'url', 'whatsapp', 'phone', 'email', 'instagram'] as const;
type QrType = (typeof qrTypes)[number];

const qrStyles = ['none', 'flowers', 'puppy'] as const;
type QrStyle = (typeof qrStyles)[number];


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

const typeConfig = {
  text: { label: 'Text', icon: <MessageSquare /> },
  url: { label: 'URL', icon: <Link /> },
  whatsapp: { label: 'WhatsApp', icon: <MessageSquare /> },
  phone: { label: 'Phone', icon: <Phone /> },
  email: { label: 'Email', icon: <Mail /> },
  instagram: { label: 'Instagram', icon: <Instagram /> },
};

const styleConfig = {
    none: { label: 'Default' },
    flowers: { label: 'Flowers', url: 'https://picsum.photos/seed/flower/400/400' },
    puppy: { label: 'Puppy', url: 'https://picsum.photos/seed/puppy/400/400' },
};

export default function QrGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [currentQrType, setCurrentQrType] = useState<QrType>('text');
  const [currentQrStyle, setCurrentQrStyle] = useState<QrStyle>('none');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');

  const methods = useForm<QrFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      qrType: 'text',
    },
  });

  const { register, watch, handleSubmit } = methods;

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

      if (dataToEncode) {
        try {
          const url = await QRCode.toDataURL(dataToEncode, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 256,
            color: {
                dark: qrColor,
                light: currentQrStyle === 'none' ? qrBgColor : '#0000',
            }
          });
          setQrCodeUrl(url);
        } catch (err) {
          console.error(err);
          setQrCodeUrl('');
        }
      } else {
        setQrCodeUrl('');
      }
    };

    generateQrCode();
  }, [watchedValues, qrColor, qrBgColor, currentQrStyle]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    if (currentQrStyle === 'none') {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `qrcode-${currentQrType}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bgImage = new window.Image();
        bgImage.crossOrigin = "Anonymous";
        bgImage.src = styleConfig[currentQrStyle].url;
        
        bgImage.onload = () => {
            ctx.drawImage(bgImage, 0, 0, 256, 256);

            const qrImage = new window.Image();
            qrImage.src = qrCodeUrl;
            qrImage.onload = () => {
                ctx.drawImage(qrImage, 0, 0, 256, 256);
                const finalUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = finalUrl;
                link.download = `qrcode-styled-${currentQrType}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
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
                        methods.setValue('qrType', value);
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
               <div>
                    <Label className="mb-2 block font-medium">Style</Label>
                    <Select
                      defaultValue={currentQrStyle}
                      onValueChange={(value: QrStyle) => setCurrentQrStyle(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {qrStyles.map((style) => (
                          <SelectItem key={style} value={style}>
                            {styleConfig[style].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="qrColor" className="mb-2 block font-medium">QR Color</Label>
                        <Input id="qrColor" type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="p-1"/>
                    </div>
                    <div>
                        <Label htmlFor="qrBgColor" className="mb-2 block font-medium">Background</Label>
                         <Input id="qrBgColor" type="color" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} className="p-1" disabled={currentQrStyle !== 'none'}/>
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
                style={{
                    backgroundColor: currentQrStyle === 'none' ? qrBgColor : 'transparent',
                    backgroundImage: currentQrStyle !== 'none' ? `url(${styleConfig[currentQrStyle].url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
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

