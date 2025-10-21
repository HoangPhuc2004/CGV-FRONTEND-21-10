import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from './AuthContext';
import { Mail, Lock, User } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
        const data = await login(loginEmail, loginPassword);
        if (data.token) {
            onOpenChange(false);
        } else {
            setError(data.message || 'Đăng nhập thất bại.');
        }
    } catch (err) {
        setError('Đã có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (registerPassword !== registerConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    try {
        const data = await register(registerName, registerEmail, registerPassword);
        if (data.user) {
            setSuccess('Đăng ký thành công! Vui lòng chuyển qua tab Đăng nhập.');
            setActiveTab('login');
        } else {
            setError(data.message || 'Đăng ký thất bại.');
        }
    } catch (err) {
        setError('Đã có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chào mừng đến với CGV</DialogTitle>
          <DialogDescription>
            Đăng nhập hoặc tạo tài khoản để có trải nghiệm tốt nhất
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="login">Đăng Nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng Ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Login Form Fields */}
              {error && activeTab === 'login' && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Đăng Nhập</Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Register Form Fields */}
              {error && activeTab === 'register' && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Đăng Ký</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}