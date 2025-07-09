"use client";

import React, { useState, useEffect } from "react";
import { loginAction } from "@/app/actions/auth";
import { emailSchema, passwordSchema, sanitizeInput, detectInjectionAttempt } from "@/lib/security";

type LoginErrorType = {
  errorTitle: string;
  errorMessage: string;
  isSecurityError?: boolean;
  rateLimited?: boolean;
};

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loginError, setLoginError] = useState<LoginErrorType | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [attempts, setAttempts] = useState(0);

  // Limpeza de erro ao modificar campos
  useEffect(() => {
    if (loginError) {
      setLoginError(null);
    }
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors({});
    }
  }, [formData.email, formData.senha]);

  const validateEmailField = () => {
    try {
      emailSchema.parse(formData.email);
      return true;
    } catch {
      return false;
    }
  };

  const validatePasswordField = () => {
    try {
      passwordSchema.parse(formData.senha);
      return true;
    } catch {
      return false;
    }
  };

  const isValidEmail = () => {
    if (!formData.email) return false;
    return validateEmailField();
  };

  const isValidPassword = () => {
    if (!formData.senha) return false;
    return validatePasswordField();
  };

  const alternarVisibilidadeSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  const handleEmailChange = (e: any) => {
    const value = sanitizeInput(e.target.value);
    
    // Detectar tentativas de injeção
    if (detectInjectionAttempt(value)) {
      setLoginError({
        errorTitle: "Entrada inválida",
        errorMessage: "Caracteres inválidos detectados no email",
        isSecurityError: true
      });
      return;
    }

    setFormData((prev: any) => ({ ...prev, email: value }));
  };

  const handlePasswordChange = (e: any) => {
    const value = e.target.value;
    
    // Limitar tamanho da senha para prevenir ataques
    if (value.length > 128) {
      setFieldErrors((prev: any) => ({ 
        ...prev, 
        senha: "Senha muito longa" 
      }));
      return;
    }

    setFormData((prev: any) => ({ ...prev, senha: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verificar limite de tentativas
    if (attempts >= 5) {
      setLoginError({
        errorTitle: "Muitas tentativas",
        errorMessage: "Muitas tentativas de login. Recarregue a página para tentar novamente.",
        rateLimited: true
      });
      return;
    }

    // Validação cliente-side
    const emailValid = isValidEmail();
    const passwordValid = isValidPassword();

    if (!emailValid || !passwordValid) {
      const errors: {[key: string]: string} = {};
      if (!emailValid && formData.email) {
        errors.email = "Email inválido";
      }
      if (!passwordValid && formData.senha) {
        errors.senha = "Senha deve ter pelo menos 8 caracteres, uma maiúscula, uma minúscula e um número";
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setAttempts((prev: number) => prev + 1);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.senha);

      const result = await loginAction(formDataToSend);

      if (result && !result.success) {
        if (result.rateLimited) {
          setLoginError({
            errorTitle: "Limite excedido",
            errorMessage: result.error || "Muitas tentativas de login",
            rateLimited: true
          });
        } else if (result.securityViolation) {
          setLoginError({
            errorTitle: "Erro de segurança",
            errorMessage: "Dados inválidos detectados",
            isSecurityError: true
          });
        } else {
          setLoginError({
            errorTitle: "Dados incorretos",
            errorMessage: result.error || "Email ou senha incorretos. Verifique seus dados e tente novamente.",
          });
        }

        if (result.fieldErrors) {
          const errors: {[key: string]: string} = {};
          result.fieldErrors.forEach((error: any) => {
            errors[error.path[0]] = error.message;
          });
          setFieldErrors(errors);
        }
      }
    } catch (error) {
      setLoginError({
        errorTitle: "Erro de conexão",
        errorMessage: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName: string, isValid: boolean) => {
    let baseClass = "form-input";
    
    if (fieldErrors[fieldName] || (loginError?.isSecurityError && fieldName === 'email')) {
      baseClass += " error";
    } else if (formData[fieldName as keyof typeof formData] && !isValid) {
      baseClass += " error";
    }
    
    return baseClass;
  };

  const getLabelClassName = (fieldName: string, isValid: boolean) => {
    let baseClass = "floating-label";
    
    if (fieldErrors[fieldName] || 
        (loginError?.isSecurityError && fieldName === 'email') ||
        (formData[fieldName as keyof typeof formData] && !isValid)) {
      baseClass += " text-red-500";
    }
    
    return baseClass;
  };

  return (
    <>
      <style jsx>{`
        .input-container {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          z-index: 2;
          pointer-events: none;
        }

        .check-icon {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          z-index: 2;
        }

        .form-input {
          height: 56px !important;
          padding-left: 40px !important;
          padding-right: 40px !important;
          width: 100%;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          color: #111827;
          background-color: #fff;
        }

        .form-input:focus {
          outline: none !important;
          border-color: #1f45ff !important;
          border-width: 2px !important;
          box-shadow: 0 0 0 4px rgba(31, 69, 255, 0.1) !important;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .floating-label {
          position: absolute;
          left: 40px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: #161616;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          background-color: transparent;
          padding: 0;
          font-weight: normal;
          z-index: 5;
        }

        .form-input:focus ~ .floating-label,
        .form-input:not(:placeholder-shown) ~ .floating-label {
          top: -1px;
          left: 15px;
          transform: translateY(-10px);
          font-size: 12px;
          font-weight: 600;
          color: #1f45ff;
          background-color: white;
          padding: 0 8px;
          border-radius: 4px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-input.error {
          border-color: #ef4444 !important;
        }

        .form-input.error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
        }

        .text-red-500 {
          color: #ff7387 !important;
        }

        .btn-primary {
          width: 100%;
          height: 58px;
          font-size: 20px;
          background-color: #2563eb;
          color: white;
          border-radius: 12px;
          font-weight: 500;
          transition: background-color 0.2s;
          cursor: pointer;
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #1d4ed8;
        }

        .btn-primary:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .form-input.error ~ .floating-label.text-red-500 {
          color: #ff7387 !important;
        }

        .security-warning {
          background-color: #fef2f2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .rate-limit-warning {
          background-color: #fef3c7;
          border: 1px solid #fcd34d;
          color: #d97706;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Alertas de segurança */}
        {loginError?.isSecurityError && (
          <div className="security-warning">
            <strong>⚠️ Aviso de Segurança:</strong> {loginError.errorMessage}
          </div>
        )}

        {loginError?.rateLimited && (
          <div className="rate-limit-warning">
            <strong>🔒 Limite de Tentativas:</strong> {loginError.errorMessage}
          </div>
        )}

        {/* Email de cadastro */}
        <div className="form-group">
          <div className="input-container">
            <div className="input-icon">
              <img src="/svg/email_icon.svg" alt="Email" className="w-5 h-5" />
            </div>
            <input
              id="email-input"
              value={formData.email}
              onChange={handleEmailChange}
              type="email"
              className={getInputClassName('email', isValidEmail())}
              placeholder=" "
              required
              maxLength={254}
              autoComplete="email"
            />
            <label
              htmlFor="email-input"
              className={getLabelClassName('email', isValidEmail())}
            >
              {fieldErrors.email || 
               (loginError?.isSecurityError ? "Email com caracteres inválidos" : 
                loginError?.errorMessage && !loginError.rateLimited ? loginError.errorMessage : 
                "Email de cadastro")}
            </label>
            {formData.email && isValidEmail() && !fieldErrors.email && (
              <div className="check-icon">
                <img
                  src="/svg/checkmark_success.svg"
                  alt="Sucesso"
                  className="w-5 h-5"
                />
              </div>
            )}
            {(formData.email && !isValidEmail()) || fieldErrors.email && (
              <div className="check-icon">
                <img
                  src="/svg/checkmark_error.svg"
                  alt="Erro"
                  className="w-5 h-5"
                />
              </div>
            )}
          </div>
          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Senha de acesso */}
        <div className="form-group">
          <div className="input-container">
            <div className="input-icon">
              <img src="/svg/lock_icon.svg" alt="Senha" className="w-5 h-5" />
            </div>
            <input
              id="senha-input"
              value={formData.senha}
              onChange={handlePasswordChange}
              type={mostrarSenha ? "text" : "password"}
              className={getInputClassName('senha', isValidPassword())}
              placeholder=" "
              required
              maxLength={128}
              autoComplete="current-password"
            />
            <label 
              htmlFor="senha-input" 
              className={getLabelClassName('senha', isValidPassword())}
            >
              {fieldErrors.senha || "Senha de acesso"}
            </label>
            <div
              className="check-icon cursor-pointer"
              onClick={alternarVisibilidadeSenha}
            >
              <img
                src={mostrarSenha ? "/svg/eye_off.svg" : "/svg/eye.svg"}
                alt="Mostrar/Ocultar senha"
                className="w-5 h-5"
              />
            </div>
          </div>
          {fieldErrors.senha && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.senha}</p>
          )}
        </div>

        {/* Loading ou Botão de login */}
        {loading ? (
          <span className="flex items-center justify-center">
            <img
              src="/loading.gif"
              alt="Carregando"
              className="w-10 h-10 mr-2"
            />
          </span>
        ) : (
          <span>
            <button
              type="submit"
              className="btn-primary"
              disabled={
                loading || 
                !isValidEmail() || 
                !isValidPassword() || 
                attempts >= 5 ||
                loginError?.rateLimited
              }
            >
              {attempts >= 5 ? "Muitas tentativas" : 
               loginError?.rateLimited ? "Bloqueado temporariamente" :
               "Acessar minha conta"}
            </button>
          </span>
        )}

        {/* Contador de tentativas */}
        {attempts > 0 && attempts < 5 && (
          <p className="text-sm text-gray-600 text-center">
            Tentativas: {attempts}/5
          </p>
        )}
      </form>
    </>
  );
}
