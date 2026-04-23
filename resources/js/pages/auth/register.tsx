import { Form, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { login } from '@/routes';
import { store } from '@/routes/register';

function usePasswordStrength(password: string) {
    return useMemo(() => {
        let score = 0;

        if (password.length >= 8) {
score++;
}

        if (/[A-Z]/.test(password)) {
score++;
}

        if (/[a-z]/.test(password)) {
score++;
}

        if (/[0-9]/.test(password)) {
score++;
}

        if (/[^A-Za-z0-9]/.test(password)) {
score++;
}

        const percentage = (score / 5) * 100;

        let label: string;
        let color: string;

        if (score <= 1) {
            label = 'Lemah';
            color = '#ef4444';
        } else if (score <= 3) {
            label = 'Sedang';
            color = '#eab308';
        } else {
            label = 'Kuat';
            color = '#84B59F';
        }

        return { score, percentage, label, color };
    }, [password]);
}

export default function Register() {
    const [password, setPassword] = useState('');
    const strength = usePasswordStrength(password);

    return (
        <>
            <Head title="Daftar" />

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
            >
                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Nama lengkap"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Alamat email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="email@contoh.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <TooltipProvider>
                                        <div className="flex items-center gap-1.5">
                                            <Label htmlFor="password">
                                                Kata sandi
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger
                                                    type="button"
                                                    tabIndex={-1}
                                                >
                                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="right"
                                                    className="max-w-xs"
                                                >
                                                    <p className="font-medium">
                                                        Persyaratan kata sandi:
                                                    </p>
                                                    <ul className="mt-1 list-inside list-disc text-xs">
                                                        <li>
                                                            Minimal 8 karakter
                                                        </li>
                                                        <li>Huruf besar</li>
                                                        <li>Huruf kecil</li>
                                                        <li>Angka</li>
                                                        <li>
                                                            Karakter spesial
                                                        </li>
                                                    </ul>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Kata sandi"
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                    {password.length > 0 && (
                                        <div className="mt-1 space-y-1.5">
                                            <Progress
                                                value={strength.percentage}
                                                className="h-1.5"
                                                style={
                                                    {
                                                        '--progress-color':
                                                            strength.color,
                                                    } as React.CSSProperties
                                                }
                                            />
                                            <p
                                                className="text-xs font-medium"
                                                style={{
                                                    color: strength.color,
                                                }}
                                            >
                                                Kekuatan: {strength.label}
                                            </p>
                                        </div>
                                    )}
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi kata sandi
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Konfirmasi kata sandi"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full bg-gradient-to-r from-[#50808E] to-[#69A297] text-white shadow-md shadow-[#50808E]/20 transition-all hover:from-[#50808E]/90 hover:to-[#69A297]/90 hover:shadow-lg"
                                    tabIndex={5}
                                    data-test="register-user-button"
                                >
                                    {processing && <Spinner />}
                                    Buat akun
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="relative flex items-center">
                                    <Separator className="flex-1" />
                                    <span className="mx-3 text-xs text-muted-foreground">
                                        atau
                                    </span>
                                    <Separator className="flex-1" />
                                </div>

                                <div className="text-center text-sm text-muted-foreground">
                                    Sudah punya akun?{' '}
                                    <TextLink href={login()} tabIndex={6}>
                                        Masuk
                                    </TextLink>
                                </div>
                            </div>
                        </>
                    )}
                </Form>
            </motion.div>
        </>
    );
}

Register.layout = {
    title: 'Buat akun baru',
    description: 'Isi data di bawah ini untuk membuat akun Anda',
};
