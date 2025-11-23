
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
import { Scissors } from "lucide-react";

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
    const dataToEncode = `Name: ${name || ''}\nDOB: ${dob ? format(dob, 'dd/MM/yyyy') : ''}\nGender: ${gender || ''}\nAadhaar: ${adharNumber || ''}\nAddress: ${address || ''}`;
    const options = {
        errorCorrectionLevel: 'M' as const,
        margin: 2,
        width: 128,
        color: {
            dark: '#000000',
            light: '#FFFFFF',
        }
    };
    QRCode.toDataURL(dataToEncode, options)
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error(err);
      });
  }, [name, dob, gender, adharNumber, address]);

  const textSize = {
    fontSize: `${fontSize}px`,
    lineHeight: `${fontSize * 1.4}px`,
  }

  const genderHindi = {
    'Male': 'पुरुष',
    'Female': 'महिला',
    'Other': 'अन्य'
  }

  return (
    <Card className="overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        <div id="adhar-preview" className="bg-white text-black text-[10px] leading-tight">
          
          {/* Front Side of the Card - Top part */}
          <div className="p-3 border-b-2 border-dashed border-gray-400">
            <header className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <EmblemIcon className="w-8 h-8" />
                <div>
                  <p className="font-bold font-headline text-[10px] text-orange-500">भारत सरकार</p>
                  <p className="text-[8px] font-headline text-green-700">Government of India</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                  <Image src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/250px-Aadhaar_Logo.svg.png" alt="Aadhaar Logo" width={60} height={30} />
              </div>
            </header>

            <main className="grid grid-cols-3 gap-2 pt-2">
                <div className="col-span-2 space-y-1 text-[9px]">
                    <p className="font-bold text-[11px]">Address:</p>
                    <p className="font-bold font-headline uppercase">{name || 'Your Name'}</p>
                    <p>{address || 'Your full address here...'}</p>
                </div>
                 <div className="col-span-1 flex flex-col items-center justify-start gap-2">
                    {showQrCode && (
                        <div className="w-20 h-20">
                        {qrCodeUrl ? (
                            <Image src={qrCodeUrl} alt="QR Code" width={80} height={80} />
                        ) : (
                            <Skeleton className="w-20 h-20" />
                        )}
                        </div>
                    )}
                </div>
            </main>
            
            <footer className="mt-2 pt-2 border-t-2 border-red-600">
              <div className="flex flex-col items-center">
                <p className="text-[9px]">आपका आधार क्रमांक / Your Aadhaar No.:</p>
                 <p className="text-xl font-mono tracking-wider font-bold text-center">
                    {adharNumber || 'XXXX XXXX XXXX'}
                </p>
                <p className="text-[12px] font-bold text-red-600">मेरा आधार, मेरी पहचान</p>
              </div>
            </footer>
          </div>

          <div className="flex items-center text-gray-500 my-1 px-3">
            <Scissors className="w-3 h-3 mr-2"/>
            <p className="text-[8px]">इस भाग को काट लें / Cut along this line</p>
          </div>

          {/* Back side of the card - bottom part */}
          <div className="p-3 bg-white">
             <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                     <div className="relative w-full aspect-[3/4] border border-gray-300">
                        <Image
                        src={photoUrl || userPhoto?.imageUrl || '/placeholder.png'}
                        alt={name || "User photo"}
                        fill
                        sizes="80px"
                        className="object-cover"
                        data-ai-hint={userPhoto?.imageHint || "person portrait"}
                        />
                    </div>
                </div>
                <div className="col-span-3 space-y-1" style={textSize}>
                    <div>
                        <p className="font-bold font-headline">{name || 'आपका नाम'}</p>
                        <p className="font-bold font-headline uppercase">{name || 'Your Name'}</p>
                    </div>
                    <div>
                        <p>जन्म तिथि / DOB: <span className="font-bold">{dob ? format(dob, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</span></p>
                    </div>
                    <div>
                        <p>{gender ? genderHindi[gender] : 'लिंग'} / <span className="uppercase">{gender || 'GENDER'}</span></p>
                    </div>
                </div>
             </div>
            <div className="text-center mt-1">
                 <p className="text-xl font-mono tracking-wider font-bold text-center">
                    {adharNumber || 'XXXX XXXX XXXX'}
                </p>
            </div>
             <div className="mt-1 pt-1 border-t-2 border-red-600">
                <p className="text-[12px] font-bold text-red-600 text-center">मेरा आधार, मेरी पहचान</p>
            </div>

            <div className="mt-4 p-2 border-t border-gray-300 grid grid-cols-12 gap-2">
                <div className="col-span-8">
                    <p className="font-bold">पता:</p>
                    <p className="font-bold">Address:</p>
                    <p className="text-[9px] leading-snug">{address || 'Your full address here...'}</p>
                </div>
                <div className="col-span-4">
                     {showQrCode && (
                        <div className="w-16 h-16 ml-auto">
                        {qrCodeUrl ? (
                            <Image src={qrCodeUrl} alt="QR Code" width={64} height={64} />
                        ) : (
                            <Skeleton className="w-16 h-16" />
                        )}
                        </div>
                    )}
                </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
