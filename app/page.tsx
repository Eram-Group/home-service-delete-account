"use client";

import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useRef, useState } from "react";

type Step = "enter-phone-number" | "enter-otp" | "delete-account" | "done";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const otpRef = useRef(null);
  const [verificationId, setVerificationId] = useState("");
  const accessTokenRef = useRef(null);

  const [step, setStep] = useState<Step>("enter-phone-number");

  return (
    <div>
      {step === "enter-phone-number" && (
        <EnterPhoneNumber
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          setVerificationId={setVerificationId}
          setStep={setStep}
        />
      )}
      {step === "enter-otp" && (
        <EnterOTP
          otpRef={otpRef}
          phoneNumber={phoneNumber}
          verificationId={verificationId}
          accessTokenRef={accessTokenRef}
          setStep={setStep}
        />
      )}
      {step === "delete-account" && (
        <DeleteAccount accessTokenRef={accessTokenRef} setStep={setStep} />
      )}
      {step === "done" && (
        <div>
          <h1>Account deleted successfully!</h1>
        </div>
      )}
    </div>
  );
}

function EnterPhoneNumber({
  phoneNumber,
  setPhoneNumber,
  setVerificationId,
  setStep,
}: {
  phoneNumber: string;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  setVerificationId: Dispatch<SetStateAction<string>>;
  setStep: Dispatch<SetStateAction<Step>>;
}) {
  const sendOTP = async () => {
    const response = await fetch(
      "https://home-servicesa.com/api/v1/send-otp/",
      {
        method: "POST",
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      alert("Failed to send OTP");
      return;
    }

    const data = await response.json();
    console.log(data);

    const verificationId = `${data.verification_id}`;
    setVerificationId(verificationId);

    setStep("enter-otp");
  };

  return (
    <div>
      <h1>Enter your phone number</h1>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => {
          setPhoneNumber(e.target.value);
        }}
      />
      <button
        onClick={() => {
          sendOTP();
        }}
      >
        Send OTP
      </button>
    </div>
  );
}

function EnterOTP({
  otpRef,
  phoneNumber,
  verificationId,
  accessTokenRef,
  setStep,
}: {
  otpRef: React.MutableRefObject<HTMLInputElement | null>;
  phoneNumber: string;
  verificationId: string;
  accessTokenRef: React.MutableRefObject<string | null>;
  setStep: Dispatch<SetStateAction<Step>>;
}) {
  const verify = async () => {
    const otp = otpRef.current?.value;

    console.log(otp, phoneNumber);

    const response = await fetch(
      "https://home-servicesa.com/api/v1/customer-verify-otp/",
      {
        method: "POST",
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp,
          verification_id: verificationId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      alert("Failed to verify OTP");
      return;
    }

    const data = await response.json();
    console.log(data);

    const accessToken = `${data.access_token}`;
    accessTokenRef.current = accessToken;

    setStep("delete-account");
  };

  return (
    <div>
      <h1>Enter the OTP</h1>
      <input type="text" ref={otpRef} />
      <button
        onClick={() => {
          verify();
        }}
      >
        Verify
      </button>
    </div>
  );
}

function DeleteAccount({
  accessTokenRef,
  setStep,
}: {
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
      alert("Failed to delete account");
      return;
    }

    const data = await response.json();
    console.log(data);

    setStep("done");
  };

  return (
    <div>
      <h1>Are you sure you want to delete your account?</h1>
      <button
        onClick={() => {
          deleteAccount();
        }}
      >
        Yes
      </button>
      <button
        onClick={() => {
          router.push("/");
        }}
      >
        No
      </button>
    </div>
  );
}
