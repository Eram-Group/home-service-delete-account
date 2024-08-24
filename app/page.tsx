"use client";

import { cn } from "@/lib/utils";
import { OTPInput, SlotProps } from "input-otp";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import MyAlertDialog from "./MyAlertDialog";

type Step = "enter-phone-number" | "enter-otp" | "delete-account" | "done";
type Country = {
  flag: string;
  name: string;
  code: string;
};
const countries: Country[] = [
  { flag: "🇸🇦", name: "Saudi Arabia", code: "+966" },
  { flag: "🇦🇪", name: "United Arab Emirates", code: "+971" },
  { flag: "🇶🇦", name: "Qatar", code: "+974" },
  { flag: "🇰🇼", name: "Kuwait", code: "+965" },
  { flag: "🇴🇲", name: "Oman", code: "+968" },
  { flag: "🇧🇭", name: "Bahrain", code: "+973" },
  { flag: "🇪🇬", name: "Egypt", code: "+20" },
];
type CountryCode = (typeof countries)[number]["code"];

export default function Home() {
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error !== "") {
      setAlertDialogOpen(true);
    }
  }, [error]);

  const [countryCode, setCountryCode] = useState<CountryCode>("+966");
  const [phoneNumber, setPhoneNumber] = useState("");

  const fullPhoneNumber = `${countryCode}${phoneNumber}`;

  const [otp, setOtp] = useState("");

  const [verificationId, setVerificationId] = useState("");
  const accessTokenRef = useRef(null);

  const [step, setStep] = useState<Step>("enter-phone-number");

  return (
    <>
      <div className="flex flex-col justify-center gap-4 max-w-sm">
        <Image
          src="/home service logo.png"
          alt="Home Service Logo"
          width={100}
          height={100}
        />
        <h1 className="text-2xl font-bold flex gap-2">
          Delete My Account
          <span role="img" aria-label="delete">
            🗑
          </span>
        </h1>

        {step === "enter-phone-number" && (
          <EnterPhoneNumber
            setError={setError}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            fullPhoneNumber={fullPhoneNumber}
            setVerificationId={setVerificationId}
            setStep={setStep}
          />
        )}
        {step === "enter-otp" && (
          <EnterOTP
            setError={setError}
            otp={otp}
            setOtp={setOtp}
            fullPhoneNumber={fullPhoneNumber}
            verificationId={verificationId}
            accessTokenRef={accessTokenRef}
            setStep={setStep}
          />
        )}
        {step === "delete-account" && (
          <DeleteAccount
            setError={setError}
            accessTokenRef={accessTokenRef}
            setStep={setStep}
          />
        )}
        {step === "done" && (
          <div className="text-slate-400 flex items-center gap-2 stroke-white">
            <div className="flex justify-center items-center p-1 bg-green-500 rounded-full">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13L9 17L19 7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-inherit"> Account deleted successfully!</span>
          </div>
        )}
      </div>
      <MyAlertDialog
        error={error}
        open={alertDialogOpen}
        close={() => {
          setAlertDialogOpen(false);
          setError("");
        }}
      />
    </>
  );
}

function EnterPhoneNumber({
  setError,
  countryCode,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  fullPhoneNumber,
  setVerificationId,
  setStep,
}: {
  setError: Dispatch<SetStateAction<string>>;
  countryCode: CountryCode;
  setCountryCode: Dispatch<SetStateAction<CountryCode>>;
  phoneNumber: string;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  fullPhoneNumber: string;
  setVerificationId: Dispatch<SetStateAction<string>>;
  setStep: Dispatch<SetStateAction<Step>>;
}) {
  const sendOTP = async () => {
    const response = await fetch(
      "https://home-servicesa.com/api/v1/send-otp/",
      {
        method: "POST",
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      setError("Failed to send OTP");
      return;
    }

    const data = await response.json();

    const verificationId = `${data.verification_id}`;
    setVerificationId(verificationId);

    setStep("enter-otp");
  };

  return (
    <>
      <p className="text-slate-400">
        Enter your phone number to delete your account. We will send you an OTP
        to verify your identity
      </p>
      <div className="flex items-center border-2 border-slate-200 rounded-lg">
        <select
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value as CountryCode);
          }}
          className="p-4 rounded-l-lg border-r-2 border-slate-200"
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.code}
            </option>
          ))}
        </select>
        <input
          type="tel" // Use type="tel" for phone number input
          pattern="[0-9]{10}" // Specify a pattern for valid phone numbers
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
          }}
          className="w-full p-4 rounded-r-lg"
        />
      </div>
      <button
        onClick={() => {
          sendOTP();
        }}
        className="py-4 px-6 bg-blue-100 text-blue-500 rounded-lg w-full flex items-center justify-center gap-2"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_92_7185)">
            <path
              d="M22.1525 3.55322L11.1772 21.0044L9.50686 12.4078L2.00002 7.89796L22.1525 3.55322Z"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.45557 12.4436L22.1524 3.55317"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_92_7185">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-inherit">Send OTP</span>
      </button>
    </>
  );
}

