
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
  const { name, dob, gender, adharNumber, address, showQrCode, fontSize, vid } = watchedData;

  const userPhoto = PlaceHolderImages.find(p => p.id === 'user-photo');

  useEffect(() => {
    if (showQrCode) {
        const dataToEncode = `Name: ${name || ''}\nDOB: ${dob ? format(dob, 'dd/MM/yyyy') : ''}\nGender: ${gender || ''}\nAadhaar: ${adharNumber || ''}\nAddress: ${address || ''}`;
        const options = {
            errorCorrectionLevel: 'M' as const,
            margin: 2,
            width: 200, // Increased size for better quality
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
          
          <div className="border-b-2 border-dashed border-gray-400 p-1 flex">
             {/* Left side - Front of the card */}
            <div className="w-1/2 p-2 border-r-2 border-dashed border-gray-400">
                <header className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <EmblemIcon className="w-6 h-6" />
                        <div>
                        <p className="font-bold font-headline text-[8px] text-orange-500 -mb-1">भारत सरकार</p>
                        <p className="text-[7px] font-headline text-green-700">Government of India</p>
                        </div>
                    </div>
                    <div className="relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 opacity-20 blur-sm rounded-full"></div>
                      <Image src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/250px-Aadhaar_Logo.svg.png" alt="Aadhaar Logo" width={50} height={25} />
                    </div>
                </header>
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 relative flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                            <Image 
                                src={photoUrl || userPhoto?.imageUrl || '/placeholder.png'} 
                                alt="Ghost photo"
                                width={50}
                                height={66}
                                className="object-cover opacity-20"
                            />
                        </div>
                        <Image
                            src={photoUrl || userPhoto?.imageUrl || '/placeholder.png'}
                            alt={name || "User photo"}
                            width={80}
                            height={106}
                            className="object-cover border-2 border-gray-200 z-10"
                            data-ai-hint={userPhoto?.imageHint || "person portrait"}
                        />
                         <p className="absolute -left-5 top-0 bottom-0 text-[8px] font-bold transform -rotate-90 origin-center w-max h-min my-auto">Aadhaar no. issued: 12/10/2016</p>
                    </div>
                    <div className="col-span-8 space-y-1" style={textSizeStyle}>
                         <div>
                            <p className="font-bold font-headline text-[10px]">{name || 'आपका नाम'}</p>
                            <p className="font-bold font-headline uppercase text-[10px]">{name || 'Your Name'}</p>
                        </div>
                        <div>
                            <p className="text-[9px]">जन्म तिथि / DOB: <span className="font-bold">{dob ? format(dob, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</span></p>
                        </div>
                        <div>
                            <p className="text-[9px]">{gender ? genderHindi[gender] : 'लिंग'} / <span className="uppercase">{gender || 'GENDER'}</span></p>
                        </div>
                    </div>
                </div>

                <div className="border border-red-600 p-1 mt-2 text-[7px] leading-tight text-center">
                    <p>आधार पहचान का प्रमाण है, नागरिकता या जन्मतिथि का नहीं। इसका उपयोग सत्यापन (ऑनलाइन प्रमाणीकरण, या क्यूआर कोड/ऑफ़लाइन एक्सएमएल की स्कैनिंग) के साथ किया जाना चाहिए।</p>
                    <p>Aadhaar is proof of identity, not of citizenship or date of birth. It should be used with verification (online authentication, or scanning of QR code / offline XML).</p>
                </div>
                 <div className="text-center mt-2">
                    <p className="text-lg font-mono tracking-wider font-bold">
                        {adharNumber || 'XXXX XXXX XXXX'}
                    </p>
                </div>
                 <div className="mt-1 pt-1 border-t-2 border-red-600">
                    <p className="text-[10px] font-bold text-red-600 text-center">मेरा आधार, मेरी पहचान</p>
                </div>
            </div>
            
            {/* Right side - Back of the card */}
            <div className="w-1/2 p-2">
                <header className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <EmblemIcon className="w-6 h-6" />
                        <div>
                            <p className="font-bold font-headline text-[8px] -mb-1">भारतीय विशिष्ट पहचान प्राधिकरण</p>
                            <p className="text-[7px] font-headline text-green-700">Unique Identification Authority of India</p>
                        </div>
                    </div>
                     <Image src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/250px-Aadhaar_Logo.svg.png" alt="Aadhaar Logo" width={50} height={25} />
                </header>
                <div className="flex gap-2">
                    <p className="text-[8px] font-bold transform -rotate-90 origin-top-left -ml-2 mt-16 w-max h-min">Details as on: {format(new Date(), 'dd/MM/yyyy')}</p>
                    <div className="flex-1">
                        <div className="text-[9px]">
                            <p className="font-bold">पता:</p>
                            <p>{address || 'Your full address here...'}</p>
                        </div>
                        <div className="mt-2 text-[9px]">
                            <p className="font-bold">Address:</p>
                            <p className="uppercase">{address || 'Your full address here...'}</p>
                        </div>
                    </div>
                    {showQrCode && (
                        <div className="w-24 h-24 flex-shrink-0">
                        {qrCodeUrl ? (
                            <Image src={qrCodeUrl} alt="QR Code" width={96} height={96} />
                        ) : (
                            <Skeleton className="w-24 h-24" />
                        )}
                        </div>
                    )}
                </div>

                <div className="text-center mt-2">
                    <p className="text-lg font-mono tracking-wider font-bold">
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
          
          <div className="flex items-center text-gray-500 my-1 px-3">
            <Scissors className="w-3 h-3 mr-2"/>
            <p className="text-[8px]">इस भाग को काट लें / Cut along this line</p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

    