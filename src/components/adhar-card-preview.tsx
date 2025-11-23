
"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from 'qrcode';
import { format } from "date-fns";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { AdharFormData } from "@/schemas/adhar-schema";
import { Skeleton } from "@/components/ui/skeleton";
import { EmblemIcon } from "@/components/emblem-icon";
import { cn } from "@/lib/utils";
import { User, Cake, VenetianMask, Fingerprint, Home } from "lucide-react";

type AdharCardPreviewProps = {
  photoUrl: string | null;
};

export default function AdharCardPreview({ photoUrl }: AdharCardPreviewProps) {
  const { watch } = useFormContext<AdharFormData>();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const watchedData = watch();
  const { name, dob, gender, adharNumber, address, showQrCode, fontSize } = watchedData;

  const userPhoto = PlaceHolderImages.find(p => p.id === 'user-photo');

  useEffect(() => {
    if (!showQrCode) {
      setQrCodeUrl('');
      return;
    }
    const dataToEncode = `Name: ${name || ''}\nDOB: ${dob ? format(dob, 'dd/MM/yyyy') : ''}\nGender: ${gender || ''}\nAadhaar: ${adharNumber || ''}\nAddress: ${address || ''}`;
    QRCode.toDataURL(dataToEncode, { errorCorrectionLevel: 'M', margin: 2, width: 128 })
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error(err);
      });
  }, [name, dob, gender, adharNumber, address, showQrCode]);

  const textSize = {
    fontSize: `${fontSize}px`,
    lineHeight: `${fontSize * 1.5}px`,
  }

  return (
    <Card className="overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        <div id="adhar-preview" className="bg-white text-black p-4 aspect-[85.6/54] flex flex-col">
          <header className="flex items-center justify-between border-b-2 border-red-600 pb-1">
            <div className="flex items-center gap-2">
              <EmblemIcon className="w-8 h-8" />
              <div>
                <p className="font-bold font-headline text-sm text-orange-600">भारत सरकार</p>
                <p className="text-xs font-headline text-green-700">Government of India</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold font-headline text-primary text-sm">Aadhaar</p>
              <p className="text-xs">आम आदमी का अधिकार</p>
            </div>
          </header>

          <main className="flex-grow grid grid-cols-4 gap-4 pt-4">
            <div className="col-span-1 flex flex-col items-center">
              <div className="relative w-full aspect-square border-2 border-dashed rounded-md">
                <Image
                  src={photoUrl || userPhoto?.imageUrl || '/placeholder.png'}
                  alt={name || "User photo"}
                  fill
                  sizes="100px"
                  className="object-cover rounded-md"
                  data-ai-hint={userPhoto?.imageHint || "person portrait"}
                />
              </div>
              {showQrCode && (
                <div className="w-full aspect-square mt-2 flex items-center justify-center">
                  {qrCodeUrl ? (
                    <Image src={qrCodeUrl} alt="QR Code" width={100} height={100} />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                </div>
              )}
            </div>

            <div className="col-span-3 space-y-2" style={textSize}>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 mt-1 shrink-0" />
                <div>
                  <p className="font-bold font-headline uppercase">{name || 'Your Name'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Cake className="w-4 h-4 mt-1 shrink-0" />
                <div>
                  <p className="font-medium">Date of Birth:</p>
                  <p>{dob ? format(dob, 'dd / MM / yyyy') : 'DD / MM / YYYY'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <VenetianMask className="w-4 h-4 mt-1 shrink-0" />
                <div>
                  <p className="font-medium">Gender:</p>
                  <p className="uppercase">{gender || 'Gender'}</p>
                </div>
              </div>
               <div className="flex items-start gap-2">
                <Home className="w-4 h-4 mt-1 shrink-0" />
                <div>
                  <p className="font-medium">Address:</p>
                  <p>{address || 'Your full address here...'}</p>
                </div>
              </div>
            </div>
          </main>

          <footer className="mt-auto pt-2 border-t-4 border-double border-primary">
            <div className="flex items-center justify-center gap-4">
              <Fingerprint className="w-6 h-6 text-primary" />
              <p className="text-xl md:text-2xl font-mono tracking-widest font-bold text-center text-primary">
                {adharNumber || 'XXXX XXXX XXXX'}
              </p>
            </div>
          </footer>
        </div>
      </CardContent>
    </Card>
  );
}
