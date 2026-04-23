import { Form, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Masuk" />

            {status && (
                <Alert className="border-[#84B59F]/40 bg-[#A3C9A8]/10">
                    <CheckCircle2 className="h-4 w-4 text-[#69A297]" />
                    <AlertDescription className="text-[#50808E]">
                        {status}
                    </AlertDescription>
                </Alert>
            )}

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
            >
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Alamat email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@contoh.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">
                                            Kata sandi
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm"
                                                tabIndex={5}
                                            >
                                                Lupa kata sandi?
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Kata sandi"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <TooltipProvider>
                                    <div className="flex items-center space-x-3">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id="remember"
                                                        name="remember"
                                                        tabIndex={3}
                                                    />
                                                    <Label
                                                        htmlFor="remember"
                                                        className="cursor-pointer"
                                                    >
                                                        Ingat saya
                                                    </Label>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>
                                                    Tetap masuk selama 30 hari
                                                    di perangkat ini
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TooltipProvider>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full bg-gradient-to-r from-[#50808E] to-[#69A297] text-white shadow-md shadow-[#50808E]/20 transition-all hover:from-[#50808E]/90 hover:to-[#69A297]/90 hover:shadow-lg"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Masuk
                                </Button>
                            </div>

                            {canRegister && (
                                <div className="space-y-4">
                                    <div className="relative flex items-center">
                                        <Separator className="flex-1" />
                                        <span className="mx-3 text-xs text-muted-foreground">
                                            atau
                                        </span>
                                        <Separator className="flex-1" />
                                    </div>

                                    <div className="text-center text-sm text-muted-foreground">
                                        Belum punya akun?{' '}
                                        <TextLink
                                            href={register()}
                                            tabIndex={5}
                                        >
                                            Daftar
                                        </TextLink>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Form>
            </motion.div>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke akun Anda',
    description: 'Masukkan email dan kata sandi Anda untuk melanjutkan',
};
