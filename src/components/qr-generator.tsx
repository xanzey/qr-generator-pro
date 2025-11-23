
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
import { Download, QrCode } from 'lucide-react';
import Image from 'next/image';

const qrTypes = ['text', 'url', 'whatsapp', 'phone', 'email'] as const;
type QrType = (typeof qrTypes)[number];

const schema = z.object({
  qrType: z.enum(qrTypes),
  text: z.string().optional(),
  url: z.string().url().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  message: z.string().optional(),
});

type QrFormData = z.infer<typeof schema>;

const typeConfig = {
  text: { label: 'Text', icon: <QrCode /> },
  url: { label: 'URL', icon: <QrCode /> },
  whatsapp: { label: 'WhatsApp', icon: <QrCode /> },
  phone: { label: 'Phone', icon: <QrCode /> },
  email: { label: 'Email', icon: <QrCode /> },
};

export default function QrGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [currentQrType, setCurrentQrType] = useState<QrType>('text');

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
                const whatsappNumber = watchedValues.whatsapp.startsWith('91') ? watchedValues.whatsapp : `91${watchedValues.whatsapp}`;
                dataToEncode = `https://wa.me/${whatsappNumber}${watchedValues.message ? `?text=${encodeURIComponent(watchedValues.message)}` : ''}`;
            }
            break;
        case 'phone':
          dataToEncode = `tel:${watchedValues.phone || ''}`;
          break;
        case 'email':
          dataToEncode = `mailto:${watchedValues.email || ''}`;
          break;
      }

      if (dataToEncode) {
        try {
          const url = await QRCode.toDataURL(dataToEncode, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 256,
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
  }, [watchedValues]);

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
                <Input {...register('whatsapp')} placeholder="Enter 10-digit mobile number" />
                <Textarea {...register('message')} placeholder="Optional: Pre-fill message" />
            </div>
        );
      case 'phone':
        return <Input {...register('phone')} type="tel" placeholder="e.g. +11234567890" />;
      case 'email':
        return <Input {...register('email')} type="email" placeholder="user@example.com" />;
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
                Create and download QR codes for anything.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
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
            </CardContent>
             <CardFooter className="p-0 mt-8">
                <Button onClick={handleDownload} disabled={!qrCodeUrl} className="w-full">
                  <Download className="mr-2" />
                  Download QR Code
                </Button>
            </CardFooter>
        </div>
        <div className="bg-primary/10 p-8 flex items-center justify-center">
            <div className="w-64 h-64 bg-white rounded-lg shadow-inner p-4 flex items-center justify-center">
                {qrCodeUrl ? (
                    <Image src={qrCodeUrl} alt="Generated QR Code" width={240} height={240} />
                ) : (
                    <div className="text-center text-muted-foreground">
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
