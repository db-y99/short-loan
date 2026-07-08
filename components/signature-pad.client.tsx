"use client";

import { forwardRef } from "react";
import SignatureCanvas from "react-signature-canvas";

const SIGNATURE_PEN_COLOR = "#111827";
const SIGNATURE_BG_COLOR = "#ffffff";

type TProps = {
  heightClass?: string;
  className?: string;
};

const SignaturePad = forwardRef<SignatureCanvas, TProps>(
  ({ heightClass = "h-48", className = "" }, ref) => (
    <div
      className={`border-2 border-dashed border-default-300 rounded-lg bg-white overflow-hidden ${className}`}
    >
      <SignatureCanvas
        ref={ref}
        penColor={SIGNATURE_PEN_COLOR}
        backgroundColor={SIGNATURE_BG_COLOR}
        canvasProps={{
          className: `w-full ${heightClass} cursor-crosshair`,
          style: { backgroundColor: SIGNATURE_BG_COLOR },
        }}
      />
    </div>
  ),
);

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;
