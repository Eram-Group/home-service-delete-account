"use client";

import { cn } from "@/lib/utils";
import { OTPInput, SlotProps } from "input-otp";
import Image from "next/image";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import MyAlertDialog from "./MyAlertDialog";
import { MySelect } from "./MySelect";

type Step = "enter-phone-number" | "enter-otp" | "delete-account" | "done";
type Country = {
  flag: ReactNode;
  name: string;
  code: string;
};

const getImageUrl = (imageName: string) =>
  process.env.NODE_ENV === "production"
    ? `/home-service-delete-account/${imageName}`
    : `/${imageName}`;

const countries: Country[] = [
  {
    flag: (
      <Image
        alt=""
        width={24}
        height={24}
        src={getImageUrl("country/sau.png")}
      />
    ),
    name: "Saudi Arabia",
    code: "+966",
  },
  {
    flag: (
      <Image
        alt=""
        width={24}
        height={24}
        src={getImageUrl("country/uae.png")}
      />
    ),
    name: "United Arab Emirates",
    code: "+971",
  },
  {
    flag: (
      <Image
        alt=""
        width={24}
        height={24}
        src={getImageUrl("country/qtr.png")}
      />
    ),
    name: "Qatar",
    code: "+974",
  },
  {
    flag: (
      <Image
        alt=""
        width={24}
        height={24}
        src={getImageUrl("country/kuw.png")}
      />
    ),
    name: "Kuwait",
    code: "+965",
  },
  {
    flag: (
      <Image
        alt=""
        width={24}
        height={24}
        src={getImageUrl("country/oma.png")}
      />
    ),
    name: "Oman",
    code: "+968",
  },
  {
    flag: (
      <Image
        alt=""
        width={24}
        height={24}
        src={getImageUrl("country/bah.png")}
      />
    ),
    name: "Bahrain",
    code: "+973",
  },
  {
    flag: (
      <Image
        alt=""
        width={24}
        height={24}
        src={getImageUrl("country/egy.png")}
      />
    ),
    name: "Egypt",
    code: "+20",
  },
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

  useEffect(() => {
    if (step === "enter-phone-number") {
      setPhoneNumber("");
      setOtp("");
      setVerificationId("");
      accessTokenRef.current = null;
    }
  }, [step]);

  return (
    <>
      <div className="flex flex-col justify-center gap-4 max-w-sm">
        <Image
          src={getImageUrl("home service logo.png")}
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
  const [loading, setLoading] = useState(false);
  const sendOTP = async () => {
    setLoading(true);
    const response = await fetch(
      "https://homeservices.eramapps.com/api/v1/send-otp/",
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
    setLoading(false);

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
        to verify your identity.
      </p>
      <div className="flex items-center border-2 border-slate-200 rounded-lg h-14">
        <MySelect
          value={countryCode}
          onChange={(value) => {
            setCountryCode(value);
          }}
          placeholder="Select"
          label="Dial code"
          options={countries.map((country) => ({
            value: country.code,
            label: (
              <div className="flex items-center gap-2">
                {country.flag} {country.code}
              </div>
            ),
          }))}
        />
        <input
          type="tel" // Use type="tel" for phone number input
          pattern="[0-9]{10}" // Specify a pattern for valid phone numbers
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
          }}
          onKeyDown={(e) => {
            if (!loading && e.key === "Enter") sendOTP();
          }}
          className="px-4 w-full h-full rounded-r-lg focus:outline outline-2 outline-blue-500"
        />
      </div>
      <button
        onClick={() => {
          if (!loading) sendOTP();
        }}
        className={`py-4 px-6 ${
          loading ? "bg-slate-200" : "bg-blue-100"
        } text-blue-500 rounded-lg w-full flex items-center justify-center gap-2`}
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
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
          </>
        )}
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
  const [loading, setLoading] = useState(false);
  const verify = async () => {
    setLoading(true);
    const response = await fetch(
      "https://homeservices.eramapps.com/api/v1/customer-verify-otp/",
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
    setLoading(false);

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
        enter the OTP to verify.
      </p>
      <OTPInput
        value={otp}
        onChange={setOtp}
        onKeyDown={(e) => {
          if (!loading && otp.length === 4 && e.key === "Enter") verify();
        }}
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
        className={`py-4 px-6 ${
          loading ? "bg-slate-200" : "bg-blue-100"
        } text-blue-500 rounded-lg w-full flex items-center justify-center gap-2`}
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
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
          </>
        )}
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
  const [loading, setLoading] = useState(false);

  const deleteAccount = async () => {
    setLoading(true);
    const response = await fetch(
      "https://homeservices.eramapps.com/api/v1/delete-user/",
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessTokenRef.current}`,
          "Content-Type": "application/json",
        },
      }
    );
    setLoading(false);

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
          className={`${
            loading ? "bg-slate-200" : "bg-red-500"
          } text-white p-4 rounded-lg w-full text-nowrap flex items-center justify-center gap-2"`}
        >
          {loading ? <Spinner /> : "Yes, delete my account"}
        </button>
        <button
          onClick={() => {
            setStep("enter-phone-number");
          }}
          className="bg-blue-100 text-blue-500 p-4 rounded-lg w-full text-nowrap flex items-center justify-center gap-2"
        >
          No, go back
        </button>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-6 h-6 text-gray-200 animate-spin fill-blue-500"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
