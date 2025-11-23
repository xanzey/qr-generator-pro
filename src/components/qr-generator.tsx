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
import {
  Download,
  QrCode,
  Link as LinkIcon,
  MessageSquare,
  Phone,
  Mail,
  Instagram,
  Type,
  User,
  Wifi,
  Bitcoin,
  Twitter,
  Facebook,
  File as FileIcon,
  Music,
  Image as ImageIcon,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import Image from 'next/image';

const qrTypes = [
  'text',
  'url',
  'whatsapp',
  'phone',
  'email',
  'instagram',
  'vcard',
  'sms',
  'wifi',
  'bitcoin',
  'twitter',
  'facebook',
  'pdf',
  'mp3',
  'image',
  'app_store',
] as const;
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
  // vCard
  vcard_firstname: z.string().optional(),
  vcard_lastname: z.string().optional(),
  vcard_phone: z.string().optional(),
  vcard_email: z.string().email().optional(),
  vcard_company: z.string().optional(),
  // SMS
  sms_phone: z.string().optional(),
  sms_message: z.string().optional(),
  // WiFi
  wifi_ssid: z.string().optional(),
  wifi_password: z.string().optional(),
  wifi_encryption: z.enum(['WPA', 'WEP', 'nopass']).optional(),
  // Bitcoin
  btc_address: z.string().optional(),
  btc_amount: z.string().optional(),
  // Social
  twitter_user: z.string().optional(),
  facebook_url: z.string().url().optional(),
  // Files
  pdf_url: z.string().url().optional(),
  mp3_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  // App Store
  app_store_ios: z.string().url().optional(),
  app_store_android: z.string().url().optional(),
});

type QrFormData = z.infer<typeof schema>;

const typeConfig: Record<QrType, { label: string; icon: React.ReactElement }> = {
  text: { label: 'Text', icon: <Type /> },
  url: { label: 'URL', icon: <LinkIcon /> },
  whatsapp: { label: 'WhatsApp', icon: <MessageSquare /> },
  phone: { label: 'Phone', icon: <Phone /> },
  email: { label: 'Email', icon: <Mail /> },
  instagram: { label: 'Instagram', icon: <Instagram /> },
  vcard: { label: 'vCard', icon: <User /> },
  sms: { label: 'SMS', icon: <MessageSquare /> },
  wifi: { label: 'WiFi', icon: <Wifi /> },
  bitcoin: { label: 'Bitcoin', icon: <Bitcoin /> },
  twitter: { label: 'Twitter', icon: <Twitter /> },
  facebook: { label: 'Facebook', icon: <Facebook /> },
  pdf: { label: 'PDF', icon: <FileIcon /> },
  mp3: { label: 'MP3', icon: <Music /> },
  image: { label: 'Image', icon: <ImageIcon /> },
  app_store: { label: 'App Stores', icon: <ShoppingBag /> },
};


