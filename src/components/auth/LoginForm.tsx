'use client';

import { loginAction } from '@/app/actions/auth';
import { useState } from 'react';

type LoginErrorType = {
  errorTitle: string;
  errorMessage: string;
};

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });

  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loginError, setLoginError] = useState<LoginErrorType | null>(null);

  const isValidEmail = () => {
    if (!formData.email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email);
  };

  const alternarVisibilidadeSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidEmail() || !formData.senha) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.senha);

      const result = await loginAction(formDataToSend);
      console.log('result', result);

      if (result && !result.success) {
        console.log('result', result);
        if (result.status === 403) {
          setLoginError({
            errorTitle: 'Usuário inativo',
            errorMessage: 'Seu usuário está inativo. Por favor, contate o suporte.',
          });
        } else {
          setLoginError({
            errorTitle: 'Dados incorretos',
            errorMessage: 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
          });
        }
      }
    } catch {
      setLoginError({
        errorTitle: 'Erro de conexão',
        errorMessage: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
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
      `}</style>

      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* Email de cadastro */}
        <div className='form-group'>
          <div className='input-container'>
            <div className='input-icon'>
              <img src='/svg/email_icon.svg' alt='Email' className='w-5 h-5' />
            </div>
            <input
              id='email-input'
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              type='email'
              className={`form-input ${formData.email && !isValidEmail() ? 'error' : ''}`}
              placeholder=' '
              required
            />
            <label
              htmlFor='email-input'
              className={`floating-label ${(formData.email && !isValidEmail()) || loginError ? 'text-red-500' : ''}`}
            >
              {loginError ? loginError.errorMessage : 'Email de cadastro'}
            </label>
            {formData.email && isValidEmail() && (
              <div className='check-icon'>
                <img src='/svg/checkmark_success.svg' alt='Sucesso' className='w-5 h-5' />
              </div>
            )}
            {formData.email && !isValidEmail() && (
              <div className='check-icon'>
                <img src='/svg/checkmark_error.svg' alt='Erro' className='w-5 h-5' />
              </div>
            )}
          </div>
        </div>

        {/* Senha de acesso */}
        <div className='form-group'>
          <div className='input-container'>
            <div className='input-icon'>
              <img src='/svg/lock_icon.svg' alt='Senha' className='w-5 h-5' />
            </div>
            <input
              id='senha-input'
              value={formData.senha}
              onChange={e => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              type={mostrarSenha ? 'text' : 'password'}
              className='form-input'
              placeholder=' '
              required
            />
            <label htmlFor='senha-input' className='floating-label'>
              Senha de acesso
            </label>
            <div className='check-icon cursor-pointer' onClick={alternarVisibilidadeSenha}>
              <img
                src={mostrarSenha ? '/svg/eye_off.svg' : '/svg/eye.svg'}
                alt='Mostrar/Ocultar senha'
                className='w-5 h-5'
              />
            </div>
          </div>
        </div>

        {/* Loading ou Botão de login */}
        {loading ? (
          <span className='flex items-center justify-center'>
            <img src='/loading.gif' alt='Carregando' className='w-10 h-10 mr-2' />
          </span>
        ) : (
          <span>
            <button type='submit' className='btn-primary' disabled={loading || !isValidEmail() || !formData.senha}>
              Acessar minha conta
            </button>
          </span>
        )}
      </form>
    </>
  );
}
