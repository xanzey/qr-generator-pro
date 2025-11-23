
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
import { Scissors, Phone, Mail, Globe } from "lucide-react";

type AdharCardPreviewProps = {
  photoUrl: string | null;
};

export default function AdharCardPreview({ photoUrl }: AdharCardPreviewProps) {
  const { watch } = useFormContext<AdharFormData>();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const watchedData = watch();
  const { name, nameHindi, dob, gender, adharNumber, address, addressHindi, showQrCode, fontSize, vid } = watchedData;

  const userPhoto = PlaceHolderImages.find(p => p.id === 'user-photo');

  useEffect(() => {
    if (showQrCode) {
        const dataToEncode = `Name: ${name || ''}\nDOB: ${dob ? format(dob, 'dd/MM/yyyy') : ''}\nGender: ${gender || ''}\nAadhaar: ${adharNumber || ''}\nAddress: ${address || ''}`;
        const options = {
            errorCorrectionLevel: 'M' as const,
            margin: 1,
            width: 80,
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
    } else {
        setQrCodeUrl('');
    }
  }, [name, dob, gender, adharNumber, address, showQrCode]);

  const textSizeStyle = {
    fontSize: `${fontSize}px`,
  }

  const genderHindi = {
    'Male': 'पुरुष',
    'Female': 'महिला',
    'Other': 'अन्य'
  }

  return (
    <Card className="overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        <div id="adhar-preview" className="bg-white text-black text-xs leading-tight">
          
          {/* Top foldable part */}
          <div className="border-b-2 border-dashed border-gray-400 p-1 flex">
             <div className="w-1/4 flex flex-col justify-between items-center text-center p-1 border-r-2 border-dashed border-gray-400">
                <Image src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/250px-Aadhaar_Logo.svg.png" alt="Aadhaar Logo" width={80} height={40} className="mt-2"/>
                <div className="text-[7px] leading-tight">
                    <p>Aadhaar is proof of identity, not of citizenship or date of birth. It should be used with verification.</p>
                    <p className="mt-1">आधार पहचान का प्रमाण है, नागरिकता या जन्मतिथि का नहीं। इसका उपयोग सत्यापन के साथ किया जाना चाहिए।</p>
                </div>
             </div>
             <div className="w-3/4 p-2">
                <div className="flex">
                  <div className="w-2/3 pr-2">
                    <p className="text-[9px] font-bold">पता: <span className="font-normal">{addressHindi || 'आपका पूरा पता यहाँ...'}</span></p>
                    <p className="text-[9px] font-bold mt-1">Address: <span className="font-normal uppercase">{address || 'Your full address here...'}</span></p>
                  </div>
                  <div className="w-1/3 text-center">
                    {showQrCode && (
                        <div className="w-24 h-24 flex-shrink-0 mx-auto">
                        {qrCodeUrl ? (
                            <Image src={qrCodeUrl} alt="QR Code" width={96} height={96} />
                        ) : (
                            <Skeleton className="w-24 h-24" />
                        )}
                        </div>
                    )}
                  </div>
                </div>
                <div className="text-center mt-1">
                    <p className="text-xl font-mono tracking-wider font-bold">
                        {adharNumber || 'XXXX XXXX XXXX'}
                    </p>
                    {vid && <p className="text-[9px] font-mono tracking-wider">VID: {vid}</p>}
                </div>
             </div>
          </div>
          
          {/* Main card part */}
          <div className="p-1 flex">
            {/* Left side - Front of the card */}
            <div className="w-full p-2">
                <header className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <EmblemIcon className="w-8 h-8" />
                        <div>
                        <p className="font-bold font-headline text-[9px] text-orange-500 -mb-1">भारत सरकार</p>
                        <p className="text-[8px] font-headline text-green-700">Government of India</p>
                        </div>
                    </div>
                    <div className="relative">
                      <Image src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/250px-Aadhaar_Logo.svg.png" alt="Aadhaar Logo" width={60} height={30} />
                    </div>
                </header>
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3 flex items-center justify-center">
                        <Image
                            src={photoUrl || userPhoto?.imageUrl || '/placeholder.png'}
                            alt={name || "User photo"}
                            width={80}
                            height={106}
                            className="object-cover border-2 border-gray-200 z-10"
                            data-ai-hint={userPhoto?.imageHint || "person portrait"}
                        />
                    </div>
                    <div className="col-span-9 space-y-1.5 pl-2" style={textSizeStyle}>
                         <div>
                            <p className="font-bold font-headline text-[11px]">{nameHindi || 'आपका नाम'}</p>
                            <p className="font-bold font-headline uppercase text-[11px]">{name || 'Your Name'}</p>
                        </div>
                        <div>
                            <p className="text-[10px]">जन्म तिथि / DOB: <span className="font-bold">{dob ? format(dob, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</span></p>
                        </div>
                        <div>
                            <p className="text-[10px]">{gender ? genderHindi[gender] : 'लिंग'} / <span className="uppercase">{gender || 'GENDER'}</span></p>
                        </div>
                         <div className="pt-2">
                            <p className="text-2xl font-mono tracking-wider font-bold">
                                {adharNumber || 'XXXX XXXX XXXX'}
                            </p>
                        </div>
                    </div>
                </div>

                 <div className="mt-2 pt-1 border-t-4" style={{borderImage: 'linear-gradient(to right, #F47B20, #138808) 1'}}>
                    <p className="text-[10px] font-bold text-red-600 text-center">मेरा आधार, मेरी पहचान</p>
                </div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-500 my-1 px-3">
            <Scissors className="w-3 h-3 mr-2"/>
            <p className="text-[8px]">इस भाग को काट लें / Cut along this line</p>
          </div>

          {/* Bottom Back Part */}
          <div className="border-t-2 border-dashed border-gray-400 p-2">
             <div className="flex">
                <div className="w-2/3 pr-2">
                    <p className="text-[9px] font-bold">पता: <span className="font-normal">{addressHindi || 'आपका पूरा पता यहाँ...'}</span></p>
                    <p className="text-[9px] font-bold mt-1">Address: <span className="font-normal uppercase">{address || 'Your full address here...'}</span></p>
                </div>
                <div className="w-1/3 text-center">
                  {showQrCode && (
                      <div className="w-24 h-24 flex-shrink-0 mx-auto">
                      {qrCodeUrl ? (
                          <Image src={qrCodeUrl} alt="QR Code" width={96} height={96} />
                      ) : (
                          <Skeleton className="w-24 h-24" />
                      )}
                      </div>
                  )}
                </div>
              </div>
              <div className="text-center mt-1">
                  <p className="text-xl font-mono tracking-wider font-bold">
                      {adharNumber || 'XXXX XXXX XXXX'}
                  </p>
                  {vid && <p className="text-[9px] font-mono tracking-wider">VID: {vid}</p>}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between items-center text-[8px]">
                    <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3"/>
                        <span>1947</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3"/>
                        <span>help@uidai.gov.in</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3"/>
                        <span>www.uidai.gov.in</span>
                    </div>
                </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