export default function QrGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [currentQrType, setCurrentQrType] = useState<QrType>('text');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [title, setTitle] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const methods = useForm<QrFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      qrType: 'text',
      wifi_encryption: 'WPA',
    },
  });

  const { register, watch, handleSubmit, setValue } = methods;

  const watchedValues = watch();

  const sanitizePhoneNumber = (number: string | undefined) => {
    if (!number) return '';
    let sanitized = number.replace(/[^0-9]/g, '');
    if (sanitized.startsWith('91')) {
        return sanitized;
    }
    return '91' + sanitized;
  }

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
                const whatsappNumber = sanitizePhoneNumber(watchedValues.whatsapp);
                dataToEncode = `https://wa.me/${whatsappNumber}${watchedValues.message ? `?text=${encodeURIComponent(watchedValues.message)}` : ''}`;
            }
            break;
        case 'phone':
            if(watchedValues.phone) {
                dataToEncode = `tel:${sanitizePhoneNumber(watchedValues.phone)}`;
            }
          break;
        case 'email':
          dataToEncode = `mailto:${watchedValues.email || ''}`;
          break;
        case 'instagram':
          if (watchedValues.instagram) {
            dataToEncode = `https://instagram.com/${watchedValues.instagram.replace('@', '')}`;
          }
          break;
        case 'vcard':
          const vcardPhone = sanitizePhoneNumber(watchedValues.vcard_phone);
          dataToEncode = `BEGIN:VCARD\nVERSION:3.0\nN:${watchedValues.vcard_lastname || ''};${watchedValues.vcard_firstname || ''}\nFN:${watchedValues.vcard_firstname || ''} ${watchedValues.vcard_lastname || ''}\nTEL;TYPE=CELL:${vcardPhone}\nEMAIL:${watchedValues.vcard_email || ''}\nORG:${watchedValues.vcard_company || ''}\nEND:VCARD`;
          break;
        case 'sms':
            if(watchedValues.sms_phone) {
                dataToEncode = `smsto:${sanitizePhoneNumber(watchedValues.sms_phone)}:${encodeURIComponent(watchedValues.sms_message || '')}`;
            }
          break;
        case 'wifi':
          dataToEncode = `WIFI:T:${watchedValues.wifi_encryption || 'WPA'};S:${watchedValues.wifi_ssid || ''};P:${watchedValues.wifi_password || ''};;`;
          break;
        case 'bitcoin':
          dataToEncode = `bitcoin:${watchedValues.btc_address || ''}?amount=${watchedValues.btc_amount || ''}`;
          break;
        case 'twitter':
          dataToEncode = `https://twitter.com/${(watchedValues.twitter_user || '').replace('@', '')}`;
          break;
        case 'facebook':
          dataToEncode = watchedValues.facebook_url || '';
          break;
        case 'pdf':
          dataToEncode = watchedValues.pdf_url || '';
          break;
        case 'mp3':
            dataToEncode = watchedValues.mp3_url || '';
            break;
        case 'image':
            dataToEncode = watchedValues.image_url || '';
            break;
        case 'app_store':
          dataToEncode = watchedValues.app_store_ios || watchedValues.app_store_android || '';
          break;
      }
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0,0,canvas.width, canvas.height);

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
            
            const logo = new window.Image();
            const iconElement = typeConfig[currentQrType].icon;
            
            const toSvgString = (el: React.ReactElement): string => {
                if (!el) return '';
                const { type: tag, props } = el;
                const children = props.children;
                let childrenContent = '';

                if (children) {
                    const childArray = Array.isArray(children) ? children : [children];
                    childrenContent = childArray.map((child: any) => {
                        if (typeof child === 'string') return child;
                        if (!child || !child.type) return '';
                        
                        const childProps = Object.entries(child.props || {})
                            .map(([key, val]) => `${key}="${val}"`)
                            .join(' ');
                        return `<${child.type} ${childProps}></${child.type}>`;
                    }).join('');
                }

                return `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${qrColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${childrenContent}</svg>`;
            };

            const iconSvg = new Blob([toSvgString(iconElement)], {type: 'image/svg+xml'});
            const logoUrl = URL.createObjectURL(iconSvg);

            logo.src = logoUrl;
            logo.onload = () => {
                const logoSize = canvas.width / 5;
                const logoX = (canvas.width - logoSize) / 2;
                const logoY = (canvas.height - logoSize) / 2;
                
                ctx.fillStyle = qrBgColor;
                ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
                
                ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                setQrCodeUrl(canvas.toDataURL('image/png'));
                URL.revokeObjectURL(logoUrl);
            };
            logo.onerror = () => {
                setQrCodeUrl(canvas.toDataURL('image/png')); // Fallback to QR without logo
                URL.revokeObjectURL(logoUrl);
            };

        } catch (err) {
          console.error(err);
          setQrCodeUrl('');
          ctx.clearRect(0,0,canvas.width, canvas.height);
        }
      } else {
        setQrCodeUrl('');
      }
    };

    generateQrCode();
  }, [watchedValues, qrColor, qrBgColor, currentQrType]);

  const handleDownload = () => {
    if (!qrCodeUrl || !canvasRef.current) return;

    const downloadCanvas = document.createElement('canvas');
    const ctx = downloadCanvas.getContext('2d');
    if (!ctx) return;

    const qrImageSize = 256;
    const padding = 40;
    const titleHeight = title ? 60 : 0;
    
    downloadCanvas.width = qrImageSize + padding * 2;
    downloadCanvas.height = qrImageSize + padding * 2 + titleHeight;

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    // Title
    if (title) {
        ctx.font = '20px "Inter", sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(title, downloadCanvas.width / 2, padding + 20);
    }
    
    // QR Code Image
    const qrImg = new window.Image();
    qrImg.onload = () => {
        const cardX = padding;
        const cardY = padding + titleHeight;
        const cardWidth = qrImageSize;
        const cardHeight = qrImageSize;

        // Draw a rounded rectangle for the card effect
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cardX + 12, cardY);
        ctx.lineTo(cardX + cardWidth - 12, cardY);
        ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 12);
        ctx.lineTo(cardX + cardWidth, cardY + cardHeight - 12);
        ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - 12, cardY + cardHeight);
        ctx.lineTo(cardX + 12, cardY + cardHeight);
        ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - 12);
        ctx.lineTo(cardX, cardY + 12);
        ctx.quadraticCurveTo(cardX, cardY, cardX + 12, cardY);
        ctx.closePath();
        ctx.clip();

        // Draw the QR image inside the rounded rectangle
        ctx.drawImage(qrImg, cardX, cardY, cardWidth, cardHeight);
        ctx.restore();

        const finalUrl = downloadCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = finalUrl;
        link.download = `${title.replace(/\s+/g, '-').toLowerCase() || currentQrType}-qrcode.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    qrImg.src = qrCodeUrl;
  };

  const renderFormFields = () => {
    switch (currentQrType) {
      case 'url':
        return <Input {...register('url')} placeholder="https://example.com" />;
      case 'whatsapp':
        return (
            <div className="space-y-4">
                <Input {...register('whatsapp')} placeholder="Enter mobile number" />
                <Textarea {...register('message')} placeholder="Optional: Pre-fill message" />
            </div>
        );
      case 'phone':
        return <Input {...register('phone')} type="tel" placeholder="e.g. 1234567890" />;
      case 'email':
        return <Input {...register('email')} type="email" placeholder="user@example.com" />;
      case 'instagram':
        return <Input {...register('instagram')} placeholder="Your Instagram username" />;
       case 'vcard':
        return (
          <div className="space-y-4">
            <Input {...register('vcard_firstname')} placeholder="First Name" />
            <Input {...register('vcard_lastname')} placeholder="Last Name" />
            <Input {...register('vcard_phone')} type="tel" placeholder="Phone" />
            <Input {...register('vcard_email')} type="email" placeholder="Email" />
            <Input {...register('vcard_company')} placeholder="Company" />
          </div>
        );
      case 'sms':
        return (
          <div className="space-y-4">
            <Input {...register('sms_phone')} type="tel" placeholder="Phone Number" />
            <Textarea {...register('sms_message')} placeholder="SMS Message" />
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-4">
            <Input {...register('wifi_ssid')} placeholder="Network Name (SSID)" />
            <Input {...register('wifi_password')} type="password" placeholder="Password" />
            <Select onValueChange={(v) => setValue('wifi_encryption', v as any)} defaultValue="WPA">
              <SelectTrigger>
                <SelectValue placeholder="Encryption" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">No Encryption</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 'bitcoin':
        return (
          <div className="space-y-4">
            <Input {...register('btc_address')} placeholder="Bitcoin Address" />
            <Input {...register('btc_amount')} type="number" placeholder="Amount (optional)" />
          </div>
        );
      case 'twitter':
        return <Input {...register('twitter_user')} placeholder="@username" />;
      case 'facebook':
        return <Input {...register('facebook_url')} placeholder="https://facebook.com/your-profile" />;
      case 'pdf':
        return <Input {...register('pdf_url')} placeholder="https://example.com/your.pdf" />;
      case 'mp3':
        return <Input {...register('mp3_url')} placeholder="https://example.com/your.mp3" />;
      case 'image':
        return <Input {...register('image_url')} placeholder="https://example.com/your-image.png" />;
      case 'app_store':
        return (
          <div className="space-y-4">
             <div className="flex items-center gap-2">
              <Smartphone className="text-gray-400"/>
              <Input {...register('app_store_ios')} placeholder="Apple App Store URL" />
             </div>
             <div className="flex items-center gap-2">
              <Smartphone className="text-green-500" />
              <Input {...register('app_store_android')} placeholder="Google Play Store URL" />
             </div>
          </div>
        );
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
              <form onSubmit={handleSubmit(() => {})} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="mb-2 block font-medium">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. My Website" />
                </div>
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
             <div className="w-full max-w-sm rounded-lg bg-card shadow-lg p-6 flex flex-col items-center space-y-4">
                {title && <h2 className="text-xl font-bold font-headline">{title}</h2>}
                <div 
                    className="w-64 h-64 rounded-lg bg-card shadow-inner flex items-center justify-center relative overflow-hidden"
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
        </div>
      </Card>
      </div>
    </FormProvider>
  );
}

    