function EnterOTP({
  setError,
  otp,
  setOtp,
  fullPhoneNumber,
  verificationId,
  accessTokenRef,
  setStep,
}: {
  setError: Dispatch<SetStateAction<string>>;
  otp: string;
  setOtp: Dispatch<SetStateAction<string>>;
  fullPhoneNumber: string;
  verificationId: string;
  accessTokenRef: React.MutableRefObject<string | null>;
  setStep: Dispatch<SetStateAction<Step>>;
}) {
  const verify = async () => {
    const response = await fetch(
      "https://home-servicesa.com/api/v1/customer-verify-otp/",
      {
        method: "POST",
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          otp,
          verification_id: verificationId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      setError("Failed to verify OTP");
      return;
    }

    const data = await response.json();

    const accessToken = `${data.access_token}`;
    accessTokenRef.current = accessToken;

    setStep("delete-account");
  };

  return (
    <>
      <p className="text-slate-400">
        We have sent an OTP to{" "}
        <strong className="text-inherit">{fullPhoneNumber}</strong>. Please
        enter the OTP to verify
      </p>
      <OTPInput
        value={otp}
        onChange={setOtp}
        maxLength={4}
        containerClassName="group flex w-full items-center has-[:disabled]:opacity-30"
        render={({ slots }) => (
          <div className="w-full grid grid-cols-4 gap-2">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />
      <button
        onClick={verify}
        className="py-4 px-6 bg-blue-100 text-blue-500 rounded-lg w-full flex items-center justify-center gap-2"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 13L9 17L19 7"
            stroke="#3B82F6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-inherit">Verify</span>
      </button>
    </>
  );
}

// Feel free to copy. Uses @shadcn/ui tailwind colors.
function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "relative w-full h-16",
        "flex items-center justify-center",
        "text-2xl",
        "border-2 border-slate-200 rounded-lg",
        "outline outline-0 outline-slate-200",
        { "outline-2 outline-blue-500": props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

// You can emulate a fake textbox caret!
function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div className="w-0.5 h-8 bg-blue-500" />
    </div>
  );
}

function DeleteAccount({
  setError,
  accessTokenRef,
  setStep,
}: {
  setError: Dispatch<SetStateAction<string>>;
  accessTokenRef: React.MutableRefObject<string | null>;
  setStep: Dispatch<SetStateAction<Step>>;
}) {
  const router = useRouter();

  const deleteAccount = async () => {
    const response = await fetch(
      "https://home-servicesa.com/api/v1/delete-user/",
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessTokenRef.current}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      setError("Failed to delete account");
      return;
    }

    setStep("done");
  };

  return (
    <>
      <p className="text-slate-400">
        You are about to delete your account. This action is irreversible. Are
        you sure you want to proceed?
      </p>
      <div className="flex justify-center items-center gap-2 w-full">
        <button
          onClick={() => {
            deleteAccount();
          }}
          className="bg-red-500 text-white p-4 rounded-lg w-full text-nowrap flex items-center justify-center gap-2"
        >
          Yes, delete my account
        </button>
        <button
          onClick={() => {
            router.refresh();
          }}
          className="bg-blue-100 text-blue-500 p-4 rounded-lg w-full text-nowrap flex items-center justify-center gap-2"
        >
          No, go back
        </button>
      </div>
    </>
  );
}
