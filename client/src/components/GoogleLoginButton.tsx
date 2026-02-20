import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";

type Props = {
  onSuccessRedirect?: string; // e.g. "/dashboard"
  onMessage?: (msg: { type: "success" | "error"; text: string }) => void;
};

const GoogleLoginButton: React.FC<Props> = ({ onSuccessRedirect = "/dashboard", onMessage }) => {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const credential = credentialResponse.credential;
          if (!credential) {
            onMessage?.({ type: "error", text: "Google did not return a credential." });
            return;
          }

          const res = await api.post("/api/users/auth/google", { credential });
          const { token, user } = res.data;

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          onMessage?.({ type: "success", text: "Google login successful." });
          window.location.href = onSuccessRedirect;
        } catch (err: any) {
          onMessage?.({
            type: "error",
            text: err?.response?.data?.message || "Google login failed",
          });
        }
      }}
      onError={() => onMessage?.({ type: "error", text: "Google login failed" })}
      useOneTap={false}
    />
  );
};

export default GoogleLoginButton